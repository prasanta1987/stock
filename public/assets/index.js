const tableBody = document.querySelector('.stockdata')

fetch('/nifty50', {
    method: 'POST'
})
    .then(res => res.json())
    .then(data => {
        let stockData = data.data
        console.log(stockData)
        stockData.map(value => {
            tableBody.innerHTML += `
                <td>${value.symbol}</td>
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