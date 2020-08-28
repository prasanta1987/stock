
const tableBody = document.querySelector('.stockdata')
const noWatchlist = document.querySelector('.noWatchlist')
const stockTable = document.querySelector('.stock-table')
const mycardcontainer = document.querySelector('.mycardcontainer')
const industrySelector = document.querySelector('#industry')

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

        let nameRes = await fetch(`/tickerInfo/${symbol}`, { method: 'POST' })
        let nameData = await nameRes.json()


        let res = await fetch(`/tickerData/${symbol}`, { method: 'POST' })
        let data = await res.json()
        const values = data.data[0]
        // console.log(values)
        noWatchlist.innerHTML = ''
        let openPrice = values.o, highPrice = values.h, lowPrice = values.l, closePrice = values.price, preClosePrice = values.c, changePrice = values.change;
        let sid = values.sid

        // investment Calculator Start
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
        // investment Calculator End

        mycardcontainer.innerHTML += `
                    <div class="rounded mt-3 mb-3 border border-dark mycard ${sid}">
                        <div class="row p-2">
                            <div class="col-sm-12">
                                <button type="button" class="close" aria-label="Close" onClick=removeSymbolFromProfile('${sid}')>
                                    <span aria-hidden="true">&times;</span>
                                </button>

                        <div class="row">

                            <div class="mt-3 d-flex flex-column justify-content-center nav-link col-sm-12 col-md-3 col-lg-3 text-center text-md-left text-lg-left">
                                <a href="/${sid}"><h3 class="text-primary lead">${nameData.data.info.name}</h3></a>
                                <kbd class="bg-info"><small class="d-block">Last Update: <span class="upd">${new Date(values.ts).toLocaleString()}</span></small></kbd>

                                <div class="text-center align-items-center flex-grow-1 buysell mt-3">
                                    <div class="input-group input-group-sm">
                                        <input onChange="calcReturn('${sid}')" id="${sid}-buyingPrice" type="number" placeholder="Price" class="form-control">
                                        <input onChange="calcReturn('${sid}')" id="${sid}-buyQty" type="number" placeholder="Qty" class="form-control">
                                        <div class="input-group-append">
                                            <button class="btn btn-success ${sid}-buy-btn" onClick="buyShares('${sid}')" type="button">BUY</button>
                                            <button ${(avlShare == 0) && 'disabled'} class="btn btn-danger ${sid}-sell-btn" onClick="sellShares('${sid}')" type="button">SELL</button>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div class="col d-flex flex-column">

                                <div class="priceinfo">
                                    <div class="cola">Pre. Close</div>
                                    <div class="cola">Open</div>
                                    <div class="cola">High</div>
                                    <div class="cola">Low</div>
                                    <div class="cola">CMP</div>
                                    <div class="cola">Chnage</div>

                                    <div class="cola font-weight-bold">${preClosePrice}</div>
                                    <div class="cola font-weight-bold">${openPrice}</div>
                                    <div class="cola font-weight-bold ${sid}-hp">${highPrice}</div>
                                    <div class="cola font-weight-bold ${sid}-lp">${lowPrice}</div>
                                    <div class="cola font-weight-bold">
                                        <kbd class="${sid}-cmp ${(closePrice > preClosePrice) ? 'bg-success' : 'bg-danger'}">${closePrice}</kbd>
                                    </div>
                                    <div class="cola font-weight-bold">
                                        <kbd class="${sid}-change ${(changePrice > 0) ? 'bg-success' : 'bg-danger'}">${changePrice}</kbd>
                                    </div>

                                </div>

                                <div class="d-flex justify-content-between">

                                </div>

                                <div class="marketdepth mb-1">
                                    <div class="d-flex justify-content-between pl-2 pr-2">
                                        <span class="text-success">Buy : <b class="${sid}-buy-qty"></b></span>
                                        <span class="text-danger">Sell : <b class="${sid}-sell-qty"></b></span>
                                    </div>
                                    <div class="progress">
                                        <div class="progress-bar bg-success ${sid}-buy-bar" role="progressbar" style="width: 50%" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
                                        <div class="progress-bar bg-danger ${sid}-sell-bar" role="progressbar" style="width: 50%" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>

                                <div class="text-center align-items-center flex-grow-1">
                                    <div class="d-flex flex-column text-center">
                                        <kbd class="bg-primary d-flex justify-content-between">
                                            <span>Investment : <b id="${sid}-investment">0</b></span>
                                            <span>Return : <b id="${sid}-return">0</b></span>
                                            <span>Gain/Loss : <b id="${sid}-prloss">0</b></span>
                                            <span>Change : <b id="${sid}-prlossPer">0</b></span>
                                        </kbd>
                                        <kbd class="mt-1 bg-dark d-flex justify-content-between">
                                            <span>Avl. Investment : <b id="${sid}-invested">${invested}</b></span>
                                            <span>Curent Gain/Loss. : <b id="${sid}-cgl">${currentGain}</b></span>
                                            <span>Gain/Loss : <b id="${sid}-ttlrtn">${retAginstInv}</b></span>
                                            <span>Share Avl. : <b id="${sid}-avlshare">${avlShare}</b></span>
                                        </kdb>
                                    </div>
                                </div>

                            </div>
                        </div>
                </div>
            </div>
            `
        updateData()
    } catch (error) {
        console.log(error)
        setTimeout(() => buildCards(symbol), 10000)
    }

}

const updateData = () => {

    let sids = ''
    userData.watchList.map(item => sids += `${item},`)

    if (sids.length > 0) {
        fetch(`/tickerData/${sids}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {

                data.data.map(values => {
                    let openPrice = values.o, highPrice = values.h, lowPrice = values.l, closePrice = values.price, preClosePrice = values.c, changePrice = values.change;

                    if (document.querySelector(`.${values.sid}`)) {
                        document.querySelector(`.${values.sid}-hp`).innerHTML = highPrice.toFixed(2)
                        document.querySelector(`.${values.sid}-lp`).innerHTML = lowPrice.toFixed(2)
                        document.querySelector(`.${values.sid}-cmp`).innerHTML = closePrice.toFixed(2)
                        document.querySelector(`.${values.sid}-change`).innerHTML = changePrice.toFixed(2)

                        if (preClosePrice < closePrice) {
                            document.querySelector(`.${values.sid}-cmp`).classList.remove('bg-danger')
                            document.querySelector(`.${values.sid}-change`).classList.remove('bg-danger')

                            document.querySelector(`.${values.sid}-cmp`).classList.add('bg-success')
                            document.querySelector(`.${values.sid}-change`).classList.add('bg-success')
                        } else {
                            document.querySelector(`.${values.sid}-cmp`).classList.remove('bg-success')
                            document.querySelector(`.${values.sid}-change`).classList.remove('bg-success')

                            document.querySelector(`.${values.sid}-cmp`).classList.add('bg-danger')
                            document.querySelector(`.${values.sid}-change`).classList.add('bg-danger')
                        }
                    }
                })


                setTimeout(updateData, 1000)
                // if (sessionStorage.marketStat != 'Closed') setTimeout(updateData, 1000)
            })
            .catch(err => {
                console.log(err)
                if (sessionStorage.marketStat != 'Closed') setTimeout(updateData, 5000)
            })
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