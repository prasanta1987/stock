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
		console.log(data.info.companyName)
		companyName.innerHTML = data.info.companyName
		let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice
		getChartData(data.info.symbol, data.info.companyName)
		getFinData(data.info.symbol)
		getIntraChartData(data.info.identifier, data.info.companyName)
	})
	.catch(err => console.log(err))

const getIntraChartData = (identifire, companyName) => {
	fetch(`/chartData/${identifire}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			intraGrpah(data.grapthData)
		})
		.catch(err => {
			console.log(err)
		})
}

const getFinData = (symbol) => {

	fetch(`/historicalFinancialResult/${symbol}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			// console.log(data)
			let totalInc = []
			let totalExp = []
			let paTax = []
			data.resCmpData.map(values => {
				// console.log(values)
				let totalIncome = values.re_total_inc || values.re_tot_inc
				let totalExpeceBeforeTax = values.re_tot_exp_exc_pro_cont || values.re_oth_tot_exp
				let taxExpence = values.re_tax
				let pat = values.re_con_pro_loss
				totalIncome = (isNaN(totalIncome) ? 0 : totalIncome)
				totalExpeceBeforeTax = (isNaN(totalExpeceBeforeTax) ? 0 : totalExpeceBeforeTax)
				pat = (isNaN(pat) ? 0 : pat)
				let date = new Date(values.re_to_dt).getTime()
				totalInc.push([date, parseFloat(totalIncome)])
				totalExp.push([date, parseFloat(totalExpeceBeforeTax)])
				paTax.push([date, parseFloat(pat)])
			})
			plotFinanData(totalInc, totalExp, paTax, symbol)

		})
		.catch(err => {
			console.log(err)
		})
}

const getChartData = (symbol, companyName) => {

	const today = moment().format('DD-MM-yyyy')
	const fromDate = moment().subtract(12, 'months').format('DD-MM-yyyy')

	fetch(`/getHistoricalData/${symbol}/${fromDate}/${today}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			let datas = []
			let vwapData = []
			data.data.map(values => {
				let date = new Date(values.mTIMESTAMP).getTime()
				datas.push([date, values.CH_OPENING_PRICE, values.CH_TRADE_HIGH_PRICE, values.CH_TRADE_LOW_PRICE, values.CH_CLOSING_PRICE])
				vwapData.push([date, values.VWAP])
			})
			datas.reverse()
			vwapData.reverse()
			plotGraphData(datas, vwapData, companyName, symbol)
		})
		.catch(err => {
			console.log(err)
		})
}


// Historical Graph
const plotGraphData = (datas, vwapData, companyName, symbol) => {

	Highcharts.stockChart('container', {
		chart: {
			events: {
				load: function () {

					// var series = this.series[0];
					// console.log(series)
					// setInterval(function () {
					//   var x = (new Date()).getTime(), // current time
					//     o = 872,
					//     h = 875,
					//     l = 800,
					//     c = 900;
					//   series.addPoint([x, o, h, l, c], true, true,true,true);
					// }, 2000);

				} //End of onLoad Function
			}
		},
		time: {
			useGMT: true
		},
		rangeSelector: {
			selected: 1
		},

		title: {
			text: companyName
		},
		rangeSelector: {
			buttons: [{
				count: 1,
				type: 'month',
				text: '1M'
			}, {
				count: 2,
				type: 'month',
				text: '2M'
			}, {
				type: 'all',
				text: 'All'
			}],
			inputEnabled: false,
			selected: 0
		},
		plotOptions: {
			candlestick: {
				color: 'green',
				upColor: 'red'
			}
		},
		series: [
			{
				type: 'candlestick',
				name: symbol,
				data: datas,
				dataGrouping: {
					// units: [
					//   [
					//     'week', // unit name
					//     [1] // allowed multiples
					//   ], [
					//     'month',
					//     [1, 2, 3, 4, 6]
					//   ]
					// ]
				}
			},
			{
				name: "VWAP",
				type: 'spline',
				data: vwapData,
				color: "#001080"
			}
		]
	});

}

// IntraDay Chart
const intraGrpah = (datas) => {
	console.log(datas.pop())
	Highcharts.stockChart('container-intra', {
		chart: {
			events: {
				load:
					function () {
						let series = this.series[0];
						setInterval(async function () {
							let res = await fetch(`/stock${symbol}`, { 'method': 'POST' })
							let data = await res.json()
							let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice

							let date = parseInt(new Date(data.metadata.lastUpdateTime).getTime()) + ((3600 * 5) + (60 * 30)) * 1000
							series.addPoint([date, closePrice], true, true);
							// console.log([date, closePrice])
							// console.log(data.metadata.lastUpdateTime, new Date(data.metadata.lastUpdateTime).getTime())
							// console.log(new Date(date).toUTCString(), date)
							// var x = (new Date()).getTime(), // current time
							// y = Math.round(Math.random() * 100);
						}, 5000);
					}
			}
		},

		time: {
			useGMT: true,
		},
		plotOptions: {
			series: {
				marker: {
					enabled: false
				}
			}
		},
		rangeSelector: {
			buttons: [{
				count: 1,
				type: 'hour',
				text: '1H'
			}, {
				count: 2,
				type: 'hour',
				text: '2H'
			},
			{
				count: 4,
				type: 'hour',
				text: '4h'
			}, {
				type: 'all',
				text: 'All'
			}],
			inputEnabled: false,
			selected: 3
		},

		title: {
			text: 'Intra Day Chart'
		},

		exporting: {
			enabled: true
		},

		series: [
			{
				name: 'Open Price',
				data: datas,
				color: "#001080"
			}
		]
	});

}

// Quaterly Statement graph
const plotFinanData = (totalInc, totalExp, paTax, symbol) => {

	Highcharts.stockChart('container-finance', {

		time: {
			useUTC: true
		},
		rangeSelector: {
			selected: 1
		},

		title: {
			text: 'Proft & Loss Statement'
		},
		navigator: {
			enabled: false
		},
		rangeSelector: {
			buttons: [{
				count: 1,
				type: 'month',
				text: '1M'
			}, {
				count: 2,
				type: 'month',
				text: '2M'
			}, {
				type: 'all',
				text: 'All'
			}],
			inputEnabled: false,
			selected: 0
		},
		plotOptions: {},
		series: [
			{
				name: "Total Income",
				type: 'spline',
				data: totalInc.reverse(),
				color: "#008080"
			},
			{
				name: "Total Expence",
				type: 'spline',
				data: totalExp.reverse(),
				color: "#001080"
			},
			{
				name: "PAT",
				type: 'spline',
				data: paTax.reverse(),
				color: "#008010"
			}
		]
	});

}