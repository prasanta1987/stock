const companyname = document.querySelector('.companyname')
const suggestionresponse = document.querySelector('.suggestionresponse')

let userData = []

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
    } catch (error) {
        console.log(error)
        setTimeout(getUserData, 5000)
    }
}


getUserData()

// Search Engine
companyname.addEventListener('keyup', () => {

    let name = companyname.value
    if (name.length > 2) {
        fetch(`/search/${name}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                suggestionresponse.innerHTML = ''

                data.data.stocks.map(ele => {
                    console.log(ele)
                    suggestionresponse.innerHTML += `
                    <span class="p-1 border suggestion">
                        <span class="name text-dark"><a href="/${ele.sid}">${ele.name}</a></span>
                        <div>
                            <span class="name text-dark">${ele.quote.price} (${ele.quote.change}%)</span>
                            <button id="${ele.sid}" class="btn btn-sm btn-outline-success" onClick="addSymbolToprofile('${ele.sid}')">ADD</button>
                        </div>
                    </span>`
                })

                // filterSymbols(userData.watchList)

            })
            .catch(err => console.log(err))
    } else {
        suggestionresponse.innerHTML = ''
    }
})

const addSymbolToprofile = (symbol) => {

    fetch(`/addSymbol/${symbol}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            userData.watchList.push(symbol)
            filterSymbols(userData.watchList)
            showAddBtn()
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
            showAddBtn()
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
