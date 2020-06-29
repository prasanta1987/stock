const express = require('express')
const path = require("path");
const axios = require("axios").default;


// require('events').EventEmitter.defaultMaxListeners = 0

const app = express()
app.use(express.static(path.join(__dirname, '/public')));


app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));
app.get('/:symbol', (req, res) => res.sendFile(path.join(__dirname, '/public/symbol.html')));

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

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server Running at http://localhost:${port}`)
})