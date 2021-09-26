const companyname = document.querySelector('.companyname')
const suggestionresponse = document.querySelector('.suggestionresponse')

let userData = []
const fetchOption = { method: "POST" }

const getMarketStat = async () => {

    try {
        let res = await fetch('marketStatus', { method: 'POST' })
        let data = await res.json()
        let marketStat = (data.marketState[0].marketStatus).toUpperCase()
        if (marketStat == 'CLOSED' || marketStat == 'CLOSE') {
            sessionStorage.marketStat = 'Closed'
            document.querySelector('.nav').style.backgroundColor = '#e04f4f'
        }
    } catch (err) {
        console.log(err)
    }
}
getMarketStat()
setInterval(getMarketStat, 5000)

const getUserData = async () => {

    try {
        let res = await fetch('/getUserData', { method: 'POST' })
        let data = await res.json()
        userData = data
        if (document.querySelector('#name')) {
            document.querySelector('#name').setAttribute('placeholder', data.name)
        }
        if (document.querySelector('.mycardcontainer')) userData.watchList.map(item => buildCards(item))
        if (document.querySelector('.tradebook')) {
            getMyOrders()
            getTransactions()
            getHoldings()
            // growwBatchData()
            tickerTapeBatchData()
        }
    } catch (error) {
        console.log(error)
        setTimeout(getUserData, 5000)
    }
}


getUserData()

if (companyname) {
    companyname.addEventListener('keyup', () => {

        let name = companyname.value
        if (name.length > 2) {
            fetch(`/tickertapeSymbolSearch/${name}`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    console.log(data.data.stocks)
                    suggestionresponse.innerHTML = ''
                    data.data.stocks.map(ele => {
                        suggestionresponse.innerHTML += `
                        <span class="p-1 border suggestion">
                            <span class="name text-dark">
                                <a href="/${ele.sid}">${ele.name} <b>(${ele.ticker})</b> </a>
                            </span>
                            <button id="${ele.sid}" class="btn btn-sm btn-outline-success" onClick="addSymbolToprofile('${ele.sid}')">ADD</button>
                        </span>`

                    })
                    filterSymbols(userData.watchList)
                })
                .catch(err => console.log(err))

        } else {
            suggestionresponse.innerHTML = ''
        }
    })
}

const addSymbolToprofile = (symbol) => {

    fetch(`/addSymbol/${symbol}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            userData.watchList.push(symbol)
            filterSymbols(userData.watchList)

            if (document.querySelector('.mycardcontainer')) buildCards(symbol)
            if (document.querySelector('.stockname')) showAddBtn()
            // setTimeout(getMyWatchList, 1000)
        })
        .catch(err => console.log(err))
}

const removeSymbolFromProfile = (symbol) => {

    fetch(`/removeSymbol/${symbol}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            let index = userData.watchList.indexOf(symbol)
            userData.watchList.splice(index, 1)

            if (document.querySelector(`.${symbol}`)) document.querySelector(`.${symbol}`).remove()
            let foundElement = document.querySelector(`#${symbol}`)
            if (foundElement) {
                foundElement.classList.add('btn-outline-success')
                foundElement.classList.remove('btn-outline-danger')
                foundElement.innerHTML = 'ADD'
                foundElement.setAttribute('onClick', `addSymbolToprofile("${symbol}")`)
            }
            if (document.querySelector('.stockname')) showAddBtn()
        })
        .catch(err => console.log(err))

}

const filterSymbols = (userAddedSymbols) => {

    userAddedSymbols.map(symbol => {
        if (document.querySelector(`#${symbol}`)) {
            let foundElement = document.querySelector(`#${symbol}`)
            foundElement.classList.remove('btn-outline-success')
            foundElement.classList.add('btn-outline-danger')
            foundElement.innerHTML = 'REMOVE'
            foundElement.setAttribute('onClick', `removeSymbolFromProfile("${symbol}")`)
        }
    })

}

const getMMI = () => {
    fetch('getMMI', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            document.querySelector('.MMI').innerHTML = `MMI : ${(data.data.currentValue).toFixed(2)}%`
        })
        .catch(err => console.log(err))
}

setInterval(getMMI, 10000)

// const returnAvlShares = (symbol) => {

//     let totalBuyQty = 0, totalSellQty = 0;

//     userData.buyOrder.map(x => {
//         if (x.symbol == symbol) {
//             totalBuyQty += x.qty
//         }
//     })

//     userData.sellOrder.map(x => {
//         if (x.symbol == symbol) {
//             totalSellQty += x.qty
//         }
//     })

//     let avlShare = totalBuyQty - totalSellQty

//     return avlShare
// }

const returnAvlShares = (sid) => {

    let totalBuyQty = 0, totalSellQty = 0;

    userData.buyOrder.map(x => {
        if (x.sid == sid) {
            totalBuyQty += x.qty
        }
    })

    userData.sellOrder.map(x => {
        if (x.sid == sid) {
            totalSellQty += x.qty
        }
    })

    let avlShare = totalBuyQty - totalSellQty

    return avlShare
}

const returnTotalBuyQty = (trId) => {

    let totalBuyQty = 0;

    userData.buyOrder.map(x => {
        if (x.id == trId) {
            totalBuyQty += x.qty
        }
    })

    return totalBuyQty

}

const returnTotalSellQty = (buyOrderID) => {
    soldQty = 0;

    userData.sellOrder.map(x => {
        if (x.buyOrderID == buyOrderID) {
            soldQty += x.qty
        }
    })

    return soldQty

}

const retAvgSharePrice = (sid) => {
    let totalBuyQty = 0, totalBuyPrice = 0;
    let totalSellQty = 0, totalSellPrice = 0;
    let totalHoldingQty = 0, totalHoldingPrice = 0

    userData.buyOrder.map(x => {
        if (x.sid == sid && x.status == 'COMPLETED') {
            totalBuyQty += returnTotalBuyQty(x.id)
            totalBuyPrice += (returnTotalBuyQty(x.id) * x.price)
        }
    })

    userData.sellOrder.map(x => {

        if (x.sid == sid && x.status == 'COMPLETED') {
            totalSellQty += returnTotalSellQty(x.buyOrderID)
            totalSellPrice += (returnTotalSellQty(x.buyOrderID) * x.price)
        }
    })

    userData.buyOrder.map(x => {
        if (x.sid == sid && x.status == 'PENDING') {
            totalHoldingQty += returnTotalBuyQty(x.id)
            totalHoldingPrice += (returnTotalBuyQty(x.id) * x.price)
        }
    })

    return {
        totalBuyQty: totalBuyQty,
        totalBuyPrice: totalBuyPrice,
        avgBuyPrice: (totalBuyPrice / totalBuyQty).toFixed(2),

        totalSellQty: totalSellQty,
        totalSellPrice: totalSellPrice,
        avgSellPrice: (totalSellPrice / totalSellQty).toFixed(2),

        totalHoldingQty: totalHoldingQty,
        totalHoldingPrice: totalHoldingPrice,
        avgHoldingPrice: (totalHoldingPrice / totalHoldingQty).toFixed(2)


    }
}