const noWatchlist = document.querySelector('.noWatchlist')
const mycardcontainer = document.querySelector('.mycardcontainer')

const buildCards = (symbol) => {

    mycardcontainer.innerHTML += `
        <div class="rounded border border-dark mycard ${symbol}" data-toggle="tooltip" data-placement="top" title="Tooltip on top">
            <div class="row p-2">
                <div class="col-sm-12">
    
                    <button type="button" class="close cardclose" aria-label="Close" onClick=removeSymbolFromProfile('${symbol}')>
                        <span aria-hidden="true">&times;</span>
                    </button>
    
                    <a href="/${symbol}" class="cardlinks">
                        <div class="wlcard d-flex align-items-center justify-content-between">
                            <span>${symbol}</span>
                            
                            <div class="d-flex" style="justify-content : space-evenly">
                                <b class="d-block ${symbol}-ch">
                                    <span class="${symbol}-cmp">~</span>
                                    <!-- <span class="${symbol}-change">~</span> -->
                                    (<span class="${symbol}-pchange">~</span>)
                                </b>
                            </div>

                        </div>
                    </a>
                    
                    <small class="d-flex justify-content-between">
                        <span>O: <span class="${symbol}-open">~</span></span>
                        <span>H: <span class="${symbol}-high">~</span></span>
                        <span>L: <span class="${symbol}-low">~</span></span>
                    </small>

                    <div class="progress mktdepth mt-1">
                        <div class="progress-bar bg-success ${symbol}-buy-bar" role="progressbar" style="width: 50%" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
                        <div class="progress-bar bg-danger ${symbol}-sell-bar" role="progressbar" style="width: 50%" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>

                </div>
            </div>
        </div>
    `
    // mycardcontainer.innerHTML += `
    //         <div class="rounded mt-3 mb-3 border border-dark mycard ${symbol}" data-toggle="tooltip" data-placement="top" title="Tooltip on top">
    //             <div class="row p-2">
    //                 <div class="col-sm-12">

    //                     <button type="button" class="close cardclose" aria-label="Close" onClick=removeSymbolFromProfile('${symbol}')>
    //                         <span aria-hidden="true">&times;</span>
    //                     </button>

    //                     <div class="wlcard text-center">
    //                         <a class="cardlinks" href="/${symbol}">${symbol}</a>

    //                         <hr class="m-1">

    //                         <div class="mb-2 mt-2 d-flex" style="justify-content : space-evenly">
    //                             <span><kbd class="d-block ${symbol}-cmp">0</kbd></span>
    //                             <kbd class="d-block ${symbol}-ch">
    //                                 <span class="${symbol}-change">~</span>
    //                                 (<span class="${symbol}-pchange">~</span>)
    //                             </kbd>
    //                         </div>
    //                     </div>

    //                     <div class="progress mktdepth">
    //                         <div class="progress-bar bg-success ${symbol}-buy-bar" role="progressbar" style="width: 50%" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
    //                         <div class="progress-bar bg-danger ${symbol}-sell-bar" role="progressbar" style="width: 50%" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
    //                     </div>

    //                  </div>
    //             </div>
    //         </div>
    //     `
    refreshData(userData)
}

const refreshData = (userData) => {

    const growFetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData.watchList)
    }

    fetch('/growwBatchData', growFetchOptions)
        .then(res => res.json())
        .then(data => {
            updateStockData(data.livePointsMap)
        })
        .catch(err => {
            console.log(err)
        })

    if (sessionStorage.marketStat != 'Closed') setTimeout(() => refreshData(userData), 1000)
}

const updateStockData = (olhc) => {
    Object.keys(olhc).map(ticker => {
        let data = olhc[ticker]
        console.log(data)
        let symbol = data.symbol
        let dayChange = data.dayChange.toFixed(2)
        let totalbuy = data.totalBuyQty
        let totalSell = data.totalSellQty
        let totalTrade = totalbuy + totalSell

        let buyPercentage = parseFloat((totalbuy / totalTrade) * 100).toFixed(2)
        let sellPercentage = (100 - buyPercentage).toFixed(2)

        let cmpMarkup = document.querySelector(`.${symbol}-cmp`)
        let changeMarkup = document.querySelector(`.${symbol}-change`)
        let pChangeMarkup = document.querySelector(`.${symbol}-pchange`)
        let changeContainer = document.querySelector(`.${symbol}-ch`)
        let openMarkup = document.querySelector(`.${symbol}-open`)
        let highMarkup = document.querySelector(`.${symbol}-high`)
        let lowMarkup = document.querySelector(`.${symbol}-low`)
        let buyBar = document.querySelector(`.${symbol}-buy-bar`)
        let sellBar = document.querySelector(`.${symbol}-sell-bar`)

        if (cmpMarkup) cmpMarkup.innerHTML = data.ltp
        if (pChangeMarkup) pChangeMarkup.innerHTML = `${data.dayChangePerc.toFixed(2)} %`
        if (changeMarkup) changeMarkup.innerHTML = dayChange
        if (openMarkup) openMarkup.innerHTML = data.open
        if (highMarkup) highMarkup.innerHTML = data.high
        if (lowMarkup) lowMarkup.innerHTML = data.low

        if (dayChange > 0) {
            cmpMarkup.classList.remove('text-danger')
            changeContainer.classList.remove('text-danger')

            cmpMarkup.classList.add('text-success')
            changeContainer.classList.add('text-success')

        } else {
            cmpMarkup.classList.remove('text-success')
            changeContainer.classList.remove('text-success')

            cmpMarkup.classList.add('text-danger')
            changeContainer.classList.add('text-danger')
        }

        buyBar.style.width = `${buyPercentage}%`
        sellBar.style.width = `${sellPercentage}%`
    })
}