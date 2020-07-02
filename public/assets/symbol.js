const companyName = document.querySelector('.stockname')
const updateTimeInfo = document.querySelector('.updateTimeInfo')
const baseprice = document.querySelector('.baseprice')
const lastprice = document.querySelector('.lastprice')
const changeprice = document.querySelector('.changeprice')
const industryinfo = document.querySelector('.industryinfo')
const chartdatainfo = document.querySelector('.chartdatainfo')

// Create Chart
const stockChartElement = document.getElementById('myChart')
const stockChartCanvas = stockChartElement.getContext('2d');

stockChartElement.style.visibility = 'hidden'

let stockChart = new Chart(stockChartCanvas, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'data',
      backgroundColor: 'rgb(0, 99, 132)',
      borderColor: 'rgb(0, 99, 132)',
      data: []
    }]
  },
  options: {
    scales: {
      xAxes: [{
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20
        }
      }]
    }
  }
});


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

        let hour = d.getUTCHours()
        let min = d.getUTCMinutes()
        let sec = d.getUTCSeconds()
        let time = `${hour}:${min}:${sec}`

        timestamp.push(time)
        timeAmount.push(data[1])
      })

      plotChartData(timestamp, timeAmount, companyName)
    })
    .catch(err => {
      console.log(err)
    })
}

const plotChartData = (time, data, companyName) => {

  stockChart.data.labels = time
  stockChart.data.datasets[0].data = data
  stockChart.data.datasets[0].label = companyName

  stockChart.update();
  stockChartElement.style.visibility = 'visible'
}