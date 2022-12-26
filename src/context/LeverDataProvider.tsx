import * as React from "react";
import { DUMMY_ADDRESS, HELPER, Endpoints, ADDRESSES } from "../utils/const";
const { Big } = require("big.js");
import axios from "axios";
import { call, getABI, getAddress, getContract } from "../utils/contract";
import { ChainID, chains, chainMapping } from "../utils/chains";
import { getBalancesAndApprovals } from "../utils/balances";
import { BigNumber, ethers } from "ethers";
import { Interface } from "ethers/lib/utils.js";

const LeverDataContext = React.createContext<DataValue>({} as DataValue);

// http://localhost:3010/allpairs
// http://localhost:3010/orders/1a7f0acc09e078a414a7d74d2d00434427ef2c021a09d075996d2441f0d4ab9c

// list of tokens
const coingeckoIds = {
	BTC: "bitcoin",
	ETH: "ethereum",
	USDT: "tether",
	USDD: "usdd",
	WTRX: "tron",
	BTT: "bittorrent",
	NEAR: "near",
	AURORA: "aurora-near",
	USDC: "usd-coin",
	ZEXE: "zexe"
};

const dummyPrices = {
	BTC: "18000",
	ETH: "1200",
	USDT: "1",
	USDD: "1",
	WTRX: "0.006",
	BTT: "0.0000008",
	NEAR: "3.2",
	AURORA: "0.8",
	USDC: "1",
	ZEXE: "0.01"
};

import erc20 from "../abis/ERC20.json";
import ctoken from "../abis/CToken.json";
import multicall from "../abis/Multicall2.json";

function LeverDataProvider({ children }: any) {
	const [isDataReady, setIsDataReady] = React.useState(false);
	const [isFetchingData, setIsFetchingData] = React.useState(false);
	const [dataFetchError, setDataFetchError] = React.useState<string | null>(null);
	const [markets, setMarkets] = React.useState<any[]>([]);
	const [totalCollateralBalance, setTotalCollateralBalance] = React.useState('0')
	const [totalBorrowBalance, setTotalBorrowBalance] = React.useState('0')
	const [availableToBorrow, setAvailableToBorrow] = React.useState('0')
	const [adjustedDebt, setAdjustedDebt] = React.useState('0');
	const [protocolData, setProtocolData] = React.useState<any>({});

	const getWalletBalances = async (
		address: string,
		_markets = markets,
		chain: ChainID
	) => {
		const provider = new ethers.providers.Web3Provider(
			window.ethereum,
			"any"
		);

		const itf = new Interface(erc20.abi);
		const ctokenitf = new Interface(ctoken.abi);

		const multicallContract = new ethers.Contract(
			ADDRESSES[chain].Multicall,
			multicall.abi,
			provider.getSigner()
		);

		let calls = [];
		for (let i = 0; i < _markets.length; i++) {
			calls.push([
				_markets[i].inputToken.id,
				itf.encodeFunctionData("balanceOf", [address]),
			]);
			calls.push([
				_markets[i].inputToken.id,
				itf.encodeFunctionData("allowance", [address, _markets[i].id]),
			]);
			calls.push([
				_markets[i].id,
				itf.encodeFunctionData("balanceOf", [address]),
			]);
			calls.push([
				_markets[i].id,
				ctokenitf.encodeFunctionData("borrowBalanceCurrent", [address]),
			]);
		}

		multicallContract.callStatic.aggregate(calls)
		.then((res) => {
			console.log('res', res);
			let _totalCollateralBalance = Big(0);
			let _totalBorrowBalance = Big(0);
			let _availableToBorrow = Big(0);
			let _adjustedDebt = Big(0);

			for (let i = 0; i < res[1].length; i += 4) {
				_markets[i / 4].balance = BigNumber.from(res[1][i]).toString();
				_markets[i / 4].allowance = BigNumber.from(res[1][i + 1]).toString();
				_markets[i / 4].collateralBalance = Big(BigNumber.from(res[1][i + 2]).toString()).mul(_markets[i / 4]?.exchangeRate * 10 ** 10).toString();
				_markets[i / 4].borrowBalance = BigNumber.from(res[1][i + 3]).toString();
				_markets[i / 4].rewardsAPR = [0, 0];
				if(_markets[i / 4].rewardTokenEmissionsUSD){
					_markets[i / 4].rewardsAPR = [((100 * (_markets[i / 4].rewardTokenEmissionsUSD[0] * 365)) / _markets[i / 4].totalDepositBalanceUSD), ((100 * (_markets[i / 4].rewardTokenEmissionsUSD[1] * 365)) / _markets[i / 4].totalDepositBalanceUSD)];
				}

				_totalCollateralBalance = _totalCollateralBalance.add(
					Big(_markets[i / 4].collateralBalance).mul(_markets[i / 4].inputTokenPriceUSD).div(1e18)
				);
				_totalBorrowBalance = _totalBorrowBalance.add(
					Big(_markets[i / 4].borrowBalance).mul(_markets[i / 4].inputTokenPriceUSD).div(1e18)
				);
				_availableToBorrow = _availableToBorrow.add(
					Big(_markets[i / 4].collateralBalance).mul(_markets[i / 4].inputTokenPriceUSD).mul(_markets[i / 4].maximumLTV).div(100).div(1e18)
				);
				_adjustedDebt = _adjustedDebt.add(
					Big(_markets[i / 4].borrowBalance).mul(_markets[i / 4].inputTokenPriceUSD).div(1e18).div(_markets[i / 4].maximumLTV).mul(100)
				);
			}
			setTotalCollateralBalance(_totalCollateralBalance.toString());
			setTotalBorrowBalance(_totalBorrowBalance.toString());
			setAvailableToBorrow(_availableToBorrow.sub(_totalBorrowBalance).toString());
			setAdjustedDebt(_adjustedDebt.toString());
			setMarkets(_markets);
		});
	};

	const updateBorrowBalance = (token: string, amount: string) => {
		let _markets = [...markets];
		for(let i in _markets) {
			if(_markets[i].id === token) {
				_markets[i].borrowBalance = Big(_markets[i].borrowBalance).add(amount).toString()
			}
		}
		setMarkets(_markets);
	}

	const updateCollateralBalance = (token: string, amount: string) => {
		let _markets = [...markets];
		for(let i in _markets) {
			if(_markets[i].id === token) {
				_markets[i].collateralBalance = Big(_markets[i].collateralBalance).add(amount).toString()
			}
		}
		setMarkets(_markets);
	}

	const updateWalletBalance = async (token: string, amount: string) => {
		let _markets = [...markets];
		for(let i in _markets) {
			if(_markets[i].id === token) {
				_markets[i].balance = Big(_markets[i].balance).add(amount).toString()
			}
		}
		setMarkets(_markets);
	}

	const incrementAllowance = async (marketId: any, amount: string) => {
		console.log('incrementing', marketId, amount)
		let _markets = [...markets];
		for(let i in _markets) {
			if(_markets[i].id === marketId) {
				_markets[i].allowance = Big(_markets[i].allowance).add(amount).toString()
			}
		}
		setMarkets(_markets);
	}

	const fetchData = async (address: string|null, chain: ChainID) => {
		setIsFetchingData(true);
		setDataFetchError(null);
		try {
			// fetch data
			const requests = [
				axios.post(
					"https://api.thegraph.com/subgraphs/name/ze-xe/lever",
					{
						query: `{
									lendingProtocols{
										totalDepositBalanceUSD
										totalBorrowBalanceUSD
									}
									markets{
										id
										inputToken{
											id
											name
											symbol
											decimals
											lastPriceUSD
										}
										rates {
											rate
										}
										exchangeRate
										inputTokenPriceUSD
										totalDepositBalanceUSD
										totalBorrowBalanceUSD
										maximumLTV
										rewardTokenEmissionsUSD
									}
								}`,
					}
				),
			];
			Promise.all(requests).then(async (res) => {
				if (res[0].data.errors) {
					setDataFetchError(res[0].data.errors[0].message);
					return;
				}
				setMarkets(res[0].data.data.markets);
				setProtocolData(res[0].data.data.lendingProtocols[0]);
				if(address) getWalletBalances(address, res[0].data.data.markets, chain);
			});
		} catch (error) {
			setDataFetchError(error.message);
		}
		setIsFetchingData(false);
	};

	const value: DataValue = {
		isDataReady,
		markets,
		dataFetchError,
		isFetchingData,
		fetchData,
		totalCollateralBalance,
		totalBorrowBalance,
		availableToBorrow,
		incrementAllowance,
		adjustedDebt,
		updateBorrowBalance,
		updateCollateralBalance,
		updateWalletBalance,
		protocolData
	};

	return (
		<LeverDataContext.Provider value={value}>
			{children}
		</LeverDataContext.Provider>
	);
}

interface DataValue {
	isDataReady: boolean;
	markets: any[];
	dataFetchError: string | null;
	isFetchingData: boolean;
	fetchData: (address: string, chainId: ChainID, loop?: boolean) => void;
	totalCollateralBalance: string;
	totalBorrowBalance: string;
	availableToBorrow: string;
	incrementAllowance: (market: any, amount: string) => void;
	adjustedDebt: string;
	updateBorrowBalance: (token: string, amount: string) => void;
	updateCollateralBalance: (token: string, amount: string) => void;
	updateWalletBalance: (token: string, amount: string) => void;
	protocolData: any;
}

export { LeverDataProvider, LeverDataContext };
