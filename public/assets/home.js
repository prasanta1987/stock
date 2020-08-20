const gainers = document.querySelector('.gainers')
const loosers = document.querySelector('.loosers')


const fetchOption = { "method": 'POST' }

fetch('/gainers', fetchOption)
    .then(res => res.json())
    .then(data => {
        data.NIFTY.data.map(scrips => {
            let ltp = (scrips.ltp).toFixed(2)
            let perChange = (scrips.perChange).toFixed(2)
            let increase = (ltp - scrips.prev_price).toFixed(2)

            createNameCard(scrips.symbol, ltp, perChange, increase, 'gainers')
        })
    })
    .catch(err => console.log(err))

fetch('/loosers', fetchOption)
    .then(res => res.json())
    .then(data => {
        data.NIFTY.data.map(scrips => {
            let ltp = (scrips.ltp).toFixed(2)
            let perChange = (scrips.perChange).toFixed(2)
            let increase = (ltp - scrips.prev_price).toFixed(2)

            createNameCard(scrips.symbol, ltp, perChange, increase, 'loosers')
        })
    })
    .catch(err => console.log(err))

fetch('/activeByValue', fetchOption)
    .then(res => res.json())
    .then(data => {
        data.data.map(scrips => {
            console.log(scrips)
            let ltp = (scrips.closePrice).toFixed(2)
            let perChange = (scrips.pChange).toFixed(2)
            let increase = (scrips.change).toFixed(2)

            createNameCard(scrips.symbol, ltp, perChange, increase, 'value')
        })
    })
    .catch(err => {
        console.log(err)
    })

fetch('/activeByVolume', fetchOption)
    .then(res => res.json())
    .then(data => {
        data.data.map(scrips => {
            console.log(scrips)
            let ltp = (scrips.lastPrice).toFixed(2)
            let perChange = (scrips.pChange).toFixed(2)
            let increase = (scrips.change).toFixed(2)

            createNameCard(scrips.symbol, ltp, perChange, increase, 'volume')
        })
    })
    .catch(err => {
        console.log(err)
    })

const createNameCard = async (symbol, ltp, perChange, increase, stat) => {

    if (stat == 'gainers') {
        gainers.innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center text-light bg-success rounded" href="/${symbol}">
                <h3 class="flex-grow-1 m-0 lead">${symbol}</h3>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="mr-5 mb-0 lead">${ltp}</p>
                    <p class="m-0 lead">${increase}<b>(${perChange})</b></p>
                </div>
            </a>
            `
    } else if (stat == 'loosers') {
        loosers.innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center text-light bg-danger rounded" href="/${symbol}">
                <h3 class="flex-grow-1 m-0 lead">${symbol}</h3>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="mr-5 mb-0 lead">${ltp}</p>
                    <p class="m-0 lead">${increase}<b>(${perChange})</b></p>
                </div>
            </a>
            `
    } else if (stat == 'value') {
        document.querySelector('.value').innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center text-light bg-info rounded" href="/${symbol}">
                <h3 class="flex-grow-1 m-0 lead">${symbol}</h3>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="mr-5 mb-0 lead">${ltp}</p>
                    <p class="m-0 lead">${increase}<b>(${perChange})</b></p>
                </div>
            </a>
            `
    } else if (stat == 'volume') {
        document.querySelector('.volume').innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center text-light bg-info rounded" href="/${symbol}">
                <h3 class="flex-grow-1 m-0 lead">${symbol}</h3>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="mr-5 mb-0 lead">${ltp}</p>
                    <p class="m-0 lead">${increase}<b>(${perChange})</b></p>
                </div>
            </a>
            `
    }
}
