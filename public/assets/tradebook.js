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
                <tr class="text-center my${data.id}">
                    <td>${data.symbol}</td>
                    <td>${data.date}</td>
                    <td>${data.price.toFixed(2)}</td>
                    <td>${data.qty}</td>
                    <td><kbd class="bg-light ${(data.type == 'BUY' ? 'text-danger' : 'text-success')}">${data.type}</kbd></td>
                    ${(data.type == 'BUY')
                ? `<td>0</td><td>${(data.qty * data.price).toFixed(2)}</td>`
                : `<td>${(data.qty * data.price).toFixed(2)}</td><td>0</td>`}
                    <td><button class="btn btn-sm btn-outline-danger" onClick="deleteTrns('${data.id}')">Delete</button></td >
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

    boughtSymbols.map(mySymbol => {

        let totalBuyQty = 0, totalBuyPrice = 0;
        userData.transactions.map(data => {

            if (data.symbol == mySymbol) {
                if (data.type == 'BUY') {
                    totalBuyQty += data.qty
                    totalBuyPrice += data.price
                }
            }

        })
        let avgBuyBrice = totalBuyPrice / totalBuyQty
    })
}

const sellModal = (symbol, trID) => {

    document.querySelector('#symbolname').innerHTML = symbol
    document.querySelector('#symbolname').setAttribute('data-ID', trID)
    document.querySelector('.avlshare').innerHTML = returnAvlShare(symbol)
}



const addTrns = (type) => {

    let symbol = document.querySelector('.symbsrch').value
    let sDate = document.querySelector('#solddate').value
    let sQty = document.querySelector('#soldqty').value
    let sPrice = document.querySelector('#soldprice').value

    let url = ''
    sDate = moment(new Date(sDate).getTime()).format('DD-MMM-YYYY')

    if (type == 'BUY') {
        url = `/buyShare/${symbol}/${sPrice}/${sQty}/${sDate}`
    } else if (type == 'SELL') {
        url = `/sellShare/${symbol}/${sPrice}/${sQty}/${sDate}`
    }

    fetch(url, fetchOption)
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