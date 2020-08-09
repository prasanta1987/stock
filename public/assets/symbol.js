const companyName = document.querySelector('.stockname')
const updateTimeInfo = document.querySelector('.updateTimeInfo')
const cmpMarkup = document.querySelector('.cmp')
const changeMarkup = document.querySelector('.change')
const historicalchartdata = document.querySelector('.historicalchartdata')

const symbol = window.location.pathname.replace('/', '')

const fetchStockData = (symbol) => {
	// console.log(symbol)
	fetch(`/stock/${symbol}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			// console.log(data)
			let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice
			let openPrice = data.priceInfo.open

			companyName.innerHTML = data.info.companyName
			updateTimeInfo.innerHTML = data.metadata.lastUpdateTime
			document.querySelector('.industryinfo').innerHTML = data.metadata.industry
			cmpMarkup.innerHTML = closePrice
			if (openPrice < closePrice) {
				cmpMarkup.classList.remove('bg-danger')
				changeMarkup.classList.remove('bg-danger')

				cmpMarkup.classList.add('bg-success')
				changeMarkup.classList.add('bg-success')
			} else {
				cmpMarkup.classList.remove('bg-success')
				changeMarkup.classList.remove('bg-success')

				cmpMarkup.classList.add('bg-danger')
				changeMarkup.classList.add('bg-danger')
			}
			document.querySelector('.dhigh').innerHTML = data.priceInfo.intraDayHighLow.max
			document.querySelector('.dlow').innerHTML = data.priceInfo.intraDayHighLow.min
			document.querySelector('.open').innerHTML = openPrice
			changeMarkup.innerHTML = (data.priceInfo.change).toFixed(2)
			document.querySelector('.pchange').innerHTML = (data.priceInfo.pChange).toFixed(2)
			document.querySelector('.wlow').innerHTML = `
				<span class="d-block">${data.priceInfo.weekHighLow.min}</span>
				<small class="d-block">${data.priceInfo.weekHighLow.minDate}</small>`

			document.querySelector('.whigh').innerHTML = `
				<span class="d-block">${data.priceInfo.weekHighLow.max}</span>
				<small class="d-block">${data.priceInfo.weekHighLow.maxDate}</small>`

			getChartData(data.info.symbol, data.info.companyName, data.info.activeSeries[0])
			getFinData(data.info.symbol)
			getIntraChartData(data.info.identifier, data.priceInfo.weekHighLow.max, data.priceInfo.weekHighLow.min)
		})
		.catch(err => {
			console.log(err)
			setTimeout(fetchStockData(symbol), 10000)
		})
}


fetchStockData(symbol)

const getIntraChartData = (identifire, wHigh, wLow) => {
	fetch(`/chartData/${identifire}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			intraGrpah(data.grapthData, wHigh, wLow)
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


const fetchHistoricalData = async (symbol, series, startDate, endDate) => {

	try {
		let res = await fetch(`/getHistoricalData/${symbol}/${series}/${startDate}/${endDate}`, { method: 'POST' })
		let data = await res.json()

		return data

	} catch (err) {
		console.log(err)
		setTimeout(() => fetchHistoricalData(symbol, series, startDate, endDate), 5000)
	}
}

const getChartData = async (symbol, companyName, series) => {

	historicalchartdata.innerHTML = 'Loading Historical Data, It may Take some times.'
	const today = moment().format('DD-MM-yyyy')
	const fromDate = moment().subtract(100, 'days').format('DD-MM-yyyy')

	fetchHistoricalData(symbol, series, fromDate, today)
		.then(res => {
			let cumData = []
			res.data.map(values => cumData.push(values))
			getAllHistoricaldata(symbol, companyName, series, cumData)
		})
}

const getAllHistoricaldata = (symbol, companyName, series, cumData) => {

	const lastdate = cumData[cumData.length - 1].mTIMESTAMP
	const toDate = moment(new Date(lastdate).getTime()).add(1, 'days').format('DD-MM-yyyy')
	const fromDate = moment(new Date(lastdate).getTime()).subtract(100, 'days').format('DD-MM-yyyy')

	fetchHistoricalData(symbol, series, fromDate, toDate)
		.then(res => {
			if (res.data.length > 2) {
				res.data.map(values => cumData.push(values))
				getAllHistoricaldata(symbol, companyName, series, cumData)
			} else {
				let ohlc = [], vwapData = [], volume = []
				cumData.map(values => {
					let date = returnGmtTime(values.mTIMESTAMP)
					ohlc.push([date, values.CH_OPENING_PRICE, values.CH_TRADE_HIGH_PRICE, values.CH_TRADE_LOW_PRICE, values.CH_CLOSING_PRICE])
					vwapData.push([date, values.VWAP])
					volume.push([date, values.CH_TOT_TRADED_QTY])
				})
				ohlc.sort()
				vwapData.sort()
				volume.sort()

				plotGraphData(ohlc, vwapData, companyName, symbol, volume)
				historicalchartdata.innerHTML = ''
			}
		})

}

const returnGmtTime = (date) => {
	let newDate = new Date(date).getTime()
	return (newDate + (((3600 * 5) + (60 * 30)) * 1000))
}

// Historical Graph
const plotGraphData = (datas, vwapData, companyName, symbol, volume) => {

	groupingUnits =
		[
			['week', [1]],
			['month', [1, 2, 3, 4, 6]]
		]

	Highcharts.stockChart('container', {
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
				color: 'red',
				upColor: 'green'
			}
		},
		yAxis: [{
			labels: {
				align: 'right',
				x: -3
			},
			title: {
				text: 'OHLC'
			},
			height: '60%',
			lineWidth: 2,
			resize: {
				enabled: true
			}
		}, {
			labels: {
				align: 'right',
				x: -3
			},
			title: {
				text: 'Volume'
			},
			top: '65%',
			height: '35%',
			offset: 0,
			lineWidth: 2
		}],

		series: [
			{
				type: 'candlestick',
				name: symbol,
				data: datas,
				dataGrouping: {
					units: groupingUnits
				}
			},
			{
				type: 'spline',
				name: 'VWAP',
				data: vwapData,
				dataGrouping: {
					units: groupingUnits
				}
			},
			{
				name: "Volume",
				type: 'column',
				data: volume,
				color: "#1b0531",
				yAxis: 1,
				dataGrouping: {
					units: groupingUnits
				}
			}
		]
	});

}

// IntraDay Chart
const intraGrpah = (datas, wHigh, wLow) => {
	Highcharts.stockChart('container-intra', {
		chart: {
			events: {
				load:
					function () {
						let series = this.series[0];
						setInterval(async function () {

							let res = await fetch(`/stock/${symbol}`, { 'method': 'POST' })
							let data = await res.json()
							let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice
							let openPrice = data.priceInfo.open
							let date = parseInt(new Date(data.metadata.lastUpdateTime).getTime()) + ((3600 * 5) + (60 * 30)) * 1000
							series.addPoint([date, closePrice], true, true);

							cmpMarkup.innerHTML = closePrice
							changeMarkup.innerHTML = (data.priceInfo.change).toFixed(2)
							updateTimeInfo.innerHTML = data.metadata.lastUpdateTime

							if (openPrice < closePrice) {
								cmpMarkup.classList.remove('bg-danger')
								changeMarkup.classList.remove('bg-danger')

								cmpMarkup.classList.add('bg-success')
								changeMarkup.classList.add('bg-success')
							} else {
								cmpMarkup.classList.remove('bg-success')
								changeMarkup.classList.remove('bg-success')

								cmpMarkup.classList.add('bg-danger')
								changeMarkup.classList.add('bg-danger')
							}

						}, 5000);
					}
			}
		},

		time: {
			useGMT: true,
		},
		stockTools: {
			gui: {
				enabled: false // disable the built-in toolbar
			}
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
		yAxis: {
			title: {
				// text: 'Exchange rate'
			},
			plotLines: [{
				value: wHigh,
				color: 'green',
				dashStyle: 'shortdash',
				width: 2,
				label: {
					text: `52W High : ${wHigh}`
				}
			}, {
				value: wLow,
				color: 'red',
				dashStyle: 'shortdash',
				width: 2,
				label: {
					text: `52W Low : ${wLow}`
				}
			}]
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
		stockTools: {
			gui: {
				enabled: false // disable the built-in toolbar
			}
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
				type: 'column',
				data: totalInc.reverse(),
				color: "#008080"
			},
			{
				name: "Total Expence",
				type: 'column',
				data: totalExp.reverse(),
				color: "#b94747"
			},
			{
				name: "PAT",
				type: 'column',
				data: paTax.reverse(),
				color: "#008010"
			}
		]
	});

}