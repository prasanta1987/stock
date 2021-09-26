const gainers = document.querySelector('.gainers')
const loosers = document.querySelector('.loosers')


const createNameCard = async (symbol, ltp, perChange, increase, stat) => {

    if (stat == 'gainers') {
        gainers.innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center justify-content-between text-light bg-success rounded" href="/${symbol}">
                <div class="d-flex flex-column justify-content-between align-items-center">
                    <h3 class="m-0 lead">${symbol}</h3>
                    <p class="m-0 lead"><b>${ltp}</b></p>
                </div>
                <div class="d-flex flex-column justify-content-between align-items-center">
                    <p class="m-0 lead">${increase}</p>
                    <p class="m-0 lead">(${perChange}%)</p>
                </div>
            </a>
            `
    } else if (stat == 'loosers') {
        loosers.innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center justify-content-between text-light bg-danger rounded" href="/${symbol}">
            <div class="d-flex flex-column justify-content-between align-items-center">
                    <h3 class="m-0 lead">${symbol}</h3>
                    <p class="m-0 lead"><b>${ltp}</b></p>
                </div>
                <div class="d-flex flex-column justify-content-between align-items-center">
                    <p class="m-0 lead">${increase}</p>
                    <p class="m-0 lead">(${perChange}%)</p>
                </div>
            </a>
            `
    } else if (stat == 'value') {
        document.querySelector('.value').innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center justify-content-between text-light bg-info rounded" href="/${symbol}">
                <div class="d-flex flex-column justify-content-between align-items-center">
                    <h3 class="m-0 lead">${symbol}</h3>
                    <p class="m-0 lead"><b>${ltp}</b></p>
                </div>
                <div class="d-flex flex-column justify-content-between align-items-center">
                    <p class="m-0 lead">${increase}</p>
                    <p class="m-0 lead">(${perChange}%)</p>
                </div>
            </a>
            `
    } else if (stat == 'volume') {
        document.querySelector('.volume').innerHTML += `
                <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center justify-content-between text-light bg-primary rounded" href="/${symbol}">
                    <div class="d-flex flex-column justify-content-between align-items-center">
                        <h3 class="m-0 lead">${symbol}</h3>
                        <p class="m-0 lead"><b>${ltp}</b></p>
                    </div>
                    <div class="d-flex flex-column justify-content-between align-items-center">
                        <p class="m-0 lead">${increase}</p>
                        <p class="m-0 lead">(${perChange}%)</p>
                    </div>
                </a>
            `
    }
}
