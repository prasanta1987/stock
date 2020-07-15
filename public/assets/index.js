
const tableBody = document.querySelector('.stockdata')
const noWatchlist = document.querySelector('.noWatchlist')
const stockTable = document.querySelector('.stock-table')

const getMyWatchList = () => {

    //     if (userData.watchList.length > 0 & userData.watchList != "undefined") {

    //         userData.watchList.map(symbol => {

    //             fetch(`/stock/${symbol}`, { method: 'POST' })
    //                 .then(res => res.json())
    //                 .then(data => {
    //                     console.log(data)

    //                     if (document.querySelector(`.${symbol}`)) {
    //                         let existingCard = document.querySelector(`.${symbol}`)
    //                         existingCard.innerHTML = ''
    //                         existingCard.innerHTML = `
    //                             <div class="row p-2" style="position:relative">
    //                             <span class="close text-danger" onClick=removeSymbolFromProfile('${symbol}')>X</span>
    //                                 <div class="col-sm-2 col-md-3 col-lg-3 text-xs-center">
    //                                     <h3 class="lead">${data.info.companyName} (${data.info.symbol})</h3>
    //                                     <small class="d-block">Last Update: <span class="upd">${data.metadata.lastUpdateTime}</span></small>
    //                                     <small class="d-block">Industry: <span class="indstry">${data.info.industry}</span></small>
    //                                 </div>

    //                                 <div class="col-sm-12 col-md-2  col-lg-2 text-light rounded">
    //                                     <div class="rounded h-100 v-c-c w-100 text-center ${(data.priceInfo.change > 0 ? 'bg-success' : 'bg-danger')}">
    //                                         <div>
    //                                         <h4 class="cmp">${data.priceInfo.lastPrice}</h4>
    //                                         <span class="cmpcng">${data.priceInfo.pChange.toFixed(2)}%</span>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                                     `
    //                     } else {

    //                         mycardcontainer.innerHTML += `
    //                                     <div class="rounded mt-3 mb-3 border border-dark mycard ${data.info.symbol}">
    //                                         <div class="row p-2" style="position:relative">
    //                                         <span class="close text-danger" onClick=removeSymbolFromProfile('${symbol}')>X</span>
    //                                             <div class="col-sm-2 col-md-3 col-lg-3 text-xs-center">
    //                                                 <h3 class="lead">${data.info.companyName} (${data.info.symbol})</h3>
    //                                                 <small class="d-block">Last Update: <span class="upd">${data.metadata.lastUpdateTime}</span></small>
    //                                                 <small class="d-block">Industry: <span class="indstry">${data.info.industry}</span></small>
    //                                             </div>

    //                                             <div class="col-sm-12 col-md-2  col-lg-2 text-light rounded">
    //                                                 <div class="rounded h-100 v-c-c w-100 text-center ${(data.priceInfo.change > 0 ? 'bg-success' : 'bg-danger')}">
    //                                                     <div>
    //                                                     <h4 class="cmp">${data.priceInfo.lastPrice}</h4>
    //                                                     <span class="cmpcng">${data.priceInfo.pChange.toFixed(2)}%</span>
    //                                                     </div>
    //                                                 </div>
    //                                             </div>

    //                                         </div>
    //                                     </div>
    //                                 `
    //                     }
    //                 })
    //                 .catch(err => console.log(err))
    //         })
    //     }
}


// setTimeout(getMyWatchList, 2000)
// setInterval(getMyWatchList, 2000)



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
