const tableBody = document.querySelector('.stockdata')
const companyname = document.querySelector('#companyname')
const suggestionresponse = document.querySelector('.suggestionresponse')

companyname.addEventListener('keyup',()=>{

    let name = companyname.value

    if(name.length > 1){
        fetch(`/indexSymbol/${name}`,{method : 'POST'})
        .then(res => res.json())
        .then(data => {
            suggestionresponse.innerHTML = ''
            data.message.map(ele=>{
                console.log(ele)
                suggestionresponse.innerHTML += `
                    <a class="p-1 bg-secondary text-light suggestion" href="/${ele.symbol}">
                        <span class="name">${ele.companyName}</span>
                        <small class="symbol">${ele.symbol}</small>
                    </a>`

            })
        })
        .catch(err => console.log(err))
    } else {
        suggestionresponse.innerHTML = ''
    }
})


const getNifty50Data = ()=>{

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


getNifty50Data()
// setInterval(getNifty50Data,1000);