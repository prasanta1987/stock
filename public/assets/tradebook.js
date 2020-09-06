const tradeDataMarkup = document.querySelector('.tradedata')

const getTransactions = () => {

    let transacrtions = userData.transactions.sort()
    transacrtions.map(buyData => {
        tradeDataMarkup.innerHTML +=
            `
                <tbody>
                    <tr class="text-center">
                        <th scope="row" class="font-weight-normal">${buyData.symbol}</th>
                        <td>${buyData.date}</td>
                        <td>${buyData.price.toFixed(2)}</td>
                        <td>${buyData.qty}</td>
                        <td><kbd class="bg-light ${(buyData.type == 'BUY' ? 'text-danger' : 'text-success')}">${buyData.type}</kbd></td>
                        <td>${(buyData.qty * buyData.price).toFixed(2)}</td>
                    </tr>
                </tbody>
            `
    })




}