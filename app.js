const express = require('express')
const path = require("path");
const axios = require("axios").default;
const HTMLParser = require('node-html-parser');
const fs = require('fs')
const bodyParser = require('body-parser')

const BSESymbol = require('./bseEqComp');
const { json } = require('body-parser');

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
            })
        )
    }
})

const nseHeader = {
    headers: {
        "Cookie": `_ga=GA1.2.1950123595.1596210121; nsit=FuD3r0vdDYWDKoprJREZZhAq; _gid=GA1.2.642523135.1600712894; _gat_UA-143761337-1=1; ak_bmsc=FBA369276E8E2C48EA66945F9A89F15A312C75C4DE710000BCF0685FDC624F56~plACkJVdrMWYiFRNilAkfqnFz1KFZOira4Fiw2+uJiWXq4aOz3cW5cM5w/O8x6vAh+GhlQGVLgfmtZLty533OGA/hf/3Y1b5XACFrUdozXQHF/fCDWOyExTKavJeIdzdgS1mNfoWaFp6XKAIdE/fOO+lfMF+Cy/hFCses2U9J/3ZCWj+I7t8Lwz571n4yE+DS+qcdfWkztXq77rDVuEDnORWuiEKlNAw7uagar8oxk9+4Ubn3EsAVIOiarudWalO98; nseappid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcGkubnNlIiwiYXVkIjoiYXBpLm5zZSIsImlhdCI6MTYwMDcxMjkxNCwiZXhwIjoxNjAwNzE2NTE0fQ.pSHM1cUfeVoijeaN1vWNo44bpTQKe3vDqqNtC_eb7CA; RT="z=1&dm=nseindia.com&si=4cde98c3-a57b-4bc6-91e4-6fd3911e0770&ss=kfcv4kas&sl=1&tt=375&bcn=%2F%2F684d0d40.akstat.io%2F"; bm_sv=298FE54C429C2660F5C36F77D077B8A8~KT+KF6TqTcraUUgrnRd/bNWxTuwtbqd6I+Wk6fkhoMmGT2800v7fUuJGS0DoZVnRjwG9EBYD0k7RIkGY1Z9CByYQYoZci8aEeFyNjqd40s+G0MaD77XbwqXVHN+8KCay2tQreO2jnvVpB1oPJT71Erd5PIgLyhAuAEa1ncM3VJ8=`
    }
}

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
app.get('/tradebook', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/tradebook.html')));
app.get('/', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/home.html')));
app.get('/:symbol', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/symbol.html')));

app.use(express.static(path.join(__dirname, '/public')));

app.post('/getUserData', (req, res) => res.status(200).json(getUserProfile()))

const getUserProfile = () => {
    let userData = JSON.parse(fs.readFileSync(userPrifileFile).toString())

    return userData
}

const returnAvlShare = (symbol) => {

    let totalBuyQty = 0, totalSellQty = 0;
    let userData = getUserProfile()

    userData.buyOrder.map(x => {
        if (x.symbol == symbol) {
            totalBuyQty += x.qty
        }
    })

    userData.sellOrder.map(x => {
        if (x.symbol == symbol) {
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

app.post('/sellShare/:symbol/:qty/:price/:date', (req, res) => {

    const symbol = req.params.symbol
    const qty = req.params.qty
    const price = req.params.price
    const date = req.params.date

    let userData = getUserProfile()

    let avlShare = returnAvlShare(symbol)
    let errors = {}

    let gotOrders = 0, remainningOrder = 0, tobePlaced = 0;

    if (parseInt(qty) > avlShare) errors.error = 'Sell Quantity Must be Lower Than Buy Available Share Qty'


    if (Object.keys(errors).length > 0) {
        res.status(200).json(errors)
    } else {
        for (let i = 0; i < userData.buyOrder.length; i++) {
            if (userData.buyOrder[i].symbol == symbol && userData.buyOrder[i].status == 'PENDING') {
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

    console.log(trID)
    if (type == 'BUY') {
        for (let i = 0; i < buyTrns.length; i++) {
            if (buyTrns[i].id == trID) {
                buyTrns.splice(i, 1)
                for (let j = 0; j < sellTrns.length; j++) {
                    if (sellTrns[j].buyOrderID == trID) {
                        sellTrns.splice(j, 1)
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

    // res.status(200).json(userData)

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



app.post('/searchSymbol/:name', (req, res) => {

    const name = req.params.name.toLocaleUpperCase()
    axios.get(`https://www.nseindia.com/api/search/autocomplete?q=${name}`, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch((err) => res.status(500).json(err))

})


app.post('/bseSymbol/:name', (req, res) => {

    const name = req.params.name.toLocaleUpperCase()
    let companySymbols = BSESymbol.bseSymbolsObject.bseSymbolData
    let foundSymbols
    for (let i = 0; i < companySymbols.length; i++) {
        if (companySymbols[i].symbol.toLocaleUpperCase().includes(name)) {
            foundSymbols = companySymbols[i].securityCode
        }
    }

    res.status(200).json(foundSymbols)

})

app.post('/getBseData/:symbol', (req, res) => {

    let name = req.params.symbol.toLocaleUpperCase()
    let companySymbols = BSESymbol.bseSymbolsObject.bseSymbolData
    let foundSymbols
    for (let i = 0; i < companySymbols.length; i++) {
        if (companySymbols[i].symbol.toLocaleUpperCase().includes(name)) {
            foundSymbols = companySymbols[i].securityCode
        }
    }

    let url = `https://api.bseindia.com/BseIndiaAPI/api/ComHeader/w?quotetype=EQ&scripcode=${foundSymbols}&seriesid=`

    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Faild Get Data" }))
})

app.post('/marketStatus', (req, res) => {
    axios.get('https://www.nseindia.com/api/marketStatus')
        .then(data => res.status(200).json(data.data))
        .catch((err) => res.status(500).json(err))
})

app.post('/index/:sector', (req, res) => {

    let sector = (req.params.sector).toUpperCase()
    sector = sector.trim()

    axios.get(`https://www.nseindia.com/api/equity-stockIndices?index=${sector}`, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})
app.post('/allIndices', (req, res) => {

    axios.get(`https://www.nseindia.com/api/allIndices`, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})


// Get Individual Stock Data
app.post('/stock/:symbol', (req, res) => {
    let symb = (req.params.symbol).toUpperCase()

    symb = symb.replace('&', '%26')
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${symb}`
    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})

// Get Individual Stock Chart Data
app.post('/chartData/:symbol', (req, res) => {

    let symb = (req.params.symbol).toUpperCase()
    symb = symb.replace('&', '%26')


    const url = `https://www.nseindia.com/api/chart-databyindex?index=${symb}`
    // const url = `https://www.nse-india.com/api/chart-databyindex?index=${symb}&preopen=true`

    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})

// This may break after august as NSE1 is shutting down
app.get('/historicalData/:symbol/:fromDate/:toDate', (req, res) => {

    let symb = (req.params.symbol).toLowerCase()
    symb = symb.replace('&', '%26')
    let fromDate = req.params.fromDate
    let toDate = req.params.toDate

    const symbolCountUrl = `https://www1.nseindia.com/marketinfo/sym_map/symbolCount.jsp?symbol=${symb}`

    axios.get(symbolCountUrl)
        .then(data => {

            let symbolCount = data.data

            // Det format DD-MM-YYYY
            const url = `https://www1.nseindia.com/products/dynaContent/common/productsSymbolMapping.jsp?symbol=${symb}&segmentLink=3&symbolCount=${symbolCount}&series=EQ&dateRange=+&fromDate=${fromDate}&toDate=${toDate}&dataType=PRICEVOLUMEDELIVERABLE`

            axios.get(url, {
                headers: {
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Dest": "empty",
                    "Referer": "https://www1.nseindia.com/products/content/equities/equities/eq_security.htm",
                    "Host": "www1.nseindia.com",
                    "Connection": "keep-alive",
                    "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept": "*/*",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
                    "X-Requested-With": "XMLHttpRequest",
                    // "Cookie":`ak_bmsc=AD64DC6BCE60883E716EE288B89771E2312CD80DDF4B0000C6A2155F68A01720~plXefTvuBeeNTNGIRZefd4n9rgrY8tS7oh9+KBbZNl/9shF9qAZ51vZtYWcVxI0dje3kiFg5VRSXztcaswIYGi0DvOH0zVntbJWs+042Y1ggBi9wGlDw0UM4l9u6ibntr/5i84fYWcURPutEZqmWx4J/KJiURhRpAXKB5hjUNpTJLOtrhEOp76DPUAVPPp0Ux773RwRna+MqQBFwGWGq1nhdQNx3Ch2F1pqFowQbP0TmimxVSa3eSeL13UswjxcL1u; RT="z=1&dm=nseindia.com&si=0a1e1505-77a0-495f-a8f1-aef85fc082cc&ss=kcun08t3&sl=1&tt=3os&bcn=%2F%2F684fc538.akstat.io%2F&ld=4d7&nu=bc83bc72f32b478e63220cea705aa17a&cl=2iwg"; JSESSIONID=E2CF3EE22C5C58DB9F68926A8C5EAF2D.jvm1; NSE-TEST-1=1910513674.20480.0000; bm_sv=9AF917CFCF0FB72FDB88F816C4392171~azFoZyzYC4rPVmtxChkrzW0a0eiDOsR7447lI1BINjePA0NVZuqgyUij+YW/s0sc/3lGiFbYIrOcOSZtRPoxRsiKv60RB1Kd/emZ5ytdK20vTjMlOSuv7rxzpv/B494sJhVd/cPaYU7JVgndJT7jcgE1JiHRvs5jcfQLGr/Ku28=`

                }
            })
                .then(data => {

                    let htmlData = HTMLParser.parse(data.data).querySelector('#csvContentDiv').rawText
                    let arrayData = htmlData.split(':')

                    let headerData = arrayData.shift()

                    let newData = []

                    arrayData.map(values => newData.push(values.split(',')))


                    filteredData = []

                    newData.map(x => {
                        x = x.map(y => y.replace(/"/gi, ''))
                        x = x.map(y => y.trim())
                        filteredData.push(x)
                    })

                    filteredData.pop()


                    arrayJsonData = []

                    filteredData.map(x => {

                        let data = {
                            symbol: x[0],
                            series: x[1],
                            date: x[2],
                            preClose: x[3],
                            openPrice: x[4],
                            highPrice: x[5],
                            lowPrice: x[6],
                            lastPrice: x[7],
                            closePrice: x[8],
                            vwap: x[9],
                            ttq: x[10],
                            turnOver: x[11],
                            noOfTrade: x[12],
                            deliQty: x[13],
                            dliPercen: x[14]
                        }
                        arrayJsonData.push(data)

                    })

                    res.status(200).json(arrayJsonData)

                })
                .catch(err => {
                    res.status(500).json(err)
                })
        })
        .catch(err => console.log(err))



})

// historical data from NSE
app.post('/getHistoricalData/:symbol/:eq/:startDate/:endDate', (req, res) => {

    const symbol = req.params.symbol.toUpperCase().replace('&', '%26')
    const startDate = req.params.startDate
    const endDate = req.params.endDate
    const eqVal = req.params.eq || 'EQ'

    const url = `https://www.nseindia.com/api/historical/cm/equity?symbol=${symbol}&series=["${eqVal}"]&from=${startDate}&to=${endDate}`

    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

app.post('/marketDepth/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase().replace('&', '%26')
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${symbol}&section=trade_info`

    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))

})

app.post('/shareHoldingPattern/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase().replace('&', '%26')
    const url = `https://www.nseindia.com/api/corporate-share-holdings-master?index=equities&symbol=${symbol}`

    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))

})

app.post('/corporateActions/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase().replace('&', '%26')
    const url = `https://www.nseindia.com/api/corporates-corporateActions?index=equities&symbol=${symbol}`

    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))

})

app.post('/historicalFinancialResult/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase().replace('&', '%26')
    const url = `https://www.nseindia.com/api/results-comparision?symbol=${symbol}`

    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))

})

app.post('/gainers', (req, res) => {
    const url = 'https://www.nseindia.com/api/live-analysis-variations?index=gainers'

    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))

})

app.post('/loosers', (req, res) => {
    const url = 'https://www.nseindia.com/api/live-analysis-variations?index=loosers'

    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))

})

app.post('/activeByValue', (req, res) => {
    const url = 'https://www.nseindia.com/api/live-analysis-most-active-securities?index=value'
    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))

})

app.post('/activeByVolume', (req, res) => {
    const url = 'https://www.nseindia.com/api/live-analysis-most-active-securities?index=volume'
    axios.get(url, nseHeader)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))

})



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
    const url = `https://api.tickertape.in/search?text=${text}`
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
        url: 'https://groww.in/v1/api/stocks_data/v1/accord_points/latest_prices_ohlc_batch',
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

