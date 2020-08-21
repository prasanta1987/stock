
const tableBody = document.querySelector('.stockdata')
const noWatchlist = document.querySelector('.noWatchlist')
const stockTable = document.querySelector('.stock-table')
const mycardcontainer = document.querySelector('.mycardcontainer')
const industrySelector = document.querySelector('#industry')

const getMyWatchList = async () => {

    if (userData.watchList.length > 0 & userData.watchList != "undefined") {
        userData.watchList.map(symbol => {
            buildCards(symbol)
        })
    }

}

setTimeout(getMyWatchList, 2000)

const getMarketStatus = async () => {
    if (sessionStorage.marketStat != 'Closed' || sessionStorage.marketStat != 'Close') {
        getMyWatchList();
        (userData.watchList.length == 0) && (noWatchlist.innerHTML = 'Your Watch List is Empty')
    }
}

setInterval(getMarketStatus, 2000)


const getMarketDepth = async (symbol) => {

    try {
        let res = await fetch(`/marketDepth/${symbol}`, { method: 'POST' })
        let data = await res.json()

        let ttlBuyQty = data.marketDeptOrderBook.totalBuyQuantity
        let ttlSellQty = data.marketDeptOrderBook.totalSellQuantity
        let totalTrade = ttlBuyQty + ttlSellQty
        let buyPercentage = parseFloat((ttlBuyQty / totalTrade) * 100).toFixed(2)
        let sellPercentage = (100 - buyPercentage).toFixed(2)

        buyPercentage = (isNaN(buyPercentage) ? 0 : buyPercentage)
        sellPercentage = (isNaN(sellPercentage) ? 0 : sellPercentage)

        let buyMarkup = document.querySelector(`.${symbol}-buy-bar`)
        let buyMarkupQty = document.querySelector(`.${symbol}-buy-qty`)
        let sellMarkup = document.querySelector(`.${symbol}-sell-bar`)
        let sellMarkupQty = document.querySelector(`.${symbol}-sell-qty`)

        buyMarkup.innerHTML = `${buyPercentage} %`
        buyMarkup.style.width = `${buyPercentage}%`
        sellMarkup.innerHTML = `${sellPercentage} %`
        sellMarkup.style.width = `${sellPercentage}%`
        buyMarkupQty.innerHTML = ttlBuyQty
        sellMarkupQty.innerHTML = ttlSellQty


    } catch (err) {
        console.log(err)
        setTimeout(getMarketDepth, 2000)
    }
}


const buildCards = async (symbol) => {

    try {

        let res = await fetch(`/stock/${symbol}`, { method: 'POST' })
        let data = await res.json()
        // console.log(data)
        if (Object.keys(data).length > 0) {

            let option = document.createElement("option")
            let indusArray = []
            industrySelector.childNodes.forEach(ele => {
                (ele.value) && indusArray.push(ele.value)
            })
            if (!indusArray.includes(data.metadata.industry)) {
                option.text = data.metadata.industry
                industrySelector.add(option)
            }

            noWatchlist.innerHTML = ''
            let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice
            let openPrice = data.priceInfo.open
            let ttlShare = (data.securityInfo.issuedCap / 10000000).toFixed(2)
            let marketCap = (ttlShare * closePrice).toFixed(2)
            let preClosePrice = data.priceInfo.previousClose
            let symbolPe = data.metadata.pdSymbolPe
            let indPe = data.metadata.pdSectorPe
            let eps = isFinite(closePrice / symbolPe) ? (closePrice / symbolPe).toFixed(2) : 0
            let weekHighValue = data.priceInfo.weekHighLow.max
            let weekLowValue = data.priceInfo.weekHighLow.min
            let weekHighDate = data.priceInfo.weekHighLow.maxDate
            let weeklowData = data.priceInfo.weekHighLow.minDate
            let faceValue = (data.securityInfo.faceValue).toFixed(2)
            let pChnage = (data.priceInfo.pChange).toFixed(2)
            let vwap = data.priceInfo.vwap

            let buyPrice = 0
            let buyQty = 0

            let sellPrice = 0
            let sellQty = 0


            if (userData.transactions.buy) {

                userData.transactions.buy.map(value => {
                    if (value.symbol == symbol) {
                        buyPrice += value.price * value.qty
                        buyQty += value.qty
                    }
                })

            }
            if (userData.transactions.sell) {
                userData.transactions.sell.map(value => {
                    if (value.symbol == symbol) {
                        sellPrice += value.price * value.qty
                        sellQty += value.qty
                    }
                })
            }

            let avlShare = buyQty - sellQty //Available Share Qty
            let avgBuyPrice = buyPrice / buyQty //Average Buy Price
            let currentGain = ((closePrice - avgBuyPrice) * avlShare).toFixed(2); //Curent Gain / Loss
            currentGain = (isNaN(currentGain)) ? 0 : currentGain
            let retAginstInv = sellPrice - (avgBuyPrice * sellQty); // Total Return
            retAginstInv = (isNaN(retAginstInv)) ? 0 : retAginstInv
            let invested = (isNaN(avlShare * avgBuyPrice)) ? 0 : (avlShare * avgBuyPrice)

            if (document.querySelector(`.${symbol}`)) {
                let cmpMarkup = document.querySelector(`.${symbol}-cmp`)

                if (closePrice > preClosePrice) {
                    cmpMarkup.classList.remove('bg-danger')
                    cmpMarkup.classList.add('bg-success')
                } else {
                    cmpMarkup.classList.add('bg-danger')
                    cmpMarkup.classList.remove('bg-success')
                }
                cmpMarkup.innerHTML = closePrice

                document.querySelector(`#${symbol}-invested`).innerHTML = invested
                document.querySelector(`#${symbol}-cgl`).innerHTML = currentGain
                document.querySelector(`#${symbol}-ttlrtn`).innerHTML = retAginstInv
                document.querySelector(`#${symbol}-avlshare`).innerHTML = avlShare

            } else {
                mycardcontainer.innerHTML += `
                    <div class="rounded mt-3 mb-3 border border-dark mycard ${data.info.symbol}">
                        <div class="row p-2">
                        <div class="col-sm-12">
                        <button type="button" class="close" aria-label="Close" onClick=removeSymbolFromProfile('${symbol}')>
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <div class="row">
                        <div class="mt-3 d-flex flex-column justify-content-center col-sm-12 col-md-3 col-lg-3 text-center text-md-left text-lg-left">
                                    <a href="/${data.info.symbol}"><h3 class="lead">${data.info.companyName} (${data.info.symbol})</h3></a>
                                    <small class="d-block">Industry: <span data-symbol="${symbol}" class="industry">${data.metadata.industry}</span></small>
                                    <kbd class="bg-info"><small class="d-block">Last Update: <span class="upd">${data.metadata.lastUpdateTime}</span></small></kbd>
                                    <div class="d-flex justify-content-between mt-3 pl-2 pr-2">
                                        <span class="text-success">Buy : <b class="${symbol}-buy-qty"></b></span>
                                        <span class="text-danger">Sell : <b class="${symbol}-sell-qty"></b></span>
                                    </div>
                                    <div class="progress">
                                        <div class="progress-bar bg-success ${symbol}-buy-bar" role="progressbar" style="width: 50%" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
                                        <div class="progress-bar bg-danger ${symbol}-sell-bar" role="progressbar" style="width: 50%" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>

                            <div class="col d-flex flex-column">

                            <div class="row text-center align-items-center flex-grow-1">
                            <div class="col"> M Cap (Cr.)</div>
                            <div class="col"> Pre. Close </div>
                            <div class="col"> PE </div>
                            <div class="col"> Open </div>
                            <div class="col"> VWAP </div>
                            <div class="col"> Day High </div>
                            <div class="col"> 52W High </div>
                            </div>
                            
                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col font-weight-bold"> ${marketCap} </div>
                            <div class="col font-weight-bold"> ${preClosePrice} </div>
                            <div class="col font-weight-bold"> ${symbolPe} </div>
                            <div class="col font-weight-bold"> ${openPrice} </div>
                            <div class="col font-weight-bold ${symbol}-vwap"> ${vwap} </div>
                            <div class="col font-weight-bold"> ${data.priceInfo.intraDayHighLow.max} </div>
                            <div class="col">
                                <span class="d-block font-weight-bold">${weekHighValue}</span>
                                <small class="d-block">${weekHighDate}</small>
                            </div>
                        </div>
                            
                        <div class="mt-2 row text-center align-items-center flex-grow-1">
                            <div class="col"> TTL Share (Cr.)</div>
                            <div class="col"> EPS </div>
                            <div class="col"> PE Ind </div>
                            <div class="col"> CMP </div>
                            <div class="col"> % Chnage </div>
                            <div class="col"> Day Low </div>
                            <div class="col"> 52W Low </div>
                        </div>
                            
                        <div class="row text-center align-items-center flex-grow-1">
                            <div class="col font-weight-bold"> ${ttlShare} </div>
                            <div class="col font-weight-bold"> ${eps} </div>
                            <div class="col font-weight-bold"> ${indPe} </div>
                            <div class="col font-weight-bold"> <kbd class="${symbol}-cmp ${(closePrice > preClosePrice) ? 'bg-success' : 'bg-danger'}">${closePrice} </kbd></div>
                            <div class="col font-weight-bold">
                                <kbd class="${symbol}-pchange ${(pChnage > 0) ? 'bg-success' : 'bg-danger'}">${pChnage} %</kbd>
                            </div>
                            <div class="col font-weight-bold"> ${data.priceInfo.intraDayHighLow.min} </div>
                            <div class="col">
                                <span class="d-block font-weight-bold">${weekLowValue}</span>
                                <small class="d-block">${weeklowData}</small>
                            </div>
                        </div>
                                
                            </div>
                        </div>
                        </div>
                        <div class="col-sm-12">
                        <div class="row">
                            <div class="col-sm-3 d-flex align-items-center">
                                <div class="input-group input-group-sm">
                                    <input onChange="calcReturn('${symbol}')" id="${symbol}-buyingPrice" type="number" placeholder="Price" class="form-control">
                                    <input onChange="calcReturn('${symbol}')" id="${symbol}-buyQty" type="number" placeholder="Qty" class="form-control">
                                    <div class="input-group-append">
                                        <button class="btn btn-success ${symbol}-buy-btn" onClick="buyShares('${symbol}')" type="button">BUY</button>
                                        <button ${(avlShare == 0) && 'disabled'} class="btn btn-danger ${symbol}-sell-btn" onClick="sellShares('${symbol}')" type="button">SELL</button>
                                    </div>
                                </div>
                            </div>

                            <div class="col-sm-9">
                                <div class="d-flex flex-column text-center">
                                    <kbd class="bg-primary d-flex justify-content-between">
                                        <span>Investment : <b id="${symbol}-investment">0</b></span>
                                        <span>Return : <b id="${symbol}-return">0</b></span>
                                        <span>Gain/Loss : <b id="${symbol}-prloss">0</b></span>
                                        <span>Change : <b id="${symbol}-prlossPer">0</b></span>
                                    </kbd>
                                    <kbd class="mt-1 bg-dark d-flex justify-content-between">
                                        <span>Avl. Investment : <b id="${symbol}-invested">${invested}</b></span>
                                        <span>Curent Gain/Loss. : <b id="${symbol}-cgl">${currentGain}</b></span>
                                        <span>Gain/Loss : <b id="${symbol}-ttlrtn">${retAginstInv}</b></span>
                                        <span>Share Avl. : <b id="${symbol}-avlshare">${avlShare}</b></span>
                                    </kdb>
                                </div>
                            </div>

                        </div>
                        
                        </div>
                        </div>
                    </div>
                    `
            }
            getMarketDepth(symbol)
        } else {
            console.log('Data Not Received, Retrying')
        }

    } catch (error) {
        console.log(error)
        setTimeout(buildCards(symbol), 2000)
    }

}

const calcReturn = (symbol) => {

    const buyingPrice = parseFloat(document.querySelector(`#${symbol}-buyingPrice`).value) || parseFloat(document.querySelector(`.${symbol}-cmp`).innerHTML)
    const buyQty = parseFloat(document.querySelector(`#${symbol}-buyQty`).value) || 1

    const cmp = parseFloat(document.querySelector(`.${symbol}-cmp`).innerHTML)
    const investment = document.querySelector(`#${symbol}-investment`)
    const invested = document.querySelector(`#${symbol}-invested`)
    const netReturn = document.querySelector(`#${symbol}-return`)
    const prloss = document.querySelector(`#${symbol}-prloss`)
    const prlossPer = document.querySelector(`#${symbol}-prlossPer`)

    let invst = (buyingPrice * buyQty).toFixed(2)
    let rtrn = (cmp * buyQty).toFixed(2)
    let gain = (invst - rtrn).toFixed(2)
    let gainPercentage = ((gain / invst) * 100).toFixed(2)

    investment.innerHTML = invst
    netReturn.innerHTML = rtrn
    prloss.innerHTML = gain
    prlossPer.innerHTML = `${gainPercentage} %`
}

const buyShares = async (symbol) => {

    const buyingPrice = parseFloat(document.querySelector(`#${symbol}-buyingPrice`).value) || parseFloat(document.querySelector(`.${symbol}-cmp`).innerHTML)
    const buyQty = parseFloat(document.querySelector(`#${symbol}-buyQty`).value) || 0
    const today = moment().format('DD-MM-yyyy')

    try {
        let res = await fetch(`/buyShare/${symbol}/${buyingPrice}/${buyQty}/${today}`, { method: 'POST' })
        let data = await res.json()
        console.log(data)
        setTimeout(getUserData, 1000)
        setTimeout(getMyWatchList, 1000)
    } catch (error) {
        console.log(error)
    }

}

const sellShares = async (symbol) => {

    const buyingPrice = parseFloat(document.querySelector(`#${symbol}-buyingPrice`).value) || parseFloat(document.querySelector(`.${symbol}-cmp`).innerHTML)
    const buyQty = parseFloat(document.querySelector(`#${symbol}-buyQty`).value) || 0
    const today = moment().format('DD-MM-yyyy')

    try {
        let res = await fetch(`/sellShare/${symbol}/${buyingPrice}/${buyQty}/${today}`, { method: 'POST' })
        let data = await res.json()
        console.log(data)
        setTimeout(getUserData, 1000)
        setTimeout(getMyWatchList, 1000)
    } catch (error) {
        console.log(error)
    }

}

industrySelector.addEventListener('change', (e) => {
    let selected = e.target.value
    let industries = document.querySelectorAll('.industry')
    industries.forEach(ele => {

        let eleSymbol = ele.getAttribute('data-symbol');
        let symbol = document.querySelector(`.${eleSymbol}`);

        if (ele.innerHTML == selected) {
            symbol.style.display = 'block'
        } else if (selected == 'all') {
            symbol.style.display = 'block'
        } else {
            symbol.style.display = 'none'
        }

    })
})


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
