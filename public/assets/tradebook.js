const tradeDataMarkup = document.querySelector('.tradedata')
const plDataMarkup = document.querySelector('.pldata')
const symbSer = document.querySelector('.symbsrch')

let boughtSymbols = []
let currentHoldingSymbols = []
let currentHoldingSids = []
let boughtSids = []

let PL = 0, PLwrtCMP = 0;



const sellModal = (symbol, sid, trID) => {

    console.log(symbol, sid, trID)

    document.querySelector('.symbolname').innerHTML = symbol
    document.querySelector('.symbolname').setAttribute('data-ID', trID)
    document.querySelector('.symbolname').setAttribute('data-sid', sid)
    document.querySelector('.avlshare').innerHTML = returnAvlShares(sid)
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
    let sid = document.querySelector('.symbolname').getAttribute('data-sid')
    let sDate = document.querySelector('#solddate').value
    let sQty = document.querySelector('#soldqty').value
    let sPrice = document.querySelector('#soldprice').value

    console.log(symbol, sDate, sQty, sPrice)

    sDate = new Date(sDate).getTime()


    fetch(`/sellShare/${symbol}/${sid}/${sQty}/${sPrice}/${sDate}`, fetchOption)
        .then(res => res.json())
        .then(data => {
            console.log(data)
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

    for (let i = 0; i < boughtSids.length; i++) {

        if (returnAvlShares(boughtSids[i]) > 0) {
            currentHoldingSids.push(boughtSids[i])
            document.querySelector('.holdingdata').innerHTML += `
                <tr class="text-center" id="${boughtSids[i]}">
                    <td>${boughtSymbols[i]}</td>
                    <td id="${boughtSids[i]}-price">${retAvgSharePrice(boughtSids[i]).avgHoldingPrice}</td>
                    <td id="${boughtSids[i]}-qty">${returnAvlShares(boughtSids[i])}</td>
                    <td id="${boughtSids[i]}-cmp">~</td>
                    <td id="${boughtSids[i]}-pl">~</td>
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
}

const getMyOrders = () => {

    let totalPL = 0
    userData.buyOrder.map(order => {
        if (!boughtSymbols.includes(order.symbol)) {
            boughtSymbols.push(order.symbol)
            boughtSids.push(order.sid)
            if (retAvgSharePrice(order.sid).totalSellQty > 0) {

                let avgSellprice = retAvgSharePrice(order.sid).avgSellPrice,
                    avgBuyPrice = retAvgSharePrice(order.sid).avgBuyPrice,
                    totalSellQty = retAvgSharePrice(order.sid).totalSellQty;

                let pNl = parseFloat(((avgSellprice - avgBuyPrice) * totalSellQty).toFixed(2))

                document.querySelector('.pldata').innerHTML += `
                    <tr class="text-center ${order.sid}-pl">
                        <td data-sid="${order.sid}">${order.symbol}</td>
                        <td class="${order.sid}-avgBP">${retAvgSharePrice(order.sid).avgBuyPrice}</td>
                        <td class="${order.sid}-avgSP">${retAvgSharePrice(order.sid).avgSellPrice}</td>
                        <td class="${order.sid}-avgSQ">${retAvgSharePrice(order.sid).totalSellQty}</td>
                        <td class="${order.sid}-avgpl">${pNl}</td>
                        <td class="${order.sid}-avgcmp" id="${order.sid}-cmp">~</td>
                        <td class="${order.sid}-avgcmpPL">~</td>
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
        <td></td>
        <td class="pnlwrtcmp">~</td>
    </tr>
    `
}

const getTransactions = () => {

    let totalDebit = 0, totalCredit = 0;

    userData.buyOrder.map(data => {
        tradeDataMarkup.innerHTML +=
            `
                <tr class="text-center ${data.id}">
                    <td data-sid="${data.sid}">${data.symbol}</td>
                    <td>${moment(data.date).format('DD-MMM-YY')}</td>
                    <td>${data.price.toFixed(2)}</td>
                    <td>${data.qty}</td>
                    <td><kbd class="bg-light ${(data.type == 'BUY' ? 'text-danger' : 'text-success')}">${data.type}</kbd></td>
                    ${(data.type == 'BUY')
                ? `<td>0</td><td>${(data.qty * data.price).toFixed(2)}</td>`
                : `<td>${(data.qty * data.price).toFixed(2)}</td><td>0</td>`}
                    
                ${(data.status == 'PENDING')
                ? `<td>
                    <button class="btn btn-sm btn-outline-danger" data-toggle="modal" data-target="#sellordermodal" onClick="sellModal('${data.symbol}','${data.sid}','${data.id}')">Sell</button>
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
                    <button class="btn btn-sm btn-outline-danger" data-toggle="modal" data-target="#sellordermodal" onClick="sellModal('${data.symbol}','${data.sid}','${data.id}')">Sell</button>
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

const tickerTapeBatchData = () => {

    if (boughtSymbols.length > 0) {

        fetch(`/batchTickerInfo/${boughtSids}`, fetchOption)
            .then(res => res.json())
            .then(data => {
                data.data.map(values => {
                    console.log(values)
                    let preClose = values.c
                    let buyQty = (document.querySelector(`#${values.sid}-qty`)) && parseInt(document.querySelector(`#${values.sid}-qty`).innerHTML);
                    let buyPrice = (document.querySelector(`#${values.sid}-price`)) && parseFloat(document.querySelector(`#${values.sid}-price`).innerHTML);
                    let cmp = parseFloat(values.price)
                    let totalPl = parseFloat(((cmp - buyPrice) * buyQty).toFixed(2))

                    if (document.querySelector(`#${values.sid}-cmp`)) {
                        document.querySelectorAll(`#${values.sid}-cmp`).forEach((entries => {
                            entries.innerHTML = cmp
                            if (preClose > cmp) {
                                entries.style.color = '#dc3545'
                            } else {
                                entries.style.color = '#28a745'
                            }
                        }))
                    }

                    if (document.querySelector(`#${values.sid}-pl`)) {
                        document.querySelectorAll(`#${values.sid}-pl`).forEach(entries => {
                            entries.innerHTML = totalPl
                            if (totalPl < 0) {
                                entries.style.color = '#dc3545'
                            } else {
                                entries.style.color = '#28a745'
                            }
                        })
                    }

                    PL += parseFloat(totalPl)
                })

                let PLMarkup = document.querySelector('#tpl')

                PLMarkup.innerHTML = PL.toFixed(2);
                (PL < 0) ? PLMarkup.classList.add('text-danger') : PLMarkup.classList.add('text-success')
            })
            .catch(err => {
                console.log(err)
            })

    }

}