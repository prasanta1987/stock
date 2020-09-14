const tradeDataMarkup = document.querySelector('.tradedata')
const plDataMarkup = document.querySelector('.pldata')
const symbSer = document.querySelector('.symbsrch')

let boughtSymbols = []
let boughtSids = []
let currentHoldingSids = []
let currentHoldingSymbols = []

const getMyOrders = () => {

    let totalPL = 0
    userData.buyOrder.map(order => {
        if (!boughtSymbols.includes(order.symbol)) {
            boughtSymbols.push(order.symbol)
            if (retAvgSharePrice(order.symbol).totalSellQty > 0) {
                let pNl = ((retAvgSharePrice(order.symbol).avgSellPrice - retAvgSharePrice(order.symbol).avgBuyPrice) * retAvgSharePrice(order.symbol).totalSellQty).toFixed(2)
                document.querySelector('.pldata').innerHTML += `
                    <tr class="text-center ${order.symbol}-pl">
                        <td>${order.symbol}</td>
                        <td>${retAvgSharePrice(order.symbol).avgBuyPrice}</td>
                        <td>${retAvgSharePrice(order.symbol).avgSellPrice}</td>
                        <td>${retAvgSharePrice(order.symbol).totalSellQty}</td>
                        <td>${pNl}</td>
                        <td id="${order.symbol}-cmp">~</td>
                    </tr>
                `
                totalPL += parseFloat(pNl)
            }
        }
    })
    document.querySelector('.pldata').innerHTML += `
    <tr class="text-center" style="font-weight:bold">
        <td colspan="4">Total Gain / Loss</td>
        <td>${totalPL.toFixed(2)}</td>
    </tr>
    `
}

const getTransactions = () => {

    let totalDebit = 0, totalCredit = 0;

    userData.buyOrder.map(data => {
        if (!boughtSymbols.includes(data.symbol)) boughtSymbols.push(data.symbol)
        if (!boughtSids.includes(data.sid)) boughtSids.push(data.sid)
        tradeDataMarkup.innerHTML +=
            `
                <tr class="text-center ${data.id}">
                    <td>${data.symbol}</td>
                    <td>${moment(data.date).format('DD-MMM-YY')}</td>
                    <td>${data.price.toFixed(2)}</td>
                    <td>${data.qty}</td>
                    <td><kbd class="bg-light ${(data.type == 'BUY' ? 'text-danger' : 'text-success')}">${data.type}</kbd></td>
                    ${(data.type == 'BUY')
                ? `<td>0</td><td>${(data.qty * data.price).toFixed(2)}</td>`
                : `<td>${(data.qty * data.price).toFixed(2)}</td><td>0</td>`}
                    
                ${(data.status == 'PENDING')
                ? `<td>
                    <button class="btn btn-sm btn-outline-danger" data-toggle="modal" data-target="#sellordermodal" onClick="sellModal('${data.symbol}','${data.id}')">Sell</button>
                    <button class="btn btn-sm btn-outline-danger" onClick="deleteTrns('${data.id}','BUY')">DELETE</button></td>`
                : `<td><button class="btn btn-sm btn-outline-danger" onClick="deleteTrns('${data.id}','BUY')">DELETE</button></td>`}
                
                </tr>`
        if (data.type == 'BUY') {
            totalDebit += data.qty * data.price
        } else {
            totalCredit += data.qty * data.price
        }

    })
    userData.sellOrder.map(data => {
        tradeDataMarkup.innerHTML +=
            `
                <tr class="text-center ${data.id}">
                    <td>${data.symbol}</td>
                    <td>${moment(data.date).format('DD-MMM-YY')}</td>
                    <td>${data.price.toFixed(2)}</td>
                    <td>${data.qty}</td>
                    <td><kbd class="bg-light ${(data.type == 'BUY' ? 'text-danger' : 'text-success')}">${data.type}</kbd></td>
                    ${(data.type == 'BUY')
                ? `<td>0</td><td>${(data.qty * data.price).toFixed(2)}</td>`
                : `<td>${(data.qty * data.price).toFixed(2)}</td><td>0</td>`}
                    
                ${(data.status == 'PENDING')
                ? `<td>
                    <button class="btn btn-sm btn-outline-danger" data-toggle="modal" data-target="#sellordermodal" onClick="sellModal('${data.symbol}','${data.id}')">Sell</button>
                    <button class="btn btn-sm btn-outline-danger" onClick="deleteTrns('${data.id}','SELL')">DELETE</button></td>`
                : `<td><button class="btn btn-sm btn-outline-danger" onClick="deleteTrns('${data.id}','SELL')">DELETE</button></td>`}
                
                </tr>`
        if (data.type == 'BUY') {
            totalDebit += data.qty * data.price
        } else {
            totalCredit += data.qty * data.price
        }

    })

    tradeDataMarkup.innerHTML += `
        <tr class="text-center" style="font-weight:bold">
            <td colspan="5">TOTAL</td>
            <td>${totalCredit.toFixed(2)}</td>
            <td>${totalDebit.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-outline-success" data-toggle="modal" data-target="#exampleModal">Add Trade</button></td>
        </tr>`
}

const sellModal = (symbol, trID) => {

    document.querySelector('.symbolname').innerHTML = symbol
    document.querySelector('.symbolname').setAttribute('data-ID', trID)
    document.querySelector('.avlshare').innerHTML = returnAvlShares(symbol)
}

const addTrns = () => {

    let symbol = document.querySelector('.symbsrch').value
    let sid = document.querySelector('.symbsrch').getAttribute('data-sid')
    let bDate = document.querySelector('#buydate').value
    let bQty = document.querySelector('#buyqty').value
    let bPrice = document.querySelector('#buyprice').value

    bDate = new Date(bDate).getTime()


    let url = `/buyShare/${symbol}/${sid}/${bPrice}/${bQty}/${bDate}`

    fetch(url, fetchOption)
        .then(res => res.json())
        .then(data => {
            if (data.message) location.reload()
        })
        .catch(err => {
            console.log(err)
        })
}

const addSellTrns = () => {

    let symbol = document.querySelector('.symbolname').innerHTML
    let sDate = document.querySelector('#solddate').value
    let sQty = document.querySelector('#soldqty').value
    let sPrice = document.querySelector('#soldprice').value

    sDate = new Date(sDate).getTime()

    fetch(`/sellShare/${symbol}/${sQty}/${sPrice}/${sDate}`, fetchOption)
        .then(res => res.json())
        .then(data => {
            if (data.message) location.reload()
        })
        .catch(err => {
            console.log(err)
        })
}

const deleteTrns = (trID, type) => {
    fetch(`/deleteTrans/${trID}/${type}`, fetchOption)
        .then(res => res.json())
        .then(data => {
            // console.log(data)
            location.reload()
        })
        .catch(err => {
            console.log(err)
        })
}

symbSer.addEventListener('keyup', () => {

    let name = symbSer.value

    if (name.length > 2) {
        fetch(`/tickertapeSymbolSearch/${name}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                console.log(data.data.stocks)
                suggestionresponse.innerHTML = ''
                data.data.stocks.map(ele => {
                    suggestionresponse.innerHTML += `
                    <span class="p-1 border suggestion">
                        <span class="name text-dark" style="cursor:pointer" onclick="pasteSymbol('${ele.sid}','${ele.ticker}')">${ele.name} (${ele.ticker})</span>
                    </span>`

                })
            })
            .catch(err => console.log(err))
    } else {
        suggestionresponse.innerHTML = ''
    }
})

const pasteSymbol = (sid, symbol) => {
    symbSer.setAttribute('data-sid', sid)
    symbSer.value = symbol
    suggestionresponse.innerHTML = ''
}

const getHoldings = () => {

    for (let i = 0; i < boughtSymbols.length; i++) {

        if (returnAvlShares(boughtSymbols[i]) > 0) {
            currentHoldingSids.push(boughtSids[i])
            currentHoldingSymbols.push(boughtSymbols[i])
            document.querySelector('.holdingdata').innerHTML += `
                <tr class="text-center" id="${boughtSymbols[i]}">
                    <td>${boughtSymbols[i]}</td>
                    <td class="${boughtSids[i]}-price" id="${boughtSymbols[i]}-price">${retAvgSharePrice(boughtSymbols[i]).avlAvgPrice}</td>
                    <td class="${boughtSids[i]}-qty" id="${boughtSymbols[i]}-qty">${returnAvlShares(boughtSymbols[i])}</td>
                    <td class="${boughtSids[i]}-cmp" id="${boughtSymbols[i]}-cmp">~</td>
                    <td class="${boughtSids[i]}-pl" id="${boughtSymbols[i]}-pl">~</td>
                </tr>
            `
        }
    }

    document.querySelector('.holdingdata').innerHTML += `
                <tr class="text-center" style="font-weight:bold">
                    <td colspan="4">TOTAL Profit / Loss</td>
                    <td id="tpl">~</td>
                </tr>
    `
    growwBatchData()
}

let PL = 0

const growwBatchData = () => {

    PL = 0

    const growFetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boughtSymbols)
    }

    fetch('/growwBatchData', growFetchOptions)
        .then(res => res.json())
        .then(data => {
            genGrowwCpm(data.livePointsMap)

        })
        .catch(err => {
            console.log(err)
        })

    if (sessionStorage.marketStat != 'Closed') setTimeout(growwBatchData, 1000)
}

const genGrowwCpm = (olhc) => {

    Object.keys(olhc).map(ticker => {
        let values = olhc[ticker]
        // console.log(values)

        let preClose = values.close
        let cmp = values.ltp

        let buyQty = (document.querySelector(`#${values.symbol}-qty`)) && parseInt(document.querySelector(`#${values.symbol}-qty`).innerHTML);
        let buyPrice = (document.querySelector(`#${values.symbol}-price`)) && parseFloat(document.querySelector(`#${values.symbol}-price`).innerHTML);

        let totalPl = parseFloat(((cmp - buyPrice) * buyQty).toFixed(2))

        if (document.querySelector(`#${values.symbol}-cmp`)) {
            document.querySelectorAll(`#${values.symbol}-cmp`).forEach(ele => {
                ele.innerHTML = cmp
                if (preClose > cmp) {
                    ele.style.color = '#dc3545'
                } else {
                    ele.style.color = '#28a745'
                }
            })
        }
        if (document.querySelector(`#${values.symbol}-pl`)) {
            document.querySelectorAll(`#${values.symbol}-pl`).forEach(ele => {
                ele.innerHTML = totalPl
                if (totalPl < 0) {
                    ele.style.color = '#dc3545'
                } else {
                    ele.style.color = '#28a745'
                }
            })
        }

        PL += parseFloat(totalPl)

    })

    let PLMarkup = document.querySelector('#tpl')

    PLMarkup.innerHTML = PL.toFixed(2);
    (PL < 0) ? PLMarkup.classList.add('text-danger') : PLMarkup.classList.add('text-success')

}


// const getCMPData = () => {
//     if (sessionStorage.marketStat != 'Closed') {
//         currentHoldingSymbols.map(async (mySymbol) => genCmp(mySymbol))
//     } else {
//         tickerTapeBatchData(currentHoldingSids.join())
//     }

//     if (sessionStorage.marketStat != 'Closed') setTimeout(getCMPData, 1000)
// }

// const genCmp = async (mySymbol) => {

//     try {
//         let res = await fetch(`/growwLiveData/${mySymbol}`, fetchOption)
//         let data = await res.json()

//         console.log(data)

//         let preClose = data.close

//         if (document.querySelector(`#${mySymbol}`)) {
//             let buyQty = parseInt(document.querySelector(`#${mySymbol}-qty`).innerHTML)
//             let buyPrice = parseFloat(document.querySelector(`#${mySymbol}-price`).innerHTML)
//             let cmp = data.ltp
//             let totalPl = parseFloat(((cmp - buyPrice) * buyQty).toFixed(2))

//             document.querySelectorAll(`#${mySymbol}-cmp`).forEach(ele => {
//                 ele.innerHTML = cmp

//                 if (preClose > cmp) {
//                     ele.style.color = '#dc3545'
//                 } else {
//                     ele.style.color = '#28a745'
//                 }
//             })
//             document.querySelectorAll(`#${mySymbol}-pl`).forEach(ele => {
//                 ele.innerHTML = totalPl
//                 if (totalPl < 0) {
//                     ele.style.color = '#dc3545'
//                 } else {
//                     ele.style.color = '#28a745'
//                 }
//             })

//             PL += parseFloat(totalPl)
//             let PLMarkup = document.querySelector('#tpl')

//             PLMarkup.innerHTML = PL.toFixed(2);
//             (PL < 0) ? PLMarkup.classList.add('text-danger') : PLMarkup.classList.add('text-success')
//         }
//     } catch (err) {
//         console.log('Retrying Last Action')
//         setTimeout(() => genCmp(mySymbol), 1000)
//     }

// }


// const tickerTapeBatchData = (sids) => {

//     fetch(`/batchTickerInfo/${sids}`, fetchOption)
//         .then(res => res.json())
//         .then(data => {
//             data.data.map(values => {
//                 console.log(values)
//                 let preClose = values.c
//                 let buyQty = (document.querySelector(`.${values.sid}-qty`)) && parseInt(document.querySelector(`.${values.sid}-qty`).innerHTML);
//                 let buyPrice = (document.querySelector(`.${values.sid}-price`)) && parseFloat(document.querySelector(`.${values.sid}-price`).innerHTML);
//                 let cmp = parseFloat(values.price)
//                 let totalPl = parseFloat(((cmp - buyPrice) * buyQty).toFixed(2))

//                 if (document.querySelector(`.${values.sid}-cmp`)) {
//                     document.querySelector(`.${values.sid}-cmp`).innerHTML = cmp
//                     if (preClose > cmp) {
//                         document.querySelector(`.${values.sid}-cmp`).style.color = '#dc3545'
//                     } else {
//                         document.querySelector(`.${values.sid}-cmp`).style.color = '#28a745'
//                     }
//                 }
//                 if (document.querySelector(`.${values.sid}-pl`)) {
//                     document.querySelector(`.${values.sid}-pl`).innerHTML = totalPl
//                     if (totalPl < 0) {
//                         document.querySelector(`.${values.sid}-pl`).style.color = '#dc3545'
//                     } else {
//                         document.querySelector(`.${values.sid}-pl`).style.color = '#28a745'
//                     }
//                 }

//                 PL += parseFloat(totalPl)
//             })

//             let PLMarkup = document.querySelector('#tpl')

//             PLMarkup.innerHTML = PL.toFixed(2);
//             (PL < 0) ? PLMarkup.classList.add('text-danger') : PLMarkup.classList.add('text-success')
//         })
//         .catch(err => {
//             console.log(err)
//         })
// }
