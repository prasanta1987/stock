const companyName = document.querySelector('.stockname')
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

const getTickerTapeInfo = (sid) => {

	fetch(`/tickerInfo/${sid}`, fetchOption)
		.then(res => res.json())
		.then(data => {
			console.log(data)
			document.querySelector('.stockname').innerHTML = data.data.info.name
			document.querySelector('.industryinfo').innerHTML = data.data.info.sector
			document.querySelector('.eps').innerHTML = data.data.ratios.eps.toFixed(2)
			document.querySelector('.pe').innerHTML = data.data.ratios.pe.toFixed(2)
			document.querySelector('.whigh').innerHTML = data.data.ratios["52wHigh"]
			document.querySelector('.wlow').innerHTML = data.data.ratios["52wLow"]
			document.querySelector('.indpe').innerHTML = data.data.ratios.indpe.toFixed(2)
			document.querySelector('.mcap').innerHTML = data.data.ratios.marketCap.toFixed(2)
			document.querySelector('.pb').innerHTML = data.data.ratios.pb.toFixed(2)
			document.querySelector('.indpb').innerHTML = data.data.ratios.indpb.toFixed(2)
			document.querySelector('.capinfo').innerHTML = data.data.ratios.marketCapLabel
			document.querySelector('.mcaprank').innerHTML = data.data.ratios.mrktCapRank
			document.querySelector('.divyld').innerHTML = (data.data.ratios.divYield == null) ? 0 : `${data.data.ratios.divYield.toFixed(2)} %`
			document.querySelector('.secdivyld').innerHTML = (data.data.ratios.inddy == null) ? 0 : `${data.data.ratios.inddy.toFixed(2)} %`
			document.querySelector('.m1ret').innerHTML = `${data.data.ratios["4wpct"].toFixed(2)} %`
			document.querySelector('.y1ret').innerHTML = `${data.data.ratios["52wpct"].toFixed(2)} %`

			fetchStockData(data.data.sid, data.data.info.ticker)
		})
		.catch(err => {
			console.log(err)
		})
}

const fetchStockData = (sid, symbol) => {
	fetch(`/batchTickerInfo/${sid}`, { method: 'POST' })
		.then(res => res.json())
		.then(data => {
			let values = data.data[0]

			let openPrice = values.o,
				highPrice = values.h,
				lowPrice = values.l,
				closePrice = values.price,
				preClosePrice = values.c,
				changePrice = values.change,
				pChange = ((changePrice / preClosePrice) * 100).toFixed(2)

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
			document.title = `${symbol} ${closePrice} ${(closePrice > openPrice) ? '▲' : '▼'} ${pChange}%`
			showAddBtn()
			getShareHolding(sid)
			getScreenerData(symbol)
		})
		.catch(err => {
			console.log(err)
			console.log('Retrying Last Action')
			setTimeout(() => fetchStockData(symbol), 10000)
		})
}

const getScreenerData = (symbol) => {

	fetch(`/screenerData/${symbol}`, fetchOption)
		.then(res => res.json())
		.then(data => {
			console.log(data)
			document.querySelector('.cashflow').innerHTML = data.cashFlow
			document.querySelector('.quater').innerHTML = data.quaterResult
			document.querySelector('.balanceSheet').innerHTML = data.balanceSheet
			document.querySelector('.plStatement').innerHTML = data.plStatement
		})
		.catch(err => console.log(err))
}

const getShareHolding = (sid) => {
	fetch(`/tickertapeShareHolding/${sid}`, fetchOption)
		.then(res => res.json())
		.then(data => {
			let dateSets = []

			let diiHolding = [], promoholding = [], MfHolding = [], fiiHolding = [], otherHolding = []

			data.data.map(datas => {
				dateSets.push(moment(new Date(datas.date).getTime()).format('MMM-YYYY'))
				// console.log(datas.data)
				let otherPartyHolding = 100 - (datas.data.diPctT + datas.data.pmPctT + datas.data.mfPctT + datas.data.fiPctT)
				diiHolding.push(datas.data.diPctT)
				promoholding.push(datas.data.pmPctT)
				MfHolding.push(datas.data.mfPctT)
				fiiHolding.push(datas.data.fiPctT)
				otherHolding.push(otherPartyHolding)
			})

			let dataSets = []

			let diiDataSets = {
				name: 'Domestic Institutional Holdings',
				data: diiHolding
			}

			let promoDataSets = {
				name: 'Total Promoter Holding',
				data: promoholding
			}

			let mfDataSets = {
				name: 'Mutual Fund Holdings',
				data: MfHolding
			}
			let fiiDataSets = {
				name: 'Foreign Institutional Holdings',
				data: fiiHolding
			}
			let otherDataSets = {
				name: 'Other Parties',
				data: otherHolding
			}

			dataSets.push(otherDataSets)
			dataSets.push(fiiDataSets)
			dataSets.push(diiDataSets)
			dataSets.push(mfDataSets)
			dataSets.push(promoDataSets)

			shareHoldingChart(dateSets, dataSets)
		})
		.catch(err => {
			console.log(err)
		})
}

const shareHoldingChart = (dateSets, dataSets) => {
	Highcharts.chart('container-shareholding', {
		chart: {
			type: 'bar'
		},
		title: {
			text: 'Share Holding pattern'
		},
		xAxis: {
			categories: dateSets
		},
		yAxis: {
			min: 0,
			max: 100,
			title: {
				text: ''
			}
		},
		legend: {
			reversed: true
		},
		plotOptions: {
			series: {
				stacking: 'normal'
			}
		},
		series: dataSets
	});
}

const showAddBtn = () => {
	addBookmark.innerHTML = ''
	if (!userData.watchList.includes(symbol)) {
		addBookmark.innerHTML += `<button class="btn btn-small btn-outline-success bookmarkbtn" onClick="addSymbolToprofile('${symbol}')">+</button>`
	} else {
		addBookmark.innerHTML += `<button class="btn btn-small btn-outline-warning bookmarkbtn" onClick="removeSymbolFromProfile('${symbol}')">-</button>`
	}
}

getTickerTapeInfo(symbol)

const getStocknews = (symbol) => {

	const toDate = moment().format('DD-MM-yyyy')
	const startDate = moment().subtract(1, 'years').format('DD-MM-yyyy')

	fetch(`/corporateActions/${symbol}`, { method: 'POST' })
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
			setTimeout(() => getStocknews(symbol), 10000)
		})
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
								let res = await fetch(`/growwLiveData/${symbol}`, { 'method': 'POST' })
								let data = await res.json()

								let closePrice = data.ltp,
									preClose = data.close,
									pChange = parseFloat(data.dayChangePerc.toFixed(2)),
									changePrice = parseFloat(data.dayChange.toFixed(2)),
									low = parseFloat(data.low.toFixed(2)),
									high = parseFloat(data.high.toFixed(2)),
									time = returnGmtTime(parseInt(`${data.tsInMillis}000`))

								series.addPoint([time, closePrice]);

								if (preClose < closePrice) {
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

								cmpMarkup.innerHTML = closePrice
								changeMarkup.innerHTML = changePrice
								pchangeMarkup.innerHTML = `${pChange}%`
								updateTimeInfo.innerHTML = moment(new Date(time).getTime()).format('DD-MMM-YYYY HH:mm:ss')

								document.title = `${symbol} ${closePrice} ${(closePrice > openPrice) ? '▲' : '▼'} ${pChange}%`
							}



							// if (sessionStorage.marketStat != 'Closed') {
							// 	console.log(sessionStorage.marketStat)
							// 	let res = await fetch(`/stock/${symbol}`, { 'method': 'POST' })
							// 	let data = await res.json()
							// 	let preClose = (data.priceInfo.previousClose).toFixed(2)
							// 	let closePrice = (data.priceInfo.close > 0) ? data.priceInfo.close : data.priceInfo.lastPrice
							// 	let changePrice = (closePrice - preClose).toFixed(2)
							// 	let pChange = ((changePrice / preClose) * 100).toFixed(2)
							// 	let date = parseInt(new Date(data.metadata.lastUpdateTime).getTime()) + ((3600 * 5) + (60 * 30)) * 1000
							// 	series.addPoint([date, closePrice], true, true);

							// 	cmpMarkup.innerHTML = closePrice
							// 	changeMarkup.innerHTML = changePrice
							// 	pchangeMarkup.innerHTML = `${pChange}%`
							// 	updateTimeInfo.innerHTML = data.metadata.lastUpdateTime

							// 	document.title = `${symbol} ${closePrice} ${(closePrice > openPrice) ? '▲' : '▼'} ${(data.priceInfo.pChange).toFixed(2)}%`

							// 	if (preClose < closePrice) {
							// 		cmpMarkup.classList.remove('bg-danger')
							// 		changeMarkup.classList.remove('bg-danger')
							// 		pchangeMarkup.classList.remove('bg-danger')

							// 		cmpMarkup.classList.add('bg-success')
							// 		changeMarkup.classList.add('bg-success')
							// 		pchangeMarkup.classList.add('bg-success')
							// 	} else {
							// 		cmpMarkup.classList.remove('bg-success')
							// 		changeMarkup.classList.remove('bg-success')
							// 		pchangeMarkup.classList.remove('bg-success')

							// 		cmpMarkup.classList.add('bg-danger')
							// 		changeMarkup.classList.add('bg-danger')
							// 		pchangeMarkup.classList.add('bg-danger')
							// 	}
							// }


						}, 1000);
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

const returnGmtTime = (date) => {
	let newDate = new Date(date).getTime()
	return (newDate + (((3600 * 5) + (60 * 30)) * 1000))
}