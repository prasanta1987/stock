const express = require('express')
const path = require("path");
const axios = require("axios").default;
const HTMLParser = require('node-html-parser');
const fs = require('fs')

const NSESymbol = require('./indexSymbols')
const BSESymbol = require('./bseEqComp')

fs.exists('./user_profile/userProfile.json', (res) => {
    if (!res) {
        fs.mkdirSync('./user_profile')
        fs.writeFileSync('./user_profile/userProfile.json', '{}')
    }
})


// require('events').EventEmitter.defaultMaxListeners = 0

// https://www.nse-india.com/api/historical/cm/equity?symbol=SHREECEM&series=[%22EQ%22]&from=26-06-2018&to=26-06-2020
// https://www.nse-india.com/api/chart-databyindex?index=TATASTEELEQN&preopen=true

const app = express()


const userProfileCheck = (req, res, next) => {

    userData = JSON.parse(fs.readFileSync('./user_profile/userProfile.json').toString())
    let keys = Object.keys(userData).length

    if (keys > 0) {
        return next()
    } else {
        res.sendFile(path.join(__dirname, '/public/registration.html'));
    }

}



app.get('/', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));
app.get('/userProfile', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/registration.html')));
app.get('/historicalData', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/historicalData.html')));
app.get('/:symbol', userProfileCheck, (req, res) => res.sendFile(path.join(__dirname, '/public/symbol.html')));

app.use(express.static(path.join(__dirname, '/public')));

app.post('/getUserData', (req, res) => res.status(200).json(getUserProfile()))

const getUserProfile = () => {
    let userData = JSON.parse(fs.readFileSync('./user_profile/userProfile.json').toString())

    return userData
}



app.post('/updateName/:name', (req, res) => {

    const name = req.params.name
    let userData = getUserProfile()

    userData.name = name

    try {
        fs.writeFileSync('./user_profile/userProfile.json', JSON.stringify(userData))
        res.status(200).json({ "message": "User Name Saved Successfully" })
    } catch (error) {
        res.status(501).json({ "error": "Something Went Wrong" })
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
        fs.writeFileSync('./user_profile/userProfile.json', JSON.stringify(userData))
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
        fs.writeFileSync('./user_profile/userProfile.json', JSON.stringify(userData))
        res.status(200).json({ "message": "Watchlist Updated Successfully" })
    } catch (error) {
        res.status(501).json({ "error": "Something Went Wrong" })
    }


})


app.post('/nseSymbol/:name', (req, res) => {

    const name = req.params.name.toLocaleUpperCase()
    let companySymbols = NSESymbol.symbols.symbol
    let foundSymbols = []
    for (let i = 0; i < companySymbols.length; i++) {
        companySymbols[i].companyName.toLocaleUpperCase().includes(name) && foundSymbols.push(companySymbols[i])
    }

    res.status(200).json({ "message": foundSymbols })

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


app.post('/nifty50', (req, res) => {

    axios.get('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050')
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})


// Get Individual Stock Data
app.post('/stock/:symbol', (req, res) => {
    let symb = (req.params.symbol).toUpperCase()

    symb = symb.replace('&', '%26')
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${symb}`

    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})

// Get Individual Stock Chart Data
app.post('/candleData/:symbol', (req, res) => {

    let symb = (req.params.symbol).toUpperCase()
    symb = symb.replace('&', '%26')


    const url = `https://www.nseindia.com/api/chart-databyindex?index=${symb}`
    // const url = `https://www.nse-india.com/api/chart-databyindex?index=${symb}&preopen=true`

    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))



})


// Not Working Properly Still Kept for Reference
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
                    "X-Requested-With": "XMLHttpRequest"

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
                    res.status(500).json({ "error": "Query Must Be Within a Year" })
                })
        })
        .catch(err => console.log(err))



})

app.post('/getHistoricalData/:symbol/:startDate/:endDate', (req, res) => {

    const symbol = req.params.symbol.toUpperCase()
    const startDate = req.params.startDate
    const endDate = req.params.endDate

    const url = `https://www.nse-india.com/api/historical/cm/equity?symbol=${symbol}&series=["EQ"]&from=${startDate}&to=${endDate}`

    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(() => res.status(500).json({ "error": "Failed to Fetch" }))
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server Running at http://localhost:${port}`)
})

