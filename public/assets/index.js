const tableBody = document.querySelector('.stockdata')

const myWatchLists = sessionStorage.watchList.split(',')

myWatchLists.map(symbol => {

    fetch(`/stock/${symbol}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => console.log(err))
})

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