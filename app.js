const express = require('express')
const path = require("path");
const axios = require("axios").default;
const HTMLParser = require('node-html-parser');
const fs = require('fs')
const bodyParser = require('body-parser')

const userPrifileFile = path.join(__dirname, './user_profile/userProfile.json')

fs.exists(userPrifileFile, (res) => {
    if (!res) {
        fs.mkdirSync(path.join(__dirname, './user_profile'))
        fs.writeFileSync(userPrifileFile,
            JSON.stringify({
                name: null,
                watchList: [],
                buyOrder: [],
                sellOrder: []
            }, null, 3)
        )
    }
})


const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const userProfileCheck = (req, res, next) => {

    let userData = JSON.parse(fs.readFileSync(userPrifileFile).toString())
    let keys = Object.keys(userData).length

    if (keys > 0) {
        return next()
    } else {
        res.sendFile(path.join(__dirname, '/public/registration.html'));
    }

}



app.get('/watchlist', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/watchlist.html')));
app.get('/', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/tradebook.html')));
// app.get('/', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/home.html')));
app.get('/:symbol', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/symbol.html')));

app.use(express.static(path.join(__dirname, '/public')));

app.post('/getUserData', (req, res) => res.status(200).json(getUserProfile()))

const getUserProfile = () => {
    let userData = JSON.parse(fs.readFileSync(userPrifileFile).toString())

    return userData
}

const returnAvlShare = (sid) => {

    let totalBuyQty = 0, totalSellQty = 0;
    let userData = getUserProfile()

    userData.buyOrder.map(x => {
        if (x.sid == sid) {
            totalBuyQty += x.qty
        }
    })

    userData.sellOrder.map(x => {
        if (x.sid == sid) {
            totalSellQty += x.qty
        }
    })

    let avlShare = totalBuyQty - totalSellQty

    return avlShare
}

const returnAvlQtyPerOrder = (trId) => {

    let userData = getUserProfile()
    let holdingQty = 0, soldQty = 0;

    userData.buyOrder.map(x => {
        if (x.id == trId) {
            holdingQty += x.qty
        }
    })

    userData.sellOrder.map(x => {
        if (x.buyOrderID == trId) {
            soldQty += x.qty
        }
    })

    let avlQtyPerOrder = holdingQty - soldQty

    return avlQtyPerOrder

}

// Start of Local file Handling

app.post('/updateName/:name', (req, res) => {

    const name = req.params.name
    let userData = getUserProfile()

    userData.name = name

    try {
        fs.writeFileSync(userPrifileFile, JSON.stringify(userData))
        res.status(200).json({ "message": "User Name Saved Successfully" })
    } catch (error) {
        res.status(501).json({ "error": "Something Went Wrong" })
    }

})

app.post('/buyShare/:symbol/:sid/:price/:qty/:date', (req, res) => {

    const name = req.params.symbol
    const sid = req.params.sid
    const price = req.params.price
    const qty = req.params.qty
    const date = req.params.date

    let data = {
        id: new Date().getTime(),
        symbol: name,
        sid: sid,
        date: parseInt(date),
        price: parseFloat(price),
        qty: parseInt(qty),
        type: 'BUY',
        status: 'PENDING'
    }

    let userData = getUserProfile()

    userData.buyOrder.push(data)

    userData.buyOrder.sort((a, b) => {
        return a.date - b.date
    })

    // res.status(200).json({ message: userData })

    try {
        fs.writeFileSync(userPrifileFile, JSON.stringify(userData, null, 4))
        res.status(200).json({ "message": "Data Written Successfully" })
    } catch (error) {
        res.status(501).json({ "error": 'Something Went Wrong' })
    }

})

app.post('/sellShare/:symbol/:sid/:qty/:price/:date', (req, res) => {

    const symbol = req.params.symbol
    const sid = req.params.sid
    const qty = req.params.qty
    const price = req.params.price
    const date = req.params.date

    let userData = getUserProfile()

    let avlShare = returnAvlShare(sid)
    let errors = {}

    let gotOrders = 0, remainningOrder = 0, tobePlaced = 0;

    if (parseInt(qty) > avlShare) errors.error = 'Sell Quantity Must be Lower Than Buy Available Share Qty'


    if (Object.keys(errors).length > 0) {
        console.log(errors)
        res.status(200).json(errors)
    } else {
        for (let i = 0; i < userData.buyOrder.length; i++) {
            if (userData.buyOrder[i].sid == sid && userData.buyOrder[i].status == 'PENDING') {
                if (gotOrders < qty) {

                    remainningOrder = qty - gotOrders

                    if (remainningOrder > returnAvlQtyPerOrder(userData.buyOrder[i].id)) {
                        tobePlaced = returnAvlQtyPerOrder(userData.buyOrder[i].id)
                    } else {
                        tobePlaced = remainningOrder
                    }

                    let data = {
                        id: new Date().getTime(),
                        buyOrderID: userData.buyOrder[i].id,
                        symbol: symbol,
                        sid: sid,
                        date: parseInt(date),
                        price: parseFloat(price),
                        qty: tobePlaced,
                        type: 'SELL',
                        status: 'COMPLETED'
                    }
                    userData.sellOrder.push(data)

                    let totalSellOrderMade = 0
                    userData.sellOrder.map(x => {
                        if (x.buyOrderID == userData.buyOrder[i].id) {
                            totalSellOrderMade += x.qty
                        }
                    })


                    if ((userData.buyOrder[i].qty - totalSellOrderMade) == 0) userData.buyOrder[i].status = 'COMPLETED'


                    gotOrders += tobePlaced

                }
            }
        }

        // res.status(200).json(userData)

        try {
            fs.writeFileSync(userPrifileFile, JSON.stringify(userData, null, 4))
            res.status(200).json({ message: "Data Written Successfully" })
        } catch (error) {
            console.log(error)
            res.status(501).json({ error: "Something Went Wrong" })
        }

    }

})

app.post('/deleteTrans/:id/:type', (req, res) => {

    const trID = parseInt(req.params.id)
    const type = req.params.type

    let userData = getUserProfile()
    let buyTrns = userData.buyOrder
    let sellTrns = userData.sellOrder

    if (type == 'BUY') {
        for (let i = 0; i < buyTrns.length; i++) {
            if (buyTrns[i].id == trID) {
                buyTrns.splice(i, 1)
                let j = 0;
                while (j < sellTrns.length) {
                    if (sellTrns[j].buyOrderID == trID) {
                        sellTrns.splice(j, 1)
                    } else {
                        i++;
                    }
                }

            }
        }

    } else if (type == 'SELL') {
        for (let i = 0; i < sellTrns.length; i++) {
            if (sellTrns[i].id == trID) {
                for (let j = 0; j < buyTrns.length; j++) {
                    if (buyTrns[j].id == sellTrns[i].buyOrderID) {
                        buyTrns[j].status = 'PENDING'
                    }
                }
                sellTrns.splice(i, 1)
            }
        }
    }

    userData.buyOrder = buyTrns
    userData.sellOrder = sellTrns

    try {
        fs.writeFileSync(userPrifileFile, JSON.stringify(userData, null, 4))
        res.status(200).json({ message: "Data Written Successfully" })
    } catch (error) {
        console.log(error)
        res.status(501).json({ error: "Something Went Wrong" })
    }

})


app.post('/removeSymbol/:symbol', (req, res) => {

    const symbol = req.params.symbol
    let userData = getUserProfile()
    let userAddedSymbols = userData.watchList || []


    let symbolIndex = userAddedSymbols.indexOf(symbol)
    let updatedWatchList = userAddedSymbols.splice(symbolIndex, 1)

    userAddedSymbols = []
    userAddedSymbols.push(userAddedSymbols)

    try {
        fs.writeFileSync(userPrifileFile, JSON.stringify(userData))
        res.status(200).json({ "message": "Watchlist Updated Successfully" })
    } catch (error) {
        res.status(501).json({ "error": "Something Went Wrong" })
    }

})

app.post('/addSymbol/:symbol', (req, res) => {

    const symbol = req.params.symbol
    let userData = getUserProfile()

    userWatchList = userData.watchList || []
    userWatchList.push(symbol)


    userData.watchList = userWatchList

    try {
        fs.writeFileSync(userPrifileFile, JSON.stringify(userData))
        res.status(200).json({ "message": "Watchlist Updated Successfully" })
    } catch (error) {
        res.status(501).json({ "error": "Something Went Wrong" })
    }


})

// End of Local file Handling

// NSE API START
app.post('/marketStatus', (req, res) => {
    axios.get('https://www.nseindia.com/api/marketStatus')
        .then(data => res.status(200).json(data.data))
        .catch((err) => res.status(500).json(err))
})

// NSE API ENDS


// Start Ticker Tape Datas

app.post('/batchTickerInfo/:symbol', (req, res) => {
    let symbols = req.params.symbol
    const url = `https://quotes-api.tickertape.in/quotes?sids=${symbols}`

    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/tickerInfo/:symbol', (req, res) => {
    let symbol = req.params.symbol
    const url = `https://api.tickertape.in/stocks/info/${symbol}`

    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/getMMI', (req, res) => {
    const url = 'https://api.tickertape.in/mmi/now'
    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/tickertapeShareHolding/:symbol', (req, res) => {
    let symbol = req.params.symbol
    const url = `https://api.tickertape.in/stocks/holdings/${symbol}`
    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/tickertapeChartData/:symbol', (req, res) => {
    let symbol = req.params.symbol
    const url = `https://api.tickertape.in/stocks/charts/inter/${symbol}?duration=max`
    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/tickertapeSummery/:symbol', (req, res) => {
    let symbol = req.params.symbol
    const url = `https://api.tickertape.in/stocks/summary/${symbol}`
    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/tickertapeSearch/:text', (req, res) => {
    let text = req.params.text
    const url = `https://api.tickertape.in/search?text=${text}&types=stock,brands,index,etf,mutualfund`
    axios.get(url)
        .then(data => {
            data.data.data.stocks.map(tickers => {
                if (tickers.ticker == text) {
                    res.status(200).json(tickers.sid)
                }
            })
        })
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/tickertapeSymbolSearch/:text', (req, res) => {

    let text = req.params.text
    const url = `https://api.tickertape.in/search?text=${text}`
    axios.get(url)
        .then(data => {
            res.status(200).json(data.data)
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ "error": "Failed to Fetch" })
        })
})

// End Ticker Tape



// Groww Data Start
app.post('/growwLiveData/:symbol', (req, res) => {

    const symbol = req.params.symbol.toUpperCase()
    const url = `https://groww.in/v1/api/stocks_data/v1/accord_points/exchange/NSE/segment/CASH/latest_prices_ohlc/${symbol}`
    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/growwChanrt/:symbol', (req, res) => {

    const symbol = req.params.symbol.toUpperCase()
    const url = `https://groww.in/v1/api/stocks_data/v1/accord_graph_points/exchange/NSE/segment/CASH/prices/${symbol}?&range=D`
    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/growwBatchData', (req, res) => {

    let payload = {
        exchange: "NSE",
        symbolList: req.body
    }
    let growwHeader = {
        method: 'post',
        // url: 'https://groww.in/v1/api/stocks_data/v1/accord_points/latest_prices_ohlc_batch',
        url: 'https://groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/NSE/latest_prices_batch',
        headers: { 'Content-Type': 'application/json' },
        data: payload
    }

    axios(growwHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

// Groww Data End

// Screener Data Start

app.post('/screenerData/:symbol', (req, res) => {

    const symbol = req.params.symbol.toUpperCase()
    const url = `https://www.screener.in/company/${symbol}/consolidated/`
    axios.get(url)
        .then(data => {
            let cashFlow = HTMLParser.parse(data.data).querySelector('#cash-flow table').innerHTML
            let balanceSheet = HTMLParser.parse(data.data).querySelector('#balance-sheet table').innerHTML
            let plStatement = HTMLParser.parse(data.data).querySelector('#profit-loss table').innerHTML
            let quaterResult = HTMLParser.parse(data.data).querySelector('#quarters table').innerHTML
            res.status(200).json(
                {
                    cashFlow: cashFlow,
                    balanceSheet: balanceSheet,
                    plStatement: plStatement,
                    quaterResult: quaterResult
                }
            )
        })
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

// Screner Data End

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server Running at http://localhost:${port}`)
})

