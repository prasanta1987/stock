const tradeDataMarkup = document.querySelector('.tradedata')
const plDataMarkup = document.querySelector('.pldata')

let boughtSymbols = []
let soldSymbols = []

const getTransactions = () => {

    let totalDebit = 0, totalCredit = 0;

    userData.transactions.map(data => {
        if (data.type == 'BUY' && !boughtSymbols.includes(data.symbol)) boughtSymbols.push(data.symbol)
        if (data.type == 'SELL' && !soldSymbols.includes(data.symbol)) soldSymbols.push(data.symbol)
        tradeDataMarkup.innerHTML +=
            `
                <tr class="text-center ${data.id}">
                    <td>${data.symbol}</td>
                    <td>${data.date}</td>
                    <td>${data.price.toFixed(2)}</td>
                    <td>${data.qty}</td>
                    <td><kbd class="bg-light ${(data.type == 'BUY' ? 'text-danger' : 'text-success')}">${data.type}</kbd></td>
                    ${(data.type == 'BUY')
                ? `<td>0</td><td>${(data.qty * data.price).toFixed(2)}</td>`
                : `<td>${(data.qty * data.price).toFixed(2)}</td><td>0</td>`}
                    
                ${(data.status == 'PENDING')
                ? `<td>
                    <button class="btn btn-sm btn-outline-danger" data-toggle="modal" data-target="#sellordermodal" onClick="sellModal('${data.symbol}','${data.id}')">Sell</button>
                    <button class="btn btn-sm btn-outline-danger" onClick="deleteTrns('${data.id}')">DELETE</button></td>`
                : `<td><button class="btn btn-sm btn-outline-danger" onClick="deleteTrns('${data.id}')">DELETE</button></td>`}
                
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

    extractSymbols()

}

const extractSymbols = () => {

    boughtSymbols.map(async (mySymbol) => {

        let res = await fetch(`/growwLiveData/${mySymbol}`, fetchOption)
        let data = await res.json()

        if (document.querySelector(`#${mySymbol}`)) {
            console.log(data)
            document.querySelectorAll(`#${mySymbol}`).forEach(ele => ele.innerHTML = data.ltp)
        }
    })

}

const sellModal = (symbol, trID) => {

    document.querySelector('.symbolname').innerHTML = symbol
    document.querySelector('.symbolname').setAttribute('data-ID', trID)
    document.querySelector('.avlshare').innerHTML = returnAvlShares(symbol)
}



const addTrns = () => {

    let symbol = document.querySelector('.symbsrch').value
    let bDate = document.querySelector('#buydate').value
    let bQty = document.querySelectorAll('#buyqty')
    let bPrice = document.querySelectorAll('#buyprice')
    bDate = moment(new Date(bDate).getTime()).format('DD-MMM-YYYY')

    let totalBuyQty = 0, totalBuyPrice = 0, trades = 0, avgBuyBrice = 0;
    bQty.forEach(qty => {
        totalBuyQty += (isNaN(parseInt(qty.value))) ? 0 : parseInt(qty.value);
        (!isNaN(parseInt(qty.value))) && trades++
    })

    bPrice.forEach(qty => totalBuyPrice += (isNaN(parseFloat(qty.value))) ? 0 : parseFloat(qty.value))

    avgBuyBrice = (totalBuyPrice / trades).toFixed(2)

    let url = `/buyShare/${symbol}/${avgBuyBrice}/${totalBuyQty}/${bDate}`

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
    let boID = document.querySelector('.symbolname').getAttribute('data-id')
    let sDate = document.querySelector('#solddate').value
    let sQty = document.querySelector('#soldqty').value
    let sPrice = document.querySelector('#soldprice').value

    sDate = moment(new Date(sDate).getTime()).format('DD-MMM-YYYY')

    fetch(`/sellShare/${boID}/${symbol}/${sQty}/${sPrice}/${sDate}`, fetchOption)
        .then(res => res.json())
        .then(data => {
            if (data.message) location.reload()
        })
        .catch(err => {
            console.log(err)
        })
}

const deleteTrns = (trID) => {
    fetch(`/deleteTrans/${trID}`, fetchOption)
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
        fetch(`/searchSymbol/${name}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                suggestionresponse.innerHTML = ''
                data.symbols.map(ele => {
                    suggestionresponse.innerHTML += `
                    <span class="p-1 border suggestion">
                        <span class="name text-dark" style="cursor:pointer" onclick="pasteSymbol('${ele.symbol}')">${ele.symbol_info} (${ele.symbol})</span>
                    </span>`

                })
            })
            .catch(err => console.log(err))
    } else {
        suggestionresponse.innerHTML = ''
    }
})

const pasteSymbol = (symbol) => {
    symbSer.value = symbol
    suggestionresponse.innerHTML = ''
}