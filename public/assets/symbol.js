const addBookmark = document.querySelector('.bookmark')
const updateTimeInfo = document.querySelector('.updateTimeInfo')
const cmpMarkup = document.querySelector('.cmp')
const changeMarkup = document.querySelector('.change')
const pchangeMarkup = document.querySelector('.pchange')
const historicalchartdata = document.querySelector('.historicalchartdata')
const sectordata = document.querySelector('.sectordata')
const advdata = document.querySelector('.advdata')
const buyMarkup = document.querySelector('.buy')
const sellMarkup = document.querySelector('.sell')

const symbol = window.location.pathname.replace('/', '')


const getTickerInfo = (symbol) => {

	fetch(`/tickerInfo/${symbol}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			console.log(data)
			document.querySelector('.stockname').innerHTML = data.data.info.name
			document.querySelector('.industryinfo').innerHTML = data.data.info.sector
			document.querySelector('.whigh').innerHTML = data.data.ratios["52wHigh"]
			document.querySelector('.wlow').innerHTML = data.data.ratios["52wLow"]
			document.querySelector('.eps').innerHTML = data.data.ratios.eps.toFixed(2)
			document.querySelector('.pe').innerHTML = data.data.ratios.pe.toFixed(2)
			document.querySelector('.indpe').innerHTML = data.data.ratios.indpe.toFixed(2)
			document.querySelector('.mcap').innerHTML = data.data.ratios.marketCap.toFixed(2)
			document.querySelector('.pb').innerHTML = data.data.ratios.pb.toFixed(2)
			document.querySelector('.indpb').innerHTML = data.data.ratios.indpb.toFixed(2)
			document.querySelector('.beta').innerHTML = data.data.ratios.beta.toFixed(2)
			document.querySelector('.dy').innerHTML = (data.data.ratios.divYield == null) ? '0 %' : `${data.data.ratios.divYield.toFixed(2)} %`
			document.querySelector('.sdy').innerHTML = `${data.data.ratios.inddy.toFixed(2)} %`
			document.querySelector('.cap').innerHTML = data.data.ratios.marketCapLabel
			document.querySelector('.caprank').innerHTML = data.data.ratios.mrktCapRank

			fetchStockData(symbol)
		})
		.catch(err => console.log(err))
}

getTickerInfo(symbol)


const fetchStockData = (symbol) => {
	fetch(`/tickerData/${symbol}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			let values = data.data[0]

			let openPrice = values.o, highPrice = values.h, lowPrice = values.l, closePrice = values.price, preClosePrice = values.c, changePrice = values.change;
			let pChange = ((changePrice / preClosePrice) * 100).toFixed(2)

			cmpMarkup.innerHTML = closePrice
			changeMarkup.innerHTML = changePrice
			pchangeMarkup.innerHTML = `${pChange}%`
			document.querySelector('.preclose').innerHTML = preClosePrice
			document.querySelector('.dhigh').innerHTML = highPrice
			document.querySelector('.dlow').innerHTML = lowPrice
			document.querySelector('.open').innerHTML = openPrice


			if (preClosePrice < closePrice) {
				cmpMarkup.classList.remove('bg-danger')
				changeMarkup.classList.remove('bg-danger')
				pchangeMarkup.classList.remove('bg-danger')


				cmpMarkup.classList.add('bg-success')
				changeMarkup.classList.add('bg-success')
				pchangeMarkup.classList.add('bg-success')
			} else {
				cmpMarkup.classList.remove('bg-success')
				changeMarkup.classList.remove('bg-success')
				pchangeMarkup.classList.remove('bg-success')

				cmpMarkup.classList.add('bg-danger')
				changeMarkup.classList.add('bg-danger')
				pchangeMarkup.classList.add('bg-danger')
			}

			// let sector = data.metadata.pdSectorInd
			// let preClose = (data.priceInfo.previousClose).toFixed(2)
			// let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice
			// let changePrice = (closePrice - preClose).toFixed(2)
			// let pChange = ((changePrice / preClose) * 100).toFixed(2)
			// let openPrice = (data.priceInfo.open).toFixed(2)
			// let dHigh = (data.priceInfo.intraDayHighLow.max).toFixed(2)
			// let dLow = (data.priceInfo.intraDayHighLow.min).toFixed(2)
			// let ttlShare = (data.securityInfo.issuedCap / 10000000).toFixed(2)
			// let marketCap = (ttlShare * closePrice).toFixed(2)
			// let symbolPe = data.metadata.pdSymbolPe
			// let indPe = data.metadata.pdSectorPe
			// let eps = isFinite(closePrice / symbolPe) ? (closePrice / symbolPe).toFixed(2) : 0

			// companyName.innerHTML = data.info.companyName

			// document.title = `${symbol} ${closePrice} ${(preClose < closePrice) ? '▲' : '▼'} ${(data.priceInfo.pChange).toFixed(2)}%`
			// updateTimeInfo.innerHTML = data.metadata.lastUpdateTime
			// document.querySelector('.industryinfo').innerHTML = data.metadata.industry
			// cmpMarkup.innerHTML = closePrice
			// if (preClose < closePrice) {
			// 	cmpMarkup.classList.remove('bg-danger')
			// 	changeMarkup.classList.remove('bg-danger')
			// 	pchangeMarkup.classList.remove('bg-danger')

			// 	cmpMarkup.classList.add('bg-success')
			// 	changeMarkup.classList.add('bg-success')
			// 	pchangeMarkup.classList.add('bg-success')
			// } else {
			// 	cmpMarkup.classList.remove('bg-success')
			// 	changeMarkup.classList.remove('bg-success')
			// 	pchangeMarkup.classList.remove('bg-success')

			// 	cmpMarkup.classList.add('bg-danger')
			// 	changeMarkup.classList.add('bg-danger')
			// 	pchangeMarkup.classList.add('bg-danger')
			// }
			// document.querySelector('.preclose').innerHTML = preClose
			// document.querySelector('.dhigh').innerHTML = dHigh
			// document.querySelector('.dlow').innerHTML = dLow
			// document.querySelector('.open').innerHTML = openPrice
			// document.querySelector('.eps').innerHTML = eps
			// document.querySelector('.pe').innerHTML = symbolPe
			// document.querySelector('.indpe').innerHTML = indPe
			// document.querySelector('.mcap').innerHTML = marketCap
			// changeMarkup.innerHTML = `${changePrice}`
			// pchangeMarkup.innerHTML = `${pChange}%`
			// document.querySelector('.wlow').innerHTML = `
			// 	<span class="d-block">${data.priceInfo.weekHighLow.min}</span>
			// 	<small class="d-block">${data.priceInfo.weekHighLow.minDate}</small>`

			// document.querySelector('.whigh').innerHTML = `
			// 	<span class="d-block">${data.priceInfo.weekHighLow.max}</span>
			// 	<small class="d-block">${data.priceInfo.weekHighLow.maxDate}</small>`


			showAddBtn()
			// getSectorData(sector)
			// getMarketDepth(symbol)
			// getChartData(data.info.symbol, data.info.companyName, data.info.activeSeries[0])
			// getFinData(data.info.symbol)
			// getIntraChartData(data.info.identifier, data.priceInfo.weekHighLow.max, data.priceInfo.weekHighLow.min, openPrice, dHigh, dLow)
			// getStocknews(data.info.symbol)
		})
		.catch(err => {
			console.log(err)
			console.log('Retrying Last Action')
			setTimeout(() => fetchStockData(symbol), 10000)
		})
}

const showAddBtn = () => {
	addBookmark.innerHTML = ''
	if (!userData.watchList.includes(symbol)) {
		addBookmark.innerHTML += `<button class="btn btn-small btn-outline-success bookmarkbtn" onClick="addSymbolToprofile('${symbol}')">+</button>`
	} else {
		addBookmark.innerHTML += `<button class="btn btn-small btn-outline-warning bookmarkbtn" onClick="removeSymbolFromProfile('${symbol}')">-</button>`
	}
}

const getMarketDepth = (symbol) => {
	fetch(`/marketDepth/${symbol}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			buyMarkup.innerHTML = ''
			sellMarkup.innerHTML = ''
			// console.log(data)
			data.marketDeptOrderBook.ask.map(askPrice => {
				buyMarkup.innerHTML += `
					<span class="d-flex justify-content-between">
						<span>${askPrice.price}</span>
						<span>${askPrice.quantity}</span>
					</span>
				`
			})
			data.marketDeptOrderBook.bid.map(sellPrice => {
				sellMarkup.innerHTML += `
					<span class="d-flex justify-content-between">
						<span>${sellPrice.price}</span>
						<span>${sellPrice.quantity}</span>
					</span>
				`
			})
			document.querySelector('.totBid').innerHTML = data.marketDeptOrderBook.totalBuyQuantity
			document.querySelector('.totAsk').innerHTML = data.marketDeptOrderBook.totalSellQuantity
			document.querySelector('.deliverystat').innerHTML = `
				<span>Total Traded Qty. <b>${data.securityWiseDP.quantityTraded}</b></span>
				<span>Delivery Qty. <b>${data.securityWiseDP.deliveryQuantity}</b></span>
				<span>Delivery Percentage <b>${data.securityWiseDP.deliveryToTradedQuantity}%</b></span>
			`

			if (sessionStorage.marketStat != 'Closed') setTimeout(() => getMarketDepth(symbol), 1000)
		})
		.catch(err => {
			console.log(err)
			setTimeout(() => getMarketDepth(symbol), 5000)
		})
}

const getSectorData = (sector) => {

	fetch(`/index/${sector}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			if (Object.keys(data).length > 0) {
				let change = (data.metadata.change).toFixed(2)
				document.querySelector('.indexname').innerHTML = data.metadata.indexName
				document.querySelector('.indexltp').innerHTML = data.metadata.last

				sectordata.innerHTML = `
				<span class="d-block ${(change > 0) ? 'text-success' : 'text-danger'}">
					<span>${change}</span>
					<span>(${(data.metadata.percChange).toFixed(2)}%)</span>
				<span>
			`
				setTimeout(() => getSectorData(sector), 10000)
			}
		})
		.catch(err => {
			console.log(err)
			setTimeout(() => getSectorData(sector), 10000)
		})
}



const getStocknews = (symbol) => {

	const toDate = moment().format('DD-MM-yyyy')
	const startDate = moment().subtract(1, 'years').format('DD-MM-yyyy')

	fetch(`/corporateActions/${symbol}/${startDate}/${toDate}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			// console.log(data)
			data.map(value => {
				document.querySelector('.copractions').innerHTML += `
							<tr>
                                <td>${value.subject}</td>
                                <td>${value.exDate}</td>
                                <td>${value.recDate}</td>
                                <td>${value.bcStartDate}</td>
                                <td>${value.bcEndDate}</td>
                            </tr>
				`
			})
		})
		.catch(err => {
			console.log(err)
			console.log('Retrying Last Action')
			setTimeout(() => getStocknews(symbol), 2000)
		})
}

const getIntraChartData = (identifire, wHigh, wLow, openPrice, dHigh, dLow) => {
	fetch(`/chartData/${identifire}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			intraGrpah(data.grapthData, wHigh, wLow, openPrice, dHigh, dLow)
		})
		.catch(err => {
			console.log(err)
			console.log('Retrying Last Action')
			setTimeout(() => getIntraChartData(identifire, wHigh, wLow, openPrice, dHigh, dLow), 2000)
		})
}

const getFinData = (symbol) => {

	fetch(`/historicalFinancialResult/${symbol}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			let totalInc = []
			let totalExp = []
			let paTax = []

			if (data.resCmpData != null) {
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
			}

		})
		.catch(err => {
			console.log(err)
			console.log('Retrying Last Action')
			setTimeout(() => getFinData(symbol), 2000)
		})
}

const fetchHistoricalData = async (symbol, series, startDate, endDate) => {

	let url = `/getHistoricalData/${symbol}/${series}/${startDate}/${endDate}`
	try {
		let res = await fetch(url, { method: 'POST' })
		let data = await res.json()

		return data

	} catch (err) {
		console.log(err)
		setTimeout(() => fetchHistoricalData(symbol, series, startDate, endDate), 5000)
	}
}

const getChartData = (symbol, companyName, series) => {

	historicalchartdata.innerHTML = 'Loading Historical Data, It may Take some times.'
	const toDate = moment().format('DD-MM-yyyy')
	const fromDate = moment().subtract(100, 'days').format('DD-MM-yyyy')
	let ohlc = [], vwapData = [], volume = []
	fetchHistoricalData(symbol, series, fromDate, toDate)
		.then(res => {
			res.data.map(values => {
				let date = returnGmtTime(values.mTIMESTAMP)
				ohlc.push([date, values.CH_OPENING_PRICE, values.CH_TRADE_HIGH_PRICE, values.CH_TRADE_LOW_PRICE, values.CH_CLOSING_PRICE])
				vwapData.push([date, values.VWAP])
				volume.push([date, values.CH_TOT_TRADED_QTY])
				historicalchartdata.innerHTML = ''
			})

			ohlc = ohlc.reverse()
			vwapData = vwapData.reverse()
			volume = volume.reverse()

			plotGraphData(ohlc, vwapData, companyName, symbol, volume)
		})
}

const getFinalData = (symbol, companyName, series, cumData) => {

	let ohlc = [], vwapData = [], volume = []
	cumData.map(values => {
		// let date = values.mTIMESTAMP
		let date = returnGmtTime(values.mTIMESTAMP)
		ohlc.push([date, values.CH_OPENING_PRICE, values.CH_TRADE_HIGH_PRICE, values.CH_TRADE_LOW_PRICE, values.CH_CLOSING_PRICE])
		vwapData.push([date, values.VWAP])
		volume.push([date, values.CH_TOT_TRADED_QTY])
	})

	ohlc = ohlc.reverse()
	vwapData = vwapData.reverse()
	volume = volume.reverse()

	historicalchartdata.innerHTML = ''

	plotGraphData(ohlc, vwapData, companyName, symbol, volume)
}

const getAllHistoricaldata = (symbol, companyName, series, cumData) => {

	const lastdate = cumData[cumData.length - 1].mTIMESTAMP
	const toDate = moment(new Date(lastdate).getTime()).subtract(1, 'days').format('DD-MM-yyyy')
	const fromDate = moment(new Date(lastdate).getTime()).subtract(100, 'days').format('DD-MM-yyyy')

	historicalchartdata.innerHTML = `Data Fetched upto ${lastdate}`

	fetchHistoricalData(symbol, series, fromDate, toDate)
		.then(res => {
			if (res.data.length > 2) {
				res.data.map(values => cumData.push(values))
				// setTimeout(() => getAllHistoricaldata(symbol, companyName, series, cumData), 50)
				getAllHistoricaldata(symbol, companyName, series, cumData)
			} else {
				let ohlc = [], vwapData = [], volume = []
				cumData.map(values => {
					let date = returnGmtTime(values.mTIMESTAMP)
					// let date = values.mTIMESTAMP
					ohlc.push([date, values.CH_OPENING_PRICE, values.CH_TRADE_HIGH_PRICE, values.CH_TRADE_LOW_PRICE, values.CH_CLOSING_PRICE])
					vwapData.push([date, values.VWAP])
					volume.push([date, values.CH_TOT_TRADED_QTY])
				})
				ohlc = ohlc.reverse()
				vwapData = vwapData.reverse()
				volume = volume.reverse()

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
const plotGraphData = (ohlc, vwapData, companyName, symbol, volume) => {

	groupingUnits =
		[
			['week', [1]],
			['month', [1, 2, 3, 4, 6]]
		]

	Highcharts.stockChart('container', {

		time: {
			useGMT: true,
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
			selected: 2
		},
		plotOptions: {
			candlestick: {
				color: 'red',
				upColor: 'green',
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
				data: ohlc,
				dataGrouping: {
					units: groupingUnits
				}
			},
			{
				type: 'spline',
				name: 'VWAP',
				data: vwapData,
				lineWidth: 1,
				color: '#000',
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
const intraGrpah = (datas, wHigh, wLow, openPrice, dHigh, dLow) => {

	Highcharts.stockChart('container-intra', {
		chart: {
			events: {
				load:
					function () {
						let series = this.series[0];

						setInterval(async function () {
							if (sessionStorage.marketStat != 'Closed') {


								let res = await fetch(`/liveData/${symbol}`, { 'method': 'POST' })
								let data = await res.json()

								console.log(data.data)
								let closePrice = data.data[0].price


								// console.log(sessionStorage.marketStat)
								// let res = await fetch(`/stock/${symbol}`, { 'method': 'POST' })
								// let data = await res.json()
								// let preClose = (data.priceInfo.previousClose).toFixed(2)
								// let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice
								// let changePrice = (closePrice - preClose).toFixed(2)
								// let pChange = ((changePrice / preClose) * 100).toFixed(2)
								// let date = parseInt(new Date(data.metadata.lastUpdateTime).getTime()) + ((3600 * 5) + (60 * 30)) * 1000
								// series.addPoint([date, closePrice], true, true);

								cmpMarkup.innerHTML = closePrice
								// changeMarkup.innerHTML = changePrice
								// pchangeMarkup.innerHTML = `${pChange}%`
								// updateTimeInfo.innerHTML = data.metadata.lastUpdateTime

								// document.title = `${symbol} ${closePrice} ${(closePrice > openPrice) ? '▲' : '▼'} ${(data.priceInfo.pChange).toFixed(2)}%`

								// if (preClose < closePrice) {
								// 	cmpMarkup.classList.remove('bg-danger')
								// 	changeMarkup.classList.remove('bg-danger')
								// 	pchangeMarkup.classList.remove('bg-danger')

								// 	cmpMarkup.classList.add('bg-success')
								// 	changeMarkup.classList.add('bg-success')
								// 	pchangeMarkup.classList.add('bg-success')
								// } else {
								// 	cmpMarkup.classList.remove('bg-success')
								// 	changeMarkup.classList.remove('bg-success')
								// 	pchangeMarkup.classList.remove('bg-success')

								// 	cmpMarkup.classList.add('bg-danger')
								// 	changeMarkup.classList.add('bg-danger')
								// 	pchangeMarkup.classList.add('bg-danger')
								// }


							}
						}, 2000);
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
			plotLines: [
				{
					value: wHigh,
					color: 'green',
					dashStyle: 'shortdash',
					width: 2,
					label: {
						text: `52W High : ${wHigh}`
					}
				},
				{
					value: openPrice,
					color: 'black',
					dashStyle: 'shortdash',
					width: 1,
					label: {
						text: `O: ${openPrice}`,
						align: 'right',
						x: -10
					}
				},
				{
					value: dHigh,
					color: 'Green',
					dashStyle: 'shortdash',
					width: 1,
					label: {
						text: `H : ${dHigh}`,
						align: 'right',
						x: -100
					}
				},
				{
					value: dLow,
					color: 'red',
					dashStyle: 'shortdash',
					width: 1,
					label: {
						text: `L : ${dLow}`,
						align: 'right',
						x: -100
					}
				},
				{
					value: wLow,
					color: 'red',
					dashStyle: 'shortdash',
					width: 2,
					label: {
						text: `52W Low : ${wLow}`
					}
				}
			]
		},
		series: [
			{
				name: 'Open Price',
				data: datas,
				color: "#008080"
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
			selected: 2
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


// const getAllHistoricaldata = (symbol, companyName, series, cumData) => {

// 	const lastdate = cumData[cumData.length - 1].mTIMESTAMP
// 	const toDate = moment(new Date(lastdate).getTime()).subtract(1, 'days').format('DD-MM-yyyy')
// 	const fromDate = moment(new Date(lastdate).getTime()).subtract(100, 'days').format('DD-MM-yyyy')

// 	historicalchartdata.innerHTML = `Data Fetched upto ${lastdate}`

// 	fetchHistoricalData(symbol, series, fromDate, toDate)
// 		.then(res => {
// 			if (res.data.length > 2) {
// 				res.data.map(values => cumData.push(values))
// 				// setTimeout(() => getAllHistoricaldata(symbol, companyName, series, cumData), 50)
// 				getAllHistoricaldata(symbol, companyName, series, cumData)
// 			} else {
// 				let ohlc = [], vwapData = [], volume = []
// 				cumData.map(values => {
// 					let date = returnGmtTime(values.mTIMESTAMP)
// 					// let date = values.mTIMESTAMP
// 					ohlc.push([date, values.CH_OPENING_PRICE, values.CH_TRADE_HIGH_PRICE, values.CH_TRADE_LOW_PRICE, values.CH_CLOSING_PRICE])
// 					vwapData.push([date, values.VWAP])
// 					volume.push([date, values.CH_TOT_TRADED_QTY])
// 				})
// 				ohlc = ohlc.reverse()
// 				vwapData = vwapData.reverse()
// 				volume = volume.reverse()

// 				plotGraphData(ohlc, vwapData, companyName, symbol, volume)
// 				historicalchartdata.innerHTML = ''
// 			}
// 		})

// }