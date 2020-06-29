const companyName = document.querySelector('.stockname')
const updateTimeInfo = document.querySelector('.updateTimeInfo')
const baseprice = document.querySelector('.baseprice')
const lastprice = document.querySelector('.lastprice')
const changeprice = document.querySelector('.changeprice')


const symbol = window.location.pathname.replace('/', '')

fetch(`/stock/${symbol}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        companyName.innerHTML = data.info.companyName
        updateTimeInfo.innerHTML = `Last Update : ${data.preOpenMarket.lastUpdateTime}`
        baseprice.innerHTML = `Base Price : ${data.priceInfo.basePrice}`
        lastprice.innerHTML = `Last Price : ${data.priceInfo.lastPrice}`
        changeprice.innerHTML = `Change Price : ${data.priceInfo.change.toFixed(2)}`
    })
    .catch(err => console.log(err))