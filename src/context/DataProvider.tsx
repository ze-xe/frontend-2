import * as React from 'react';
import { DUMMY_ADDRESS, HELPER, Endpoints, ADDRESSES, coingeckoIds, dummyPrices } from '../utils/const';
const { Big } = require('big.js');
import axios from 'axios';
import { call, getABI, getAddress, getContract } from '../utils/contract';
import { ChainID, chains, chainMapping } from '../utils/chains';
import Exchange from '../components/trade/exchange';
import { getBalancesAndApprovals } from '../utils/balances';
import { BigNumber } from 'ethers';
import socket from '../utils/socket';
import { io } from 'socket.io-client';

const DataContext = React.createContext<DataValue>({} as DataValue);

// http://localhost:3010/allpairs
// http://localhost:3010/orders/1a7f0acc09e078a414a7d74d2d00434427ef2c021a09d075996d2441f0d4ab9c


function DataProvider({ children }: any) {
	const [isDataReady, setIsDataReady] = React.useState(false);
	const [isFetchingData, setIsFetchingData] = React.useState(false);
	const [dataFetchError, setDataFetchError] = React.useState<string | null>(null);
	const [pairs, setPairs] = React.useState<any[]>([]);
	const [pairData, setPairData] = React.useState<any>({});
	const [pairExecutedData, setPairExecutedData] = React.useState<any>({});
	const [pairStats, setPairStats] = React.useState<any>({});

	const [orders, setOrders] = React.useState<any>({});
	const [placedOrders, setPlacedOrders] = React.useState<any>({});
	const [orderHistory, setOrderHistory] = React.useState<any>({});
	const [cancelledOrders, setCancelledOrders] = React.useState<any>({});

	const [tokens, setTokens] = React.useState<any[]>([]);
	const [chain, setChain] = React.useState(null);
	const [block, setBlock] = React.useState(null);
	const [refresh, setRefresh] = React.useState(false);
	const [refresh2, setRefresh2] = React.useState(false);
	const [refresh3, setRefresh3] = React.useState(false);

	React.useEffect(() => {}, [])	


	const explorer = () => {
		return chainMapping[chain]?.blockExplorers.default.url+'tx/';
	}

	const incrementAllowance = async (marketId: any, amount: string) => {
		console.log('incrementing', marketId, amount)
		let _markets = [...tokens];
		for(let i in _markets) {
			if(_markets[i].id === marketId) {
				_markets[i].allowance = Big(_markets[i].allowance).add(amount).toString()
			}
		}
		setTokens(_markets);
	}

	const getWalletBalances = async (address: string, _tokens = tokens, chain: number) => {
		getBalancesAndApprovals(_tokens.map(token => token.id), address, chain)
		.then((res) => {
			setBlock(res[0].toString());
			for(let i = 0; i < res[1].length; i+=2){
				_tokens[i/2].balance = BigNumber.from(res[1][i]).toString();
				_tokens[i/2].allowance = BigNumber.from(res[1][i+1]).toString();
			}
			setTokens(_tokens);
		})
	};

	const getPrice = (token: string) => {
		return new Promise((resolve, reject) => {
			axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds[token]}&vs_currencies=usd`)
			.then((res) => {
				resolve(res.data[coingeckoIds[token]].usd);
			})
			.catch((e) => {
				resolve(dummyPrices[token]);
			})
		})
	}

	const fetchData = async (address: string|null, chain: ChainID, loop = true, firstTime = true, _tokens=tokens, _pairs=pairs) => {
		setIsFetchingData(firstTime);
		setDataFetchError(null);
		try {
			// fetch data
			const requests = [axios.get(Endpoints[chain]+'pair/allpairs', {params: {chainId: chain}})]
			if(firstTime) requests.push(axios.get(Endpoints[chain]+'tokens', {params: {chainId: chain}}))
			Promise.all(requests).then(async (res) => {
				_pairs = res[0].data.data;
				setPairs(_pairs);
				fetchPairData(_pairs, chain);
				subscribePairHistory(_pairs);

				if(firstTime) {
					_tokens = res[1].data.data;
					for(let i in _tokens){
						let token = _tokens[i];
						token.price = await getPrice(token.symbol)
						let resp = await axios.get(Endpoints[chain]+`user/inorder/balance/${address}/token/${token.id}`, {
							params: {
								chainId: chain
							}
						});
						token.inOrderBalance = resp.data.data[0]?.inOrderBalance.toString() ?? '0';
					}
					setTokens(_tokens);
					console.log('pairs', _pairs);
					console.log('tokens', _tokens);
				}

				if(address) {
					console.log('Fetching data...');
					getWalletBalances(address, _tokens, chain);
					fetchPlacedOrders(address, _pairs, chain);
				}
				fetchOrders(_pairs, chain)
				fetchExecutedPairData(_pairs, chain);
				// if(loop) setTimeout(() => fetchData(address, chain, loop, false, _tokens, _pairs), 20000);
			})
		} catch (error) {
			setDataFetchError(error.message);
		}
		setIsFetchingData(false);
	};

	const subscribePairHistory = (__pairs: any[]) => {
		const _pairs = __pairs;
		let _refresh3 = refresh3;
		socket.on('PAIR_HISTORY', ({pair, amount, buy, exchangeRate}) => {
			for(let i in _pairs) {
				if(_pairs[i].id === pair) {
					_pairs[i].priceDiff = Big(exchangeRate).minus(_pairs[i].exchangeRate).toString();
					_pairs[i].exchangeRate = exchangeRate;
					console.log('found pair', _pairs[i]);
				}
			}
			console.log('pairs', _pairs);
			setPairs(_pairs);
			_refresh3 = !_refresh3;
			setRefresh3(_refresh3);
		})
	}

	const fetchOrders = (pairs: any[], chain: number) => {
		let orderRequests = pairs.map((pair) => (
			 axios.get(Endpoints[chain]+`pair/orders/${pair.id}`, {
				params: {
					chainId: chain
				}
			 })
		))
		Promise.all(orderRequests).then((res) => {
			let newOrders = {};
			res.forEach((order, index) => {
				return newOrders[order.data.data.pair.toLowerCase()] = order.data.data;
			})
			setOrders(newOrders);
			let _refresh = refresh;
			socket.on('PAIR_ORDER', ({amount, buy, exchangeRate, pair}) => {
				let _orders = buy ? newOrders[pair.toLowerCase()].buyOrders : newOrders[pair.toLowerCase()].sellOrders.reverse();
				console.log(_orders);
				
				for(let i = 0; i < _orders.length; i++){
					console.log(exchangeRate, _orders[i].exchangeRate);
					if(_orders[i].exchangeRate === exchangeRate){
						_orders[i].amount = Big(_orders[i].amount).plus(amount).toString();
						break;
					}
					else if(_orders[i].exchangeRate < exchangeRate){
						if(i === 0){
							_orders.splice(i, 0, {amount, exchangeRate});
						} else if(_orders[i-1].exchangeRate > exchangeRate){
							_orders.splice(i, 0, {amount, exchangeRate});
						}
						break;
					} else if(i === _orders.length - 1){
						_orders.push({amount, exchangeRate});
						break
					}
				}
				if(_orders.length === 0){
					_orders.push({amount, exchangeRate});
				}
				for(let i in _orders){
					if(Big(_orders[i].amount).lt(1e10)){
						_orders.splice(i, 1);
					}
				}
				if(buy){
					newOrders[pair.toLowerCase()].buyOrders = _orders;
				} else {
					newOrders[pair.toLowerCase()].sellOrders = _orders.reverse();
				}
				setOrders(newOrders);
				_refresh = !_refresh;
				setRefresh(_refresh);
				return;
			})
		})
	}

	const fetchPlacedOrders = (address: string, pairs: any[], chain: number) => {
		let orderRequests = [];
		for(let i in pairs){
			orderRequests.push(axios.get(Endpoints[chain]+`user/orders/placed/${address}/pair/${pairs[i].id}`, {
				params: {
					chainId: chain
				}
			}));
			orderRequests.push(axios.get(Endpoints[chain]+`user/orders/cancelled/${address}/pair/${pairs[i].id}`, {
				params: {
					chainId: chain
				}
			}));
			orderRequests.push(axios.get(Endpoints[chain]+`user/orders/history/${address}/pair/${pairs[i].id}`, {
				params: {
					chainId: chain
				}
			}));
		}
		Promise.all(orderRequests).then((res) => {
			let _placedOrders = {};
			let _cancelledOrders = {};
			let _executedOrders = {};
			for(let i = 0; i < pairs.length; i++){
				console.log('cancelled', res[i*3+1].data.data);
				_placedOrders[pairs[i].id] = res[i*3].data.data;
				_cancelledOrders[pairs[i].id] = res[i*3+1].data.data;
				_executedOrders[pairs[i].id] = res[i*3+2].data.data;
			}
			setCancelledOrders(_cancelledOrders);
			setOrderHistory(_executedOrders);
			setPlacedOrders(_placedOrders);
		})
	}

	const addPlacedOrder = (order: any) => {
		let _placedOrders = placedOrders;
		_placedOrders[order.pair.toLowerCase()].splice(0, 0, order); 
		setPlacedOrders(_placedOrders);
		setRefresh2(!refresh2);
	}
	
	// GRAPH
	const fetchPairData = (pairs: any[], chain: number) => {
		let pairRequests = []
		for(let i in pairs){
			pairRequests.push(axios.get(Endpoints[chain]+`pair/pricetrend/${pairs[i].id}`, {
				params: {
					chainId: chain,
					interval: 300000
				}
			}));
			pairRequests.push(axios.get(Endpoints[chain]+`pair/trading/status/${pairs[i].id}`, {
				params: {
					chainId: chain
				}
			}))
		}
		Promise.all(pairRequests).then((res) => {
			let newPairs = {};
			let _pairStatus = {};
			for(let i = 0; i < pairs.length; i++){
				newPairs[pairs[i].id] = res[i*2].data.data;
				_pairStatus[pairs[i].id] = res[i*2+1].data.data;
			}
			setPairData(newPairs);
			setPairStats(_pairStatus);
		})
	}
	
	// ORDER_HISTORY
	const fetchExecutedPairData = async (pairs: any[], chain: number) => {
		let pairRequests = pairs.map((pair) => {
			return axios.get(Endpoints[chain]+`pair/orders/history/${pair.id}`, {
				params: {
					chainId: chain
				}
			});
		})
		Promise.all(pairRequests).then((res) => {
			let newPairs = {};
			res.forEach((pair, index) => {
				return newPairs[pairs[index].id.toLowerCase()] = pair.data.data;
			})
			setPairExecutedData(newPairs);
		})
	}

	const value: DataValue = {
		isDataReady,
		pairs,
		pairData,
		tokens,
		dataFetchError,
		isFetchingData,
		fetchData,
		orders,
		placedOrders,
		pairExecutedData,
		cancelledOrders,
		orderHistory,
		pairStats,
		chain, setChain,
		explorer,
		incrementAllowance,
		addPlacedOrder
	};

	return (
		<DataContext.Provider value={value}>{children}</DataContext.Provider>
	);
}

interface DataValue {
	isDataReady: boolean;
	pairs: any[];
	pairData: any[];
	tokens: any[];
	dataFetchError: string | null;
	isFetchingData: boolean;
	orders: any;
	fetchData: (address :string, chainId: ChainID, loop?: boolean) => void;
	placedOrders: any,
	pairExecutedData: any,
	cancelledOrders: any,
	orderHistory: any,
	pairStats: any,
	chain: number, setChain: (chain: number) => void,
	explorer: () => string,
	incrementAllowance: (token: string, amount: string) => Promise<void>,
	addPlacedOrder: (order: any) => void
}

export { DataProvider, DataContext };
