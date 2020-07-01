const companyName = document.querySelector('.stockname')
const updateTimeInfo = document.querySelector('.updateTimeInfo')
const baseprice = document.querySelector('.baseprice')
const lastprice = document.querySelector('.lastprice')
const changeprice = document.querySelector('.changeprice')
const industryinfo = document.querySelector('.industryinfo')
const chartdatainfo = document.querySelector('.chartdatainfo')


const symbol = window.location.pathname

fetch(`/stock${symbol}`, { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    console.log(data)
    companyName.innerHTML = data.info.companyName
    industryinfo.innerHTML = `Industry : ${data.metadata.industry}`
    updateTimeInfo.innerHTML = `Last Update : ${data.metadata.lastUpdateTime}`
    baseprice.innerHTML = `Base Price : ${data.priceInfo.basePrice}`
    lastprice.innerHTML = `Last Price : ${data.priceInfo.lastPrice}`
    changeprice.innerHTML = `Change Price : ${data.priceInfo.change.toFixed(2)}`
    if (data.priceInfo.change > 0) {
      changeprice.classList.add("text-success")
    } else {
      changeprice.classList.add("text-danger")
    }

    chartdatainfo.innerHTML = 'Loading Chart Data.'
    getChartData(data.info.identifier, data.info.companyName)
  })
  .catch(err => console.log(err))



const getChartData = (inden, companyName) => {
  fetch(`/candleData/${inden}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      chartdatainfo.innerHTML = ''
      let grapthData = data.grapthData
      let timestamp = []
      let timeAmount = []
      grapthData.map(data => {
        let d = new Date(data[0])

        console.log(d.getUTCHours())

        let hour = d.getUTCHours()
        let min = d.getUTCMinutes()
        let sec = d.getUTCSeconds()
        let time = `${hour}:${min}:${sec}`

        timestamp.push(time)
        timeAmount.push(data[1])
      })

      plotChartData(timestamp,timeAmount, companyName)
    })
    .catch(err => {
      console.log(err)
    })

  const plotChartData = (time, data, companyName) => {

    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'bar',

      // The data for our dataset
      data: {
        labels: time,
        datasets: [{
          label: companyName,
          backgroundColor: 'rgb(0, 99, 132)',
          borderColor: 'rgb(0, 99, 132)',
          data: data
        }]
      },

      // Configuration options go here
      options: {}
    });
  }

}