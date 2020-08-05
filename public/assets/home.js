const gainers = document.querySelector('.gainers')
const loosers = document.querySelector('.loosers')


const fetchOption = { "method": 'POST' }

fetch('/gainers', fetchOption)
    .then(res => res.json())
    .then(data => {
        let dispCount = 100
        data.NIFTY.data.map(scrips => {
            if (dispCount > 0) {
                let ltp = (scrips.ltp).toFixed(2)
                let perChange = (scrips.perChange).toFixed(2)
                let increase = (ltp - scrips.prev_price).toFixed(2)

                getCompanyName(scrips.symbol, ltp, perChange, increase, 'gainers')
            }
            dispCount--;
        })
    })
    .catch(err => console.log(err))

fetch('/loosers', fetchOption)
    .then(res => res.json())
    .then(data => {
        let dispCount = 500
        data.NIFTY.data.map(scrips => {
            if (dispCount > 0) {
                let ltp = (scrips.ltp).toFixed(2)
                let perChange = (scrips.perChange).toFixed(2)
                let increase = (ltp - scrips.prev_price).toFixed(2)

                getCompanyName(scrips.symbol, ltp, perChange, increase, 'loosers')
            }
            dispCount--;
        })
    })
    .catch(err => console.log(err))

const getCompanyName = async (symbol, ltp, perChange, increase, stat) => {

    try {

        let res = await fetch(`/searchSymbol/${symbol}`, fetchOption)
        let data = await res.json()
        if (stat == 'gainers') {
            gainers.innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center text-light bg-success rounded" href="/${symbol}">
                <h3 class="flex-grow-1 m-0 lead">${data.symbols[0].symbol_info}</h3>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="mr-5 mb-0 lead">${ltp}</p>
                    <p class="m-0 lead">${increase}<b>(${perChange})</b></p>
                </div>
            </a>
            `
        } else if (stat == 'loosers') {
            loosers.innerHTML += `
            <a class="d-flex p-1 pl-2 pr-2 mylinks align-items-center text-light bg-danger rounded" href="/${symbol}">
                <h3 class="flex-grow-1 m-0 lead">${data.symbols[0].symbol_info}</h3>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="mr-5 mb-0 lead">${ltp}</p>
                    <p class="m-0 lead">${increase}<b>(${perChange})</b></p>
                </div>
            </a>
            `
        }

    } catch (err) {
        console.log(err)
        // setTimeout(getCompanyName(symbol, niftyData, stat), 1000)
    }

}



// const getCompanyName = async (symbol, ltp, perChange, increase, stat) => {

//     try {

//         let res = await fetch(`/searchSymbol/${symbol}`, fetchOption)
//         let data = await res.json()

//         if (stat == 'gainers') {
//             gainers.innerHTML += `
//             <a class="d-flex flex-column mylinks p-1 text-center text-light bg-success border border-success rounded" href="/${symbol}">
//                 <h3 class="flex-grow-1 m-0 lead">${data.symbols[0].symbol_info}</h3>
//                 <div><hr class="bg-light" /></div>
//                 <div class="d-flex justify-content-between align-items-center">
//                     <p class="m-0 lead">${ltp}</p>
//                     <p class="m-0 lead">${increase}<b>(${perChange})</b></p>
//                 </div>
//             </a>
//             `
//         } else if (stat == 'loosers') {
//             loosers.innerHTML += `
//                 <a class="d-flex flex-column mylinks p-1 text-center text-light bg-danger border border-danger rounded" href="/${symbol}">
//                     <h3 class="flex-grow-1 m-0 lead"><b>${data.symbols[0].symbol_info}</b></h3>
//                     <div><hr class="bg-light" /></div>
//                     <div class="d-flex justify-content-between align-items-center">
//                         <p class="m-0 lead">${ltp}</p>
//                         <p class="m-0 lead">${increase}<b>(${perChange})</b></p>
//                     </div>
//                 </a>
//             `
//         }

//     } catch (err) {
//         console.log(err)
//         // setTimeout(getCompanyName(symbol, niftyData, stat), 1000)
//     }

// }