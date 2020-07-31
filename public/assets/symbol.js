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
    getChartData(data.info.identifier, data.info.companyName)
  })
  .catch(err => console.log(err))

let grapthData = []

const getChartData = (symbol = 'SBINEQN', companyName) => {
  fetch(`/candleData/${symbol}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      plotGraphData(data.grapthData, companyName)
    })
    .catch(err => {
      console.log(err)
    })
}

const plotGraphData = (graphDatas, companyName) => {
  console.log(graphDatas)
  Highcharts.stockChart('container', {
    chart: {
      events: {
        load:

          function () {
            var series = this.series[0];

            // setInterval(function () {
            //   var x = (new Date()).getTime(), // current time
            //     y = Math.round(Math.random() * 100);
            //   series.addPoint([x, y], true, true);
            // }, 2000);


          }


      }
    },

    time: {
      useUTC: true
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false
        },
        color: "#008080",
      }
    },
    rangeSelector: {
      buttons: [{
        count: 1,
        type: 'hour',
        text: '1H'
      }, {
        count: 5,
        type: 'hour',
        text: '5H'
      }, {
        type: 'all',
        text: 'All'
      }],
      inputEnabled: false,
      selected: 2
    },

    title: {
      text: companyName
    },

    exporting: {
      enabled: false
    },

    series: [{
      name: 'CMP',
      data: graphDatas,

    }]
  });
}