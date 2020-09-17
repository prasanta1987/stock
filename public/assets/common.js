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
        // if (document.querySelector('.tradebook')) getTransactions()
        if (document.querySelector('.tradebook')) {
            getMyOrders()
            getTransactions()
            getHoldings()
            growwBatchData()
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
            fetch(`/searchSymbol/${name}`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    suggestionresponse.innerHTML = ''
                    data.symbols.map(ele => {
                        suggestionresponse.innerHTML += `
                    <span class="p-1 border suggestion">
                        <span class="name text-dark"><a href="/${ele.symbol}">${ele.symbol_info}</a></span>
                        <button id="${ele.symbol}" class="btn btn-sm btn-outline-success" onClick="addSymbolToprofile('${ele.symbol}')">ADD</button>
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

const returnAvlShares = (symbol) => {

    let totalBuyQty = 0, totalSellQty = 0;

    userData.buyOrder.map(x => {
        if (x.symbol == symbol) {
            totalBuyQty += x.qty
        }
    })

    userData.sellOrder.map(x => {
        if (x.symbol == symbol) {
            totalSellQty += x.qty
        }
    })

    let avlShare = totalBuyQty - totalSellQty

    return avlShare
}

const returnAvlQtyPerOrder = (trId) => {

    let holdingQty = 0, soldQty = 0;

    userData.buyOrder.map(x => {
        if (x.id == trId) {
            holdingQty += x.qty
        }
    })

    userData.sellOrder.map(x => {
        if (x.buyOrderID == trId) {
            soldQty += x.qty
        }
    })

    let avlQtyPerOrder = holdingQty - soldQty

    return avlQtyPerOrder

}

const retAvgSharePrice = (symbol) => {
    let avlBuyQty = 0, avlBuyPrice = 0, avlAvgPrice = 0;
    let totalBuyQty = 0, totalBuyPrice = 0, avgBuyPrice = 0;
    let totalSellQty = 0, totalSellPrice = 0, avgSellPrice = 0;

    userData.buyOrder.map(x => {
        if (x.symbol == symbol && x.status == 'PENDING') {
            avlBuyQty += returnAvlQtyPerOrder(x.id)
            avlBuyPrice += (returnAvlQtyPerOrder(x.id) * x.price)
        }
    })

    userData.sellOrder.map(x => {
        if (x.symbol == symbol) {
            totalSellQty += x.qty
            totalSellPrice += (x.qty * x.price)

            userData.buyOrder.map(y => {
                if (y.id == x.buyOrderID) {
                    totalBuyQty += y.id
                    totalBuyPrice += y.id * y.price
                }
            })
        }
    })



    avlAvgPrice = (avlBuyPrice / avlBuyQty).toFixed(2)
    avgBuyPrice = (totalBuyPrice / totalBuyQty).toFixed(2)
    avgSellPrice = (totalSellPrice / totalSellQty).toFixed(2)


    return {
        avlAvgPrice: (isNaN(avlAvgPrice)) ? 0 : avlAvgPrice,
        avgBuyPrice: (isNaN(avgBuyPrice)) ? 0 : avgBuyPrice,
        avgSellPrice: (isNaN(avgSellPrice)) ? 0 : avgSellPrice,
        totalSellQty: totalSellQty
    }
}