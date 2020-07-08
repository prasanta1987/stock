const btn = document.querySelector('.rgisbtn')
const name = document.querySelector('#name')
const companyname = document.querySelector('.companyname')
const suggestionresponse = document.querySelector('.suggestionresponse')

btn.addEventListener('click', () => {
    let userName = name.value
    fetch(`/updateName/${userName}`, { method: 'POST' })
        .then(res => {
            if (res.status == 200) {
                // setTimeout(() => { window.location = '/' }, 1000)
            }
        })
        .catch(err => console.log(err))
})


companyname.addEventListener('keyup', () => {

    let name = companyname.value

    if (name.length > 1) {
        fetch(`/indexSymbol/${name}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                suggestionresponse.innerHTML = ''
                data.message.map(ele => {
                    // console.log(ele)
                    suggestionresponse.innerHTML += `
                    <span class="p-1 border suggestion">
                        <span class="name">${ele.companyName}</span>
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
        })
        .catch(err => console.log(err))
}

const removeSymbolFromProfile = (symbol) => {

    console.log(symbol)
    fetch(`/removeSymbol/${symbol}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            console.log(data)
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
