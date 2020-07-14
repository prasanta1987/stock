const tableBody = document.querySelector('.stockdata')
const noWatchlist = document.querySelector('.noWatchlist')
const stockTable = document.querySelector('.stock-table')

// const getMyWatchList = () => {

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
// }


// setTimeout(getMyWatchList, 2000)
// setInterval(getMyWatchList, 2000)



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

setTimeout(getMyData, 2000)
// setInterval(getMyData, 2000)


const fetchData = (symbols) => {

    fetch(`/stock/${symbols}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            // console.log(data)
            let closePrice = (data.priceInfo.close) ? data.priceInfo.close : data.priceInfo.previousClose
            let ttlShare = data.securityInfo.issuedCap
            let marketCap = ((ttlShare * closePrice) / 10000000).toFixed(2)
            let preClosePrice = data.priceInfo.previousClose

            let oneDayReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)

            let symbolPe = data.metadata.pdSymbolPe
            let eps = (closePrice / symbolPe).toFixed(2)

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
                </tr>
            `
            }
            getBseData(symbols, closePrice)
        })
        .catch(err => console.log(err))

}


const getBseData = (symbol, closePrice) => {
    fetch(`/getBseData/${symbol}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            pbMarkUp = document.querySelector(`.${symbol}-pb`)
            roeMarkUp = document.querySelector(`.${symbol}-roe`)
            bvMarkUp = document.querySelector(`.${symbol}-bv`)

            let pbValue = parseFloat(data.PB)
            let roeValue = parseFloat(data.ROE)
            let bookValue = (closePrice / pbValue).toFixed(2)

            pbMarkUp.innerHTML = pbValue
            roeMarkUp.innerHTML = roeValue
            bvMarkUp.innerHTML = bookValue
            get2YearsData(symbol, closePrice)
        })
        .catch(err => console.log(err))
}

const getHistoricalData = (symbol) => {

}

const get2YearsData = (symbol, closePrice) => {
    const w1ret = document.querySelector(`.${symbol}-w1ret`)
    const m1ret = document.querySelector(`.${symbol}-m1ret`)
    const m3ret = document.querySelector(`.${symbol}-m3ret`)
    const m6ret = document.querySelector(`.${symbol}-m6ret`)
    const y1ret = document.querySelector(`.${symbol}-y1ret`)
    const y2ret = document.querySelector(`.${symbol}-y2ret`)


    const today = moment().format('DD-MM-yyyy')
    const back2years = moment().subtract(2, 'years').format('DD-MM-yyyy')

    const url = `/getHistoricalData/${symbol}/${back2years}/${today}`

    const week1back = moment().subtract(5, 'days').format('yyyy-MM-DD')
    const week1backPluse = moment().subtract(6, 'days').format('yyyy-MM-DD')
    const week1backMinus = moment().subtract(4, 'days').format('yyyy-MM-DD')

    const month1back = moment().subtract(20, 'days').format('yyyy-MM-DD')
    const month1backPluse = moment().subtract(21, 'days').format('yyyy-MM-DD')
    const month1backMinus = moment().subtract(19, 'days').format('yyyy-MM-DD')

    const month3back = moment().subtract(60, 'days').format('yyyy-MM-DD')
    const month3backPluse = moment().subtract(61, 'days').format('yyyy-MM-DD')
    const month3backMinus = moment().subtract(59, 'days').format('yyyy-MM-DD')

    const month6back = moment().subtract(120, 'days').format('yyyy-MM-DD')
    const month6backPluse = moment().subtract(121, 'days').format('yyyy-MM-DD')
    const month6backMinus = moment().subtract(119, 'days').format('yyyy-MM-DD')

    const year1back = moment().subtract(252, 'days').format('yyyy-MM-DD')
    const year1backPluse = moment().subtract(253, 'days').format('yyyy-MM-DD')
    const year1backMinus = moment().subtract(251, 'days').format('yyyy-MM-DD')

    const year2back = moment().subtract(504, 'days').format('yyyy-MM-DD')
    const year2backPluse = moment().subtract(505, 'days').format('yyyy-MM-DD')
    const year2backMinus = moment().subtract(503, 'days').format('yyyy-MM-DD')


    fetch(url, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            for (let i = 0; i < data.data.length; i++) {
                let gotdate = data.data[i].CH_TIMESTAMP

                if (week1back == gotdate || week1backPluse == gotdate || week1backMinus == gotdate) {
                    let preClosePrice = data.data[i].CH_CLOSING_PRICE
                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    if (stockReturn < 0) {
                        w1ret.classList.add('bg-danger')
                    } else {
                        w1ret.classList.add('bg-success')
                    }
                    w1ret.innerHTML = `${stockReturn}%`
                }

                if (month1back == gotdate || month1backPluse == gotdate || month1backMinus == gotdate) {
                    let preClosePrice = data.data[i].CH_CLOSING_PRICE
                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    if (stockReturn < 0) {
                        m1ret.classList.add('bg-danger')
                    } else {
                        m1ret.classList.add('bg-success')
                    }
                    m1ret.innerHTML = `${stockReturn}%`
                }

                if (month3back == gotdate || month3backPluse == gotdate || month3backMinus == gotdate) {
                    let preClosePrice = data.data[i].CH_CLOSING_PRICE
                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    if (stockReturn < 0) {
                        m3ret.classList.add('bg-danger')
                    } else {
                        m3ret.classList.add('bg-success')
                    }
                    m3ret.innerHTML = `${stockReturn}%`
                }

                if (month6back == gotdate || month6backPluse == gotdate || month6backMinus == gotdate) {
                    let preClosePrice = data.data[i].CH_CLOSING_PRICE
                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    m6ret.innerHTML = `${stockReturn}%`
                }

                if (year1back == gotdate || year1backPluse == gotdate || year1backMinus == gotdate) {
                    let preClosePrice = data.data[i].CH_CLOSING_PRICE
                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    y1ret.innerHTML = `${stockReturn}%`
                }

                if (year2back == gotdate || year2backPluse == gotdate || year2backMinus == gotdate) {
                    let preClosePrice = data.data[i].CH_CLOSING_PRICE
                    let stockReturn = (((closePrice - preClosePrice) / preClosePrice) * 100).toFixed(2)
                    y2ret.innerHTML = `${stockReturn}%`
                }


            }
        })
        .catch(err => console.log(err))

}
// moment().subtract(2, 'years').format('DD-MM-yyyy')