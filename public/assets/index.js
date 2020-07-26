
const tableBody = document.querySelector('.stockdata')
const noWatchlist = document.querySelector('.noWatchlist')
const stockTable = document.querySelector('.stock-table')
const mycardcontainer = document.querySelector('.mycardcontainer')


const getMyWatchList = async () => {

    if (userData.watchList.length > 0 & userData.watchList != "undefined") {

        userData.watchList.map(symbol => {
            buildCards(symbol)
        })
    }
}

setTimeout(getMyWatchList, 2000)

const getMarketStatus = async () => {
    try {
        let res = await fetch('/marketStatus', { method: 'POST' })
        let data = await res.json();

        (data.marketState[0].marketStatus != 'Closed') && setInterval(getMyWatchList, 2000);
        console.log(`Market ${data.marketState[0].marketStatus}`);
            (userData.watchList.length == 0) && (noWatchlist.innerHTML = 'Your Watch List is Empty')
    } catch (error) {
        console.log('Failed to get market status')
    }
}

setInterval(getMarketStatus, 2000)



const buildCards = async (symbol) => {

    try {

        let res = await fetch(`/stock/${symbol}`, { method: 'POST' })
        let data = await res.json()
        console.log(data)
        if (Object.keys(data).length > 0) {
            noWatchlist.innerHTML = ''
            let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice
            let openPrice = data.priceInfo.open
            let ttlShare = (data.securityInfo.issuedCap / 10000000).toFixed(2)
            let marketCap = (ttlShare * closePrice).toFixed(2)
            let preClosePrice = data.priceInfo.previousClose
            let oneDayReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
            let symbolPe = data.metadata.pdSymbolPe
            let indPe = data.metadata.pdSectorPe
            let eps = isFinite(closePrice / symbolPe) ? (closePrice / symbolPe).toFixed(2) : 0
            let weekHighValue = data.priceInfo.weekHighLow.max
            let weekLowValue = data.priceInfo.weekHighLow.min
            let weekHighDate = data.priceInfo.weekHighLow.maxDate
            let weeklowData = data.priceInfo.weekHighLow.minDate

            if (document.querySelector(`.${symbol}`)) {
                let existingCard = document.querySelector(`.${symbol}`)
                existingCard.innerHTML = ''
                existingCard.innerHTML = `
                <div class="row p-2" style="position:relative">
                    <button type="button" class="close" aria-label="Close" onClick=removeSymbolFromProfile('${symbol}')>
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <div class="d-flex flex-column justify-content-center col-sm-12 col-md-3 col-lg-3 text-center text-md-left text-lg-left">
                        <a href="/${data.info.symbol}"><h3 class="lead">${data.info.companyName} (${data.info.symbol})</h3></a>
                        <small class="d-block">Industry: <span class="indstry">${data.metadata.industry}</span></small>
                        <kbd class="bg-info"><small class="d-block">Last Update: <span class="upd">${data.metadata.lastUpdateTime}</span></small></kbd>
                    </div>
                    
                    <!--
                    <div class="col-sm-12 col-md-2 col-lg-2 text-light rounded">
                        <div class="rounded h-100 v-c-c w-100 text-center ${(oneDayReturn > 0 ? 'bg-success' : 'bg-danger')}">
                            <div>
                            <h4 class="cmp">${closePrice}</h4>
                            <hr />
                            <span class="cmpcng">${oneDayReturn}%</span>
                            </div>
                        </div>
                    </div>
                    -->

                    <div class="col d-flex flex-column">

                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col"> M Cap (Cr.)</div>
                            <div class="col"> Pre. Close </div>
                            <div class="col"> PE </div>
                            <div class="col"> Open </div>
                            <div class="col"> Day High </div>
                            <div class="col"> 52W High </div>
                        </div>
                            
                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col font-weight-bold"> ${marketCap} </div>
                            <div class="col font-weight-bold"> ${preClosePrice} </div>
                            <div class="col font-weight-bold"> ${symbolPe} </div>
                            <div class="col font-weight-bold"> ${openPrice} </div>
                            <div class="col font-weight-bold"> ${data.priceInfo.intraDayHighLow.max} </div>
                            <div class="col">
                                <span class="d-block font-weight-bold">${weekHighValue}</span>
                                <small class="d-block">${weekHighDate}</small>
                            </div>
                        </div>
                            
                        <hr />
                            
                            
                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col"> TTL Share (Cr.)</div>
                            <div class="col"> EPS </div>
                            <div class="col"> PE Ind </div>
                            <div class="col"> CMP </div>
                            <div class="col"> Day Low </div>
                            <div class="col"> 52W Low </div>
                        </div>
                            
                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col font-weight-bold"> ${ttlShare} </div>
                            <div class="col font-weight-bold"> ${eps} </div>
                            <div class="col font-weight-bold"> ${indPe} </div>
                            <div class="col font-weight-bold"><kbd class="${(closePrice>openPrice)?'bg-success':'bg-danger'}">${closePrice}</kbd></div>
                            <div class="col font-weight-bold"> ${data.priceInfo.intraDayHighLow.min} </div>
                            <div class="col">
                                <span class="d-block font-weight-bold">${weekLowValue}</span>
                                <small class="d-block">${weeklowData}</small>
                            </div>
                        </div>
                        
                    </div>

                </div>
                `
            } else {
                mycardcontainer.innerHTML += `
                    <div class="rounded mt-3 mb-3 border border-dark mycard ${data.info.symbol}">
                        <div class="row p-2" style="position:relative">
                        <button type="button" class="close" aria-label="Close" onClick=removeSymbolFromProfile('${symbol}')>
                            <span aria-hidden="true">&times;</span>
                        </button>

                            <div class="d-flex flex-column justify-content-center col-sm-12 col-md-3 col-lg-3 text-center text-md-left text-lg-left">
                                <a href="/${data.info.symbol}"><h3 class="lead">${data.info.companyName} (${data.info.symbol})</h3></a>
                                <small class="d-block">Industry: <span class="indstry">${data.metadata.industry}</span></small>
                                <kbd class="bg-info"><small class="d-block">Last Update: <span class="upd">${data.metadata.lastUpdateTime}</span></small></kbd>
                            </div>

                            <!--
                            <div class="col-sm-12 col-md-2 col-lg-2 text-light rounded">
                                <div class="rounded h-100 v-c-c w-100 text-center ${(oneDayReturn > 0 ? 'bg-success' : 'bg-danger')}">
                                    <div>
                                    <h4 class="cmp">${closePrice}</h4>
                                    <hr />
                                    <span class="cmpcng">${oneDayReturn}%</span>
                                    </div>
                                </div>
                            </div>
                            -->

                            <div class="col d-flex flex-column">

                            <div class="row text-center align-items-center flex-grow-1">
                            <div class="col"> M Cap (Cr.)</div>
                            <div class="col"> Pre. Close </div>
                            <div class="col"> PE </div>
                            <div class="col"> Open </div>
                            <div class="col"> Day High </div>
                            <div class="col"> 52W High </div>
                        </div>
                            
                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col font-weight-bold"> ${marketCap} </div>
                            <div class="col font-weight-bold"> ${preClosePrice} </div>
                            <div class="col font-weight-bold"> ${symbolPe} </div>
                            <div class="col font-weight-bold"> ${openPrice} </div>
                            <div class="col font-weight-bold"> ${data.priceInfo.intraDayHighLow.max} </div>
                            <div class="col">
                                <span class="d-block font-weight-bold">${weekHighValue}</span>
                                <small class="d-block">${weekHighDate}</small>
                            </div>
                        </div>
                            
                        <hr />
                            
                            
                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col"> TTL Share (Cr.)</div>
                            <div class="col"> EPS </div>
                            <div class="col"> PE Ind </div>
                            <div class="col"> CMP </div>
                            <div class="col"> Day Low </div>
                            <div class="col"> 52W Low </div>
                        </div>
                            
                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col font-weight-bold"> ${ttlShare} </div>
                            <div class="col font-weight-bold"> ${eps} </div>
                            <div class="col font-weight-bold"> ${indPe} </div>
                            <div class="col font-weight-bold"> <kbd class="${(closePrice>openPrice)?'bg-success':'bg-danger'}">${closePrice} </kbd></div>
                            <div class="col font-weight-bold"> ${data.priceInfo.intraDayHighLow.min} </div>
                            <div class="col">
                                <span class="d-block font-weight-bold">${weekLowValue}</span>
                                <small class="d-block">${weeklowData}</small>
                            </div>
                        </div>
                                
                            </div>

                        </div>
                    </div>
                    `
            }
        } else {
            console.log('Data Not Received, Retrying')
        }

    } catch (error) {
        console.log('Retrying Last Action')
        // setTimeout(buildCards(symbol), 2000)
    }

}

let jsonArray = []

const getMyData = () => {

    if (userData.watchList.length > 0 & userData.watchList != "undefined") {
        stockTable.classList.remove('d-none');
        noWatchlist.innerHTML = ''

        userData.watchList.map(symbol => {
            if (!document.querySelector(`.${symbol}`)) {
                fetchData(symbol)
            }
        })

    } else {
        noWatchlist.innerHTML = 'Your Watchlist is Empty'
        stockTable.classList.add('d-none');
    }
}

// setTimeout(getMyData, 2000)


const fetchData = async (symbols) => {

    try {

        let res = await fetch(`/stock/${symbols}`, { method: 'POST' })
        let data = await res.json()

        console.log(data)
        let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice

        let ttlShare = data.securityInfo.issuedCap
        let marketCap = ((ttlShare * closePrice) / 10000000).toFixed(2)
        let preClosePrice = data.priceInfo.previousClose

        let oneDayReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)

        let symbolPe = data.metadata.pdSymbolPe
        let eps = (closePrice / symbolPe).toFixed(2)

        nseDataObject = {
            name: data.info.companyName,
            identifier: data.info.identifier,
            industry: data.info.industry,
            marketCap: marketCap,
            lastprice: data.info.lastprice,
            closePrice: closePrice,
            symbolPE: symbolPe,
            indPE: data.metadata.pdSectorPe,
            weekHighValue: data.priceInfo.weekHighLow.max,
            weekLowValue: data.priceInfo.weekHighLow.min,
            weekHighDate: data.priceInfo.weekHighLow.maxDate,
            weeklowData: data.priceInfo.weekHighLow.minDate,
        }

        if (!document.querySelector(`.${symbols}`)) {
            tableBody.innerHTML += `
                <tr class="${symbols}">
                <td>${data.info.companyName}</td>
                <td>${data.info.identifier}</td>
                <td>${data.info.industry}</td>
                <td>-</td>
                <td>${marketCap}</td>
                <td class="${symbols}-bv">-</td>
                <td>${data.priceInfo.lastPrice}</td>
                <td>${eps}</td>
                <td>${symbolPe}</td>
                <td>${data.metadata.pdSectorPe}</td>
                <td class="${symbols}-pb">-</td>
                <td class="${symbols}-roe">-</td>
                <td>-</td>
                <td class="text-center">
                    <small class="d-block">${data.priceInfo.weekHighLow.max}</small>
                    <small clsss="d-block border-top">${data.priceInfo.weekHighLow.maxDate}</small>
                </td>
                <td class="text-center">
                    <small class="d-block">${data.priceInfo.weekHighLow.min}</small>
                    <small clsss="d-block border-top">${data.priceInfo.weekHighLow.minDate}</small>
                </td>
                <td class="text-light ${symbols}-d1ret ${(oneDayReturn < 0) ? 'bg-danger' : 'bg-success'} border">${oneDayReturn}%</td>
                <td class="text-light ${symbols}-w1ret border">-</td>
                <td class="text-light ${symbols}-m1ret border">-</td>
                <td class="text-light ${symbols}-m3ret border">-</td>
                <td class="text-light ${symbols}-m6ret border">-</td>
                <td class="text-light ${symbols}-y1ret border">-</td>
                <td class="text-light ${symbols}-y2ret border">-</td>
                <td class="text-light ${symbols}-y5ret border">-</td>
                <td class="text-light ${symbols}-y10ret border">-</td>
                </tr>
            `

            jsonArray.push(nseDataObject)
        }

        getBseData(symbols, closePrice)

    } catch (error) {
        fetchData(symbols)
        console.log('Last Action Failed, Retrying One More Time', error)
    }
}


const getBseData = async (symbol, closePrice) => {

    try {
        let res = await fetch(`/getBseData/${symbol}`, { method: 'POST' })
        let data = await res.json()
        pbMarkUp = document.querySelector(`.${symbol}-pb`)
        roeMarkUp = document.querySelector(`.${symbol}-roe`)
        bvMarkUp = document.querySelector(`.${symbol}-bv`)

        let pbValue = parseFloat(data.PB)
        let roeValue = parseFloat(data.ROE)
        let bookValue = (closePrice / pbValue).toFixed(2)

        pbMarkUp.innerHTML = pbValue
        roeMarkUp.innerHTML = roeValue
        bvMarkUp.innerHTML = bookValue
        getUpto2mData(symbol, closePrice)
    } catch (error) {
        getBseData(symbol, closePrice)
        console.log('Last Action Failed, Retrying One More Time')
    }
}


const getUpto2mData = async (symbol, closePrice) => {

    const today = moment().format('DD-MM-yyyy')
    const fromDate = moment().subtract(3, 'months').format('DD-MM-yyyy')


    const week1back = moment().subtract(1, 'week').format('yyyy-MM-DD')
    const week1backPluse = moment().subtract(1, 'week').add(1, 'days').format('yyyy-MM-DD')
    const week1backMinus = moment().subtract(1, 'week').subtract(1, 'days').format('yyyy-MM-DD')

    const month1back = moment().subtract(1, 'months').format('yyyy-MM-DD')
    const month1backPluse = moment().subtract(1, 'months').add(1, 'days').format('yyyy-MM-DD')
    const month1backMinus = moment().subtract(1, 'months').subtract(1, 'days').format('yyyy-MM-DD')

    const url = `/getHistoricalData/${symbol}/${fromDate}/${today}`

    try {
        let res = await fetch(url, { method: 'POST' })
        let data = await res.json()

        let is1wFound = false
        let is1mFound = false

        data.data.map(value => {

            if (!is1wFound) {
                let gotdate = value.CH_TIMESTAMP

                if (week1back == gotdate || week1backPluse == gotdate || week1backMinus == gotdate) {

                    let preClosePrice = value.CH_CLOSING_PRICE

                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    const w1ret = document.querySelector(`.${symbol}-w1ret`);
                    (stockReturn < 0) ? w1ret.classList.add('bg-danger') : w1ret.classList.add('bg-success')
                    w1ret.innerHTML = `${stockReturn}%`
                    console.log(symbol, '=>', gotdate, '=>', preClosePrice, '=>', closePrice)
                    is1wFound = true
                }
            }


            if (!is1mFound) {
                let gotdate = value.CH_TIMESTAMP

                if (month1back == gotdate || month1backPluse == gotdate || month1backMinus == gotdate) {

                    let preClosePrice = value.CH_CLOSING_PRICE

                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    const m1ret = document.querySelector(`.${symbol}-m1ret`);
                    (stockReturn < 0) ? m1ret.classList.add('bg-danger') : m1ret.classList.add('bg-success')
                    m1ret.innerHTML = `${stockReturn}%`
                    console.log(symbol, '=>', gotdate, '=>', preClosePrice, '=>', closePrice)
                    is1mFound = true
                }
            }
        })

        getUpto3mData(symbol, closePrice)

    } catch (error) {
        getUpto2mData(symbol, closePrice)
        console.log('Last Action Failed, Retrying One More Time')
    }

}

const getUpto3mData = async (symbol, closePrice) => {

    const fromDate = moment().subtract(4, 'months').format('DD-MM-yyyy')
    const toDate = moment().subtract(2, 'months').format('DD-MM-yyyy')

    const month3back = moment().subtract(3, 'months').format('yyyy-MM-DD')
    const month3backPluse = moment().subtract(3, 'months').add(1, 'dats').format('yyyy-MM-DD')
    const month3backMinus = moment().subtract(3, 'months').subtract(1, 'days').format('yyyy-MM-DD')

    const url = `/getHistoricalData/${symbol}/${fromDate}/${toDate}`
    try {
        let res = await fetch(url, { method: 'POST' })
        let data = await res.json()

        let is3mFound = false

        data.data.map(value => {

            if (!is3mFound) {
                let gotdate = value.CH_TIMESTAMP

                if (month3back == gotdate || month3backPluse == gotdate || month3backMinus == gotdate) {

                    let preClosePrice = value.CH_CLOSING_PRICE

                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    const m3ret = document.querySelector(`.${symbol}-m3ret`);
                    (stockReturn < 0) ? m3ret.classList.add('bg-danger') : m3ret.classList.add('bg-success')
                    m3ret.innerHTML = `${stockReturn}%`
                    console.log(symbol, '=>', gotdate, '=>', preClosePrice, '=>', closePrice)
                    is3mFound = true
                }
            }
        })

        getUpto6mData(symbol, closePrice)

    } catch (error) {
        getUpto3mData(symbol, closePrice)
        console.log('Last Action Failed, Retrying One More Time')
    }
}

const getUpto6mData = async (symbol, closePrice) => {

    const fromDate = moment().subtract(7, 'months').format('DD-MM-yyyy')
    const toDate = moment().subtract(5, 'months').format('DD-MM-yyyy')

    const month6back = moment().subtract(6, 'months').format('yyyy-MM-DD')
    const month6backPluse = moment().subtract(6, 'months').add(1, 'days').format('yyyy-MM-DD')
    const month6backMinus = moment().subtract(6, 'months').subtract(1, 'days').format('yyyy-MM-DD')

    const url = `/getHistoricalData/${symbol}/${fromDate}/${toDate}`


    try {
        let res = await fetch(url, { method: 'POST' })
        let data = await res.json()

        let is6mFound = false

        data.data.map(value => {

            if (!is6mFound) {
                let gotdate = value.CH_TIMESTAMP

                if (month6back == gotdate || month6backPluse == gotdate || month6backMinus == gotdate) {
                    let preClosePrice = value.CH_CLOSING_PRICE

                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    const m6ret = document.querySelector(`.${symbol}-m6ret`);
                    (stockReturn < 0) ? m6ret.classList.add('bg-danger') : m6ret.classList.add('bg-success')
                    m6ret.innerHTML = `${stockReturn}%`
                    console.log(symbol, '=>', gotdate, '=>', preClosePrice, '=>', closePrice)
                    is6mFound = true
                }
            }

        })

        getUpto1YearData(symbol, closePrice)

    } catch (err) {
        getUpto6mData(symbol, closePrice)
        console.log('Last Action Failed, Retrying One More Time')
    }
}

const getUpto1YearData = async (symbol, closePrice) => {

    const fromDate = moment().subtract(13, 'months').format('DD-MM-yyyy')
    const toDate = moment().subtract(11, 'months').format('DD-MM-yyyy')


    const year1back = moment().subtract(1, 'years').format('yyyy-MM-DD')
    const year1backPluse = moment().subtract(1, 'years').add(1, 'days').format('yyyy-MM-DD')
    const year1backMinus = moment().subtract(1, 'years').subtract(1, 'days').format('yyyy-MM-DD')

    const url = `/getHistoricalData/${symbol}/${fromDate}/${toDate}`

    try {
        let res = await fetch(url, { method: 'POST' })
        let data = await res.json()
        let is1YearFound = false

        data.data.map(value => {
            if (!is1YearFound) {
                let gotdate = value.CH_TIMESTAMP
                if (year1back == gotdate || year1backPluse == gotdate || year1backMinus == gotdate) {
                    let preClosePrice = value.CH_CLOSING_PRICE

                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    const y1ret = document.querySelector(`.${symbol}-y1ret`);
                    (stockReturn < 0) ? y1ret.classList.add('bg-danger') : y1ret.classList.add('bg-success')
                    y1ret.innerHTML = `${stockReturn}%`
                    console.log(symbol, '=>', gotdate, '=>', preClosePrice, '=>', closePrice)
                    is1YearFound = true
                }
            }
        })
        getUpto2YearData(symbol, closePrice)
    } catch (error) {
        getUpto1YearData(symbol, closePrice)
        console.log('Last Action Failed, Retrying One More Time')
    }
}

const getUpto2YearData = async (symbol, closePrice) => {

    const fromDate = moment().subtract(26, 'months').format('DD-MM-yyyy')
    const toDate = moment().subtract(23, 'months').format('DD-MM-yyyy')

    const year2back = moment().subtract(2, 'years').format('yyyy-MM-DD')
    const year2backPluse = moment().subtract(2, 'years').add(1, 'days').format('yyyy-MM-DD')
    const year2backMinus = moment().subtract(2, 'years').subtract(1, 'days').format('yyyy-MM-DD')

    const url = `/getHistoricalData/${symbol}/${fromDate}/${toDate}`

    try {
        let res = await fetch(url, { method: 'POST' })
        let data = await res.json()
        let is2YearFound = false

        data.data.map(value => {
            if (!is2YearFound) {
                let gotdate = value.CH_TIMESTAMP
                if (year2back == gotdate || year2backPluse == gotdate || year2backMinus == gotdate) {
                    let preClosePrice = value.CH_CLOSING_PRICE

                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    const y2ret = document.querySelector(`.${symbol}-y2ret`);
                    (stockReturn < 0) ? y2ret.classList.add('bg-danger') : y2ret.classList.add('bg-success')
                    y2ret.innerHTML = `${stockReturn}%`
                    console.log(symbol, '=>', gotdate, '=>', preClosePrice, '=>', closePrice)
                    is2YearFound = true
                }
            }
        })
        getUpto5YearData(symbol, closePrice)
    } catch (error) {
        getUpto2YearData(symbol, closePrice)
        console.log('Last Action Failed, Retrying One More Time')
    }
}

const getUpto5YearData = async (symbol, closePrice) => {

    const fromDate = moment().subtract(5, 'years').subtract(1, 'months').format('DD-MM-yyyy')
    const toDate = moment().subtract(5, 'years').add(1, 'months').format('DD-MM-yyyy')

    const year5back = moment().subtract(5, 'years').format('yyyy-MM-DD')
    const year5backPluse = moment().subtract(5, 'years').add(1, 'days').format('yyyy-MM-DD')
    const year5backMinus = moment().subtract(5, 'years').subtract(1, 'days').format('yyyy-MM-DD')

    const url = `/getHistoricalData/${symbol}/${fromDate}/${toDate}`

    try {
        let res = await fetch(url, { method: 'POST' })
        let data = await res.json()
        let is5YearFound = false

        data.data.map(value => {
            if (!is5YearFound) {
                let gotdate = value.CH_TIMESTAMP
                if (year5back == gotdate || year5backPluse == gotdate || year5backMinus == gotdate) {
                    let preClosePrice = value.CH_CLOSING_PRICE

                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    const y5ret = document.querySelector(`.${symbol}-y5ret`);
                    (stockReturn < 0) ? y5ret.classList.add('bg-danger') : y5ret.classList.add('bg-success')
                    y5ret.innerHTML = `${stockReturn}%`
                    console.log(symbol, '=>', gotdate, '=>', preClosePrice, '=>', closePrice)
                    is5YearFound = true
                }
            }
        })
        getUpto10YearData(symbol, closePrice)
    } catch (error) {
        getUpto5YearData(symbol, closePrice)
        console.log('Last Action Failed, Retrying One More Time')
    }

}

const getUpto10YearData = async (symbol, closePrice) => {

    const fromDate = moment().subtract(10, 'years').subtract(1, 'months').format('DD-MM-yyyy')
    const toDate = moment().subtract(10, 'years').add(1, 'months').format('DD-MM-yyyy')

    const year10back = moment().subtract(10, 'years').format('yyyy-MM-DD')
    const year10backPluse = moment().subtract(10, 'years').add(1, 'days').format('yyyy-MM-DD')
    const year10backMinus = moment().subtract(10, 'years').subtract(1, 'days').format('yyyy-MM-DD')

    const url = `/getHistoricalData/${symbol}/${fromDate}/${toDate}`

    try {
        let res = await fetch(url, { method: 'POST' })
        let data = await res.json()
        let is5YearFound = false

        data.data.map(value => {
            if (!is5YearFound) {
                let gotdate = value.CH_TIMESTAMP
                if (year10back == gotdate || year10backPluse == gotdate || year10backMinus == gotdate) {
                    let preClosePrice = value.CH_CLOSING_PRICE

                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    const y10ret = document.querySelector(`.${symbol}-y10ret`);
                    (stockReturn < 0) ? y10ret.classList.add('bg-danger') : y10ret.classList.add('bg-success')
                    y10ret.innerHTML = `${stockReturn}%`
                    console.log(symbol, '=>', gotdate, '=>', preClosePrice, '=>', closePrice)
                    is5YearFound = true
                }
            }
        })
    } catch (error) {
        getUpto10YearData(symbol, closePrice)
        console.log('Last Action Failed, Retrying One More Time')
    }

}
