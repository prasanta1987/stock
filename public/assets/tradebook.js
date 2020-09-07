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
                <tr class="text-center">
                    <td>${data.symbol}</td>
                    <td>${data.date}</td>
                    <td>${data.price.toFixed(2)}</td>
                    <td>${data.qty}</td>
                    <td><kbd class="bg-light ${(data.type == 'BUY' ? 'text-danger' : 'text-success')}">${data.type}</kbd></td>
                    ${(data.type == 'BUY')
                ? `<td>0</td><td>${(data.qty * data.price).toFixed(2)}</td>`
                : `<td>${(data.qty * data.price).toFixed(2)}</td><td>0</td>`}
                
                ${(data.status == 'pending')
                ? (data.type == 'BUY')
                    ? `<td>
                        <button class="btn btn-sm btn-outline-warning" data-toggle="modal" data-target="#exampleModal" onClick="sellModal('${data.symbol}','${data.id}')">SELL</button>
                        <button class="btn btn-sm btn-outline-danger">Delete</button>
                    </td>`
                    : '<td><kbd class="bg-light text-success">SOLD</kbd></td>'
                : '<td><kbd class="bg-light text-success">COMPLETED</kbd></td>'}
                
                </tr>
            `
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
            <td></td>
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

        console.log(mySymbol, totalBuyQty, avgBuyBrice)

    })
}

const sellModal = (symbol, trID) => {

    document.querySelector('#symbolname').innerHTML = symbol
    document.querySelector('#symbolname').setAttribute('data-ID', trID)
}

const sellShare = () => {

    let sDate = document.querySelector('#solddate').value
    let sQty = document.querySelector('#soldqty').value
    let sPrice = document.querySelector('#soldprice').value
    let trID = document.querySelector('#symbolname').getAttribute('data-ID')
    let symbol = document.querySelector('#symbolname').innerHTML

    let soldPrice = sQty * sPrice

    console.log(symbol, trID)

    fetch(`/sellOrder/${trID}/${symbol}/${sQty}/${soldPrice}/${sDate}`, fetchOption)
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => {
            console.log(err)
        })

}