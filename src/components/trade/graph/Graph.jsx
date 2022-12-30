import * as React from "react";
import { widget, version } from "../../../../public/static/charting_library";
import axios from "axios";
import { Endpoints } from "../../../utils/const";
import { ChainID } from "../../../utils/chains";
import socket from "../../../utils/socket";
import { id } from "ethers/lib/utils.js";

function getLanguageFromURL() {
	const regex = new RegExp("[\\?&]lang=([^&#]*)");
	const results = regex.exec(window.location.search);
	return results === null
		? null
		: decodeURIComponent(results[1].replace(/\+/g, " "));
}

const GREEN = "#18B05F";
const RED = "#C83232";

const BACKGROUND = "#130B25"

export class Graph extends React.PureComponent {
	static defaultProps = {
		symbol: "BTC_USDC",
		interval: "15",
		datafeedUrl: "https://demo_feed.tradingview.com",
		libraryPath: "/static/charting_library/",
		chartsStorageUrl: "https://saveload.tradingview.com",
		chartsStorageApiVersion: "1.1",
		clientId: "tradingview.com",
		userId: "public_user_id",
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	};

	tvWidget = null;

	constructor(props) {
		super(props);
		this.ref = React.createRef();
	}

	componentDidUpdate() {
		const widgetOptions = {
			symbol: this.props.symbol,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: DataFeed,
			interval: this.props.interval,
			container: this.ref.current,
			library_path: this.props.libraryPath,
			custom_css_url: '/css/style.css',
			locale: getLanguageFromURL() || "en",
			disabled_features: [
				"use_localstorage_for_settings", 
				"header_symbol_search", "header_compare", 
				"header_undo_redo", 
				"header_screenshot",
				"link_to_tradingview",
				"chart_property_page_trading",
				"chart_crosshair_menu",
				"hide_last_na_study_output"
			],
			enabled_features: [
				"minimalistic_logo",
				"narrow_chart_enabled",
				"study_templates",
				"show_logo_on_all_charts"
			],
			logo: {
				image: "/favicon.png",
				link: "https://www.zexe.io/"
			},
			theme: 'dark',
			toolbar_bg: 'transparent',
			loading_screen: {
				backgroundColor: "transparent",
			},
			client_id: 'zexe.io',
			overrides: {
				"paneProperties.background": BACKGROUND,
				"paneProperties.backgroundType": "solid",
				"mainSeriesProperties.candleStyle.wickUpColor": GREEN,
				"mainSeriesProperties.candleStyle.wickDownColor": RED,
				"mainSeriesProperties.candleStyle.upColor": GREEN,
				"mainSeriesProperties.candleStyle.downColor": RED,
				"mainSeriesProperties.candleStyle.borderUpColor": GREEN,
				"mainSeriesProperties.candleStyle.borderDownColor": RED,
				"paneProperties.vertGridProperties.color": "#363c4e",
				"paneProperties.horzGridProperties.color": "#363c4e",
				editorFontsList: ['Poppins']
		   },
			// enabled_features: ["study_templates"],
			// charts_storage_url: this.props.chartsStorageUrl,
			// charts_storage_api_version: this.props.chartsStorageApiVersion,
			// client_id: this.props.clientId,
			// user_id: this.props.userId,
			// fullscreen: this.props.fullscreen,
			// autosize: this.props.autosize,
			// studies_overrides: this.props.studiesOverrides,
			theme: 'dark',
			toolbar_bg: '#130B25',

			width: '100%',
			height: '600',
			header_widget_buttons_mode: 'compact'
		};

		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;
	}

	componentDidMount() {
		const widgetOptions = {
			symbol: this.props.symbol,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: DataFeed,
			interval: this.props.interval,
			container: this.ref.current,
			library_path: this.props.libraryPath,
			custom_css_url: '/css/style.css',
			locale: getLanguageFromURL() || "en",
			disabled_features: [
				"use_localstorage_for_settings", 
				"header_symbol_search", "header_compare", 
				"header_undo_redo", 
				"header_screenshot",
				"link_to_tradingview",
				"chart_property_page_trading",
				"chart_crosshair_menu",
				"hide_last_na_study_output"
			],
			enabled_features: [
				"minimalistic_logo",
				"narrow_chart_enabled",
				"study_templates",
				"show_logo_on_all_charts"
			],
			logo: {
				image: "/favicon.png",
				link: "https://www.zexe.io/"
			},
			theme: 'dark',
			toolbar_bg: 'transparent',
			loading_screen: {
				backgroundColor: "transparent",
			},
			client_id: 'zexe.io',
			overrides: {
				"paneProperties.background": BACKGROUND,
				"paneProperties.backgroundType": "solid",
				"mainSeriesProperties.candleStyle.wickUpColor": GREEN,
				"mainSeriesProperties.candleStyle.wickDownColor": RED,
				"mainSeriesProperties.candleStyle.upColor": GREEN,
				"mainSeriesProperties.candleStyle.downColor": RED,
				"mainSeriesProperties.candleStyle.borderUpColor": GREEN,
				"mainSeriesProperties.candleStyle.borderDownColor": RED,
				"paneProperties.vertGridProperties.color": "#363c4e",
				"paneProperties.horzGridProperties.color": "#363c4e",
		   },
			// enabled_features: ["study_templates"],
			// charts_storage_url: this.props.chartsStorageUrl,
			// charts_storage_api_version: this.props.chartsStorageApiVersion,
			// client_id: this.props.clientId,
			// user_id: this.props.userId,
			// fullscreen: this.props.fullscreen,
			// autosize: this.props.autosize,
			// studies_overrides: this.props.studiesOverrides,
			theme: 'dark',
			toolbar_bg: BACKGROUND,

			width: '100%',
			height: '600',
			header_widget_buttons_mode: 'compact'
		};
		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;

		// tvWidget.onChartReady(() => {
		// 	tvWidget.headerReady().then(() => {
		// 		const button = tvWidget.createButton();
		// 		button.setAttribute(
		// 			"title",
		// 			"Click to show a notification popup"
		// 		);
		// 		button.classList.add("apply-common-tooltip");
		// 		button.addEventListener("click", () =>
		// 			tvWidget.showNoticeDialog({
		// 				title: "Notification",
		// 				body: "zexe API works correctly",
		// 				callback: () => {
		// 					console.log("Noticed!");
		// 				},
		// 			})
		// 		);
		// 		button.innerHTML = "Check API";
		// 	});
		// });
	}

	componentWillUnmount() {
		if (this.tvWidget !== null) {
			this.tvWidget.remove();
			this.tvWidget = null;
		}
	}

	render() {
		return (
			<>
				<div ref={this.ref} />
			</>
		);
	}
}

// import { getExchangeServerTime, getSymbols, getKlines, subscribeKline, unsubscribeKline, checkInterval } from './helpers'

const configurationData = {
	// supports_marks: false,
	// supports_timescale_marks: false,
	// supports_time: true,
	supported_resolutions: ["5", "15", "30", "60", "240", "360", "720", "1D", "1W", "1M"],
};

let lastData = {};

const DataFeed = {
	onReady: (callback) => {
		setTimeout(() => callback(configurationData)); // callback must be called asynchronously.
	},

	resolveSymbol: (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback
	) => {
		axios
			.get(Endpoints[ChainID.ARB_GOERLI] + "chart/symbol", {
				params: {
					symbol: symbolName,
				},
			})
			.then((resp) => {
				const symbolItem = resp.data.data;
				const symbolInfo = {
					ticker: symbolItem.symbol,
					name: symbolItem.symbol,
					description: symbolItem.symbol,
					type: "crypto",
					session: "24x7",
					timezone: "UTC",
					exchange: "zexe",
					minmov: 1,
					pricescale: 100,
					has_intraday: true,
					has_no_volume: true,
					has_weekly_and_monthly: false,
					supported_resolutions:
						configurationData.supported_resolutions,
					volume_precision: 2,
					pairId: symbolItem.ticker,
					// data_status: 'streaming',
				};

				console.log("[resolveSymbol]: Symbol resolved", symbolInfo);
				onSymbolResolvedCallback(symbolInfo);
			});
		console.log("[resolveSymbol]: Method call", symbolName);
	},

	getBars: (
		symbolInfo,
		resolution,
		{ from, to, firstDataRequest },
		onHistoryCallback,
		onErrorCallback
	) => {
		// console.log("[getBars]: Method call", firstDataRequest);
		axios
			.get(
				Endpoints[ChainID.ARB_GOERLI] +
					"chart/bar/history/" +
					symbolInfo.pairId,
				{
					params: {
						from,
						to,
						interval: resolution,
						firstDataRequest
					},
				}
			)
			.then((resp) => {
				if(firstDataRequest) lastData = resp.data.data.exchangeRate[resp.data.data.exchangeRate.length - 1];
				if (resp.data.data.length == 0) {
					onHistoryCallback([], { noData: true });
					return;
				} else {
					const data = resp.data.data.exchangeRate;
					onHistoryCallback(data, { noData: false });
				}
			})
			.catch((err) => {
				console.log(err);
				onErrorCallback(err);
			});
	},

	// subscription to real-time updates
	subscribeBars: (
		symbolInfo,
		interval,
		onRealtimeCallback,
		subscribeUID,
		onResetCacheNeededCallback
	) => {
		console.log(
			"[subscribeBars]: Method call with subscribeUID:",
			subscribeUID
		);
		socket.on('PAIR_HISTORY', ({pair, amount, buy, exchangeRate}) => {
			if (pair.toLowerCase() == symbolInfo.pairId.toLowerCase()) {
				let time = Date.now();
				console.log(lastData.time, parseInt(interval)*60*1000, time, lastData.time + parseInt(interval)*60*1000 < time);
				if(lastData.time + parseInt(interval)*60*1000 < time) lastData.close = exchangeRate/1e18;
				else {
					lastData = {
						time,
						open: exchangeRate/1e18,
						close: exchangeRate/1e18,
						high: exchangeRate/1e18,
						low: exchangeRate/1e18,
					}
				}
				
				console.log('bar', lastData);
				onRealtimeCallback(lastData);
			}
		})
	},
	unsubscribeBars: (subscriberUID) => {
		console.log(
			"[unsubscribeBars]: Method call with subscriberUID:",
			subscriberUID
		);
		// unsubscribeKline(subscriberUID)
		clearInterval(window.interval);
	},
	// getServerTime: (callback) => {
	// getExchangeServerTime().then(time => {
	// 	callback(Math.floor(time / 1000))
	// }).catch(err => {
	// 	console.error(err)
	// })
	// }
};
