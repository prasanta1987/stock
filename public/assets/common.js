const companyname = document.querySelector('.companyname')
const suggestionresponse = document.querySelector('.suggestionresponse')

let userData = []

const getMarketStat = async () => {

    try {
        let res = await fetch('marketStatus', { method: 'POST' })
        let data = await res.json()
        let marketStat = data.marketState[0].marketStatus
        sessionStorage.marketStat = marketStat
        if (marketStat == 'Closed' || marketStat == 'Close') document.querySelector('.nav').style.backgroundColor = '#e04f4f'
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

const addSymbolToprofile = (symbol) => {

    fetch(`/addSymbol/${symbol}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            userData.watchList.push(symbol)
            filterSymbols(userData.watchList)
            setTimeout(getMyWatchList, 1000)
        })
        .catch(err => console.log(err))
}

const removeSymbolFromProfile = (symbol) => {

    fetch(`/removeSymbol/${symbol}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            let index = userData.watchList.indexOf(symbol)
            userData.watchList.splice(index, 1)

            document.querySelector(`.${symbol}`).remove()
            let foundElement = document.querySelector(`#${symbol}`)
            foundElement.classList.add('btn-outline-success')
            foundElement.classList.remove('btn-outline-danger')
            foundElement.innerHTML = 'ADD'
            foundElement.setAttribute('onClick', `addSymbolToprofile("${symbol}")`)

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
