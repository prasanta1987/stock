const tradeDataMarkup = document.querySelector('.tradedata')
const plDataMarkup = document.querySelector('.pldata')

let boughtSymbols = []
let soldSymbols = []

const getTransactions = () => {

    userData.transactions.map(data => {
        if (data.type == 'BUY' && !boughtSymbols.includes(data.symbol)) boughtSymbols.push(data.symbol)
        if (data.type == 'SELL' && !soldSymbols.includes(data.symbol)) soldSymbols.push(data.symbol)
        tradeDataMarkup.innerHTML +=
            `
                <tbody>
                    <tr class="text-center">
                        <th scope="row" class="font-weight-normal">${data.symbol}</th>
                        <td>${data.date}</td>
                        <td>${data.price.toFixed(2)}</td>
                        <td>${data.qty}</td>
                        <td><kbd class="bg-light ${(data.type == 'BUY' ? 'text-danger' : 'text-success')}">${data.type}</kbd></td>
                        <td>${(data.qty * data.price).toFixed(2)}</td>
                    </tr>
                </tbody>
            `
    })

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