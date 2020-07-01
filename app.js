const express = require('express')
const path = require("path");
const axios = require("axios").default;
const symbol = require('./indexSymbols')



// require('events').EventEmitter.defaultMaxListeners = 0

// https://www.nse-india.com/api/historical/cm/equity?symbol=SHREECEM&series=[%22EQ%22]&from=26-06-2020&to=26-06-2020
// https://www.nse-india.com/api/chart-databyindex?index=TATASTEELEQN&preopen=true

const app = express()
app.use(express.static(path.join(__dirname, '/public')));


app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));
app.get('/:symbol', (req, res) => res.sendFile(path.join(__dirname, '/public/symbol.html')));


app.post('/indexSymbol/:name', (req,res)=>{

    const name = req.params.name.toLocaleUpperCase()
    let companySymbols = symbol.symbols.symbol
    let foundSymbols = []
    for(let i=0;i<companySymbols.length;i++){
        companySymbols[i].companyName.toLocaleUpperCase().includes(name) && foundSymbols.push(companySymbols[i])
    }

    res.status(200).json({"message":foundSymbols})

})

app.post('/nifty50', (req, res) => {

    axios.get('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050')
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})

app.post('/stock/:symbol', (req, res) => {
    const symb = (req.params.symbol).toUpperCase()

    axios.get(`https://www.nseindia.com/api/quote-equity?symbol=${symb}`)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))

})

app.post('/candleData/:symbol',(req,res)=>{

    const symb = (req.params.symbol).toUpperCase()

    const url = `https://www.nseindia.com/api/chart-databyindex?index=${symb}`
    // const url = `https://www.nse-india.com/api/chart-databyindex?index=${symb}&preopen=true`
    
    axios.get(url)
        .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json(err))



})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server Running at http://localhost:${port}`)
})