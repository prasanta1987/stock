const tableBody = document.querySelector('.stockdata')
const noWatchlist = document.querySelector('.noWatchlist')
const mycardcontainer = document.querySelector('.mycardcontainer')

const getMyWatchList = () => {

    console.log(userData)

    if (sessionStorage.watchList.length > 0 & sessionStorage.watchList != "undefined") {
        const myWatchLists = sessionStorage.watchList.split(',')

        myWatchLists.map(symbol => {

            fetch(`/stock/${symbol}`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    mycardcontainer.innerHTML += `
                                <div class="container rounded p-2 mt-3 mb-3 border border-dark ${data.info.symbol}">
                                    <div class="row">
                                        <div class="col-sm-2 col-md-3 col-lg-3">
                                            <h3 class="lead">${data.info.companyName} (${data.info.symbol})</h3>
                                            <small class="d-block">Last Update: <span class="upd">${data.metadata.lastUpdateTime}</span></small>
                                            <small class="d-block">Industry: <span class="indstry">${data.info.industry}</span></small>
                                        </div>

                                        <div class="col-sm-12 col-md-2  col-lg-2 v-c-c text-light rounded ${(data.priceInfo.change > 0 ? 'bg-success' : 'bg-danger')}">
                                            <div class="text-center">
                                            <h4 class="cmp">${data.priceInfo.lastPrice}</h4>
                                            <span class="cmpcng">${data.priceInfo.pChange.toFixed(2)}</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            `
                })
                .catch(err => console.log(err))
        })

    } else {
        noWatchlist.innerHTML = "Your Watch List is Empty"
        console.log('Watchlist Empty')
    }
}


getMyWatchList()

// setInterval(getMyWatchList, 1000)


const getNifty50Data = () => {

    fetch('/nifty50', {
        method: 'POST'
    })
        .then(res => res.json())
        .then(data => {
            let stockData = data.data
            console.log(data)
            stockData.shift()
            tableBody.innerHTML = ''
            stockData.map(value => {
                tableBody.innerHTML += `
                    <td><a href="/${value.symbol}">${value.symbol}</a></td>
                    <td class="d-none d-sm-block d-xs-block">${value.previousClose}</td>
                    <td>${value.open}</td>
                    <td>${value.dayHigh}</td>
                    <td>${value.dayLow}</td>
                    <td class="d-none d-md-block d-sm-block d-xs-block">${value.lastPrice}</td>
                    <td>${value.change.toFixed(2)}</td>
                    <td class="d-none d-sm-block d-xs-block">${value.pChange}</td>
                    <td class="d-none">${value.totalTradedVolume.toFixed(2)}</td>
                    <td class="d-none">${value.totalTradedValue.toFixed(2)}</td>
                    <td class="d-none">${value.yearHigh}</td>
                    <td class="d-none">${value.yearLow}</td>
                    <td class="d-none"> <img src="${value.chartTodayPath}" /></td>
                `
            })
        })
        .catch(err => console.log(err))

}


// getNifty50Data()
// setInterval(getNifty50Data,1000);