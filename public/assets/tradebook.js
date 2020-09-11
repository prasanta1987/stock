const tradeDataMarkup = document.querySelector('.tradedata')
const plDataMarkup = document.querySelector('.pldata')

let boughtSymbols = []
let boughtSids = []

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

    getHoldings()
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

const symbSer = document.querySelector('.symbsrch')

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

    let avgPrice = 0

    for (let i = 0; i < boughtSymbols.length; i++) {

        if (returnAvlShares(boughtSymbols[i]) > 0) {
            document.querySelector('.holdingdata').innerHTML += `
                <tr class="text-center" id="${boughtSymbols[i]}">
                    <td>${boughtSymbols[i]}</td>
                    <td class="${boughtSids[i]}-price" id="${boughtSymbols[i]}-price">${retAvgSharePrice(boughtSymbols[i])}</td>
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
    getCMPData()
}


let PL = 0
const getCMPData = () => {
    if (sessionStorage.marketStat != 'Closed') {
        boughtSymbols.map(async (mySymbol) => genCmp(mySymbol))
    } else {
        tickerTapeBatchData(boughtSids.join())
    }

    if (sessionStorage.marketStat != 'Closed') setTimeout(getCMPData, 1000)
}

const genCmp = async (mySymbol) => {

    try {
        let res = await fetch(`/growwLiveData/${mySymbol}`, fetchOption)
        let data = await res.json()

        if (document.querySelector(`#${mySymbol}`)) {
            let buyQty = parseInt(document.querySelector(`#${mySymbol}-qty`).innerHTML)
            let buyPrice = parseFloat(document.querySelector(`#${mySymbol}-price`).innerHTML)
            let cmp = parseFloat(data.ltp)
            let totalPl = ((cmp - buyPrice) * buyQty).toFixed(2)

            document.querySelectorAll(`#${mySymbol}-cmp`).forEach(ele => ele.innerHTML = cmp)
            document.querySelectorAll(`#${mySymbol}-pl`).forEach(ele => ele.innerHTML = totalPl)

            PL += parseFloat(totalPl)
            let PLMarkup = document.querySelector('#tpl')

            PLMarkup.innerHTML = PL.toFixed(2);
            (PL < 0) ? PLMarkup.classList.add('text-danger') : PLMarkup.classList.add('text-success')
        }
    } catch (err) {
        console.log('Retrying Last Action')
        setTimeout(() => genCmp(mySymbol), 1000)
    }

}

const tickerTapeBatchData = (sids) => {

    fetch(`/batchTickerInfo/${sids}`, fetchOption)
        .then(res => res.json())
        .then(data => {
            data.data.map(values => {
                let buyQty = (document.querySelector(`.${values.sid}-qty`)) && parseInt(document.querySelector(`.${values.sid}-qty`).innerHTML);
                let buyPrice = (document.querySelector(`.${values.sid}-price`)) && parseFloat(document.querySelector(`.${values.sid}-price`).innerHTML);
                let cmp = values.price
                let totalPl = ((cmp - buyPrice) * buyQty).toFixed(2)

                if (document.querySelector(`.${values.sid}-cmp`)) document.querySelector(`.${values.sid}-cmp`).innerHTML = cmp
                if (document.querySelector(`.${values.sid}-pl`)) document.querySelector(`.${values.sid}-pl`).innerHTML = totalPl
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