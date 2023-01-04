import * as React from "react";
import { Endpoints } from "../utils/const";
const { Big } = require("big.js");
import axios from "axios";
import { call, getABI, getAddress, getContract } from "../utils/contract";
import { ChainID, chains, chainMapping } from "../utils/chains";
import { getBalancesAndApprovals } from "../utils/balances";
import { BigNumber, ethers } from "ethers";
import { Interface } from "ethers/lib/utils.js";

const LeverDataContext = React.createContext<DataValue>({} as DataValue);

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

		const itf = new Interface(getABI('BTC'));
		const ctokenitf = new Interface(getABI('lBTC_Market'));
		const leverContract = await getContract('Lever', chain);

		const multicallContract = await getContract('Multicall2', chain);

		let calls = [];
		for (let i = 0; i < _markets.length; i++) {
			calls.push([
				_markets[i].inputToken.id,
				itf.encodeFunctionData("balanceOf", [address]),
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

		Promise.all([multicallContract.callStatic.aggregate(calls), call(leverContract, 'getAssetsIn', [address], chain)])
		.then(([res, assetsIn]) => {
			let _totalCollateralBalance = Big(0);
			let _totalBorrowBalance = Big(0);
			let _availableToBorrow = Big(0);
			let _adjustedDebt = Big(0);

			for (let i = 0; i < res[1].length - 1; i += 3) {
				const marketIndex = i / 3;
				_markets[marketIndex].balance = BigNumber.from(res[1][i]).toString();
				_markets[marketIndex].collateralBalance = Big(BigNumber.from(res[1][i + 1]).toString()).mul(_markets[marketIndex]?.exchangeRate * 10 ** 10).toString();
				_markets[marketIndex].borrowBalance = BigNumber.from(res[1][i + 2]).toString();
				_markets[marketIndex].rewardsAPR = [0, 0];
				if(_markets[marketIndex].rewardTokenEmissionsUSD){
					_markets[marketIndex].rewardsAPR = [((100 * (_markets[marketIndex].rewardTokenEmissionsUSD[0] * 365)) / _markets[marketIndex].totalDepositBalanceUSD), ((100 * (_markets[marketIndex].rewardTokenEmissionsUSD[1] * 365)) / _markets[marketIndex].totalDepositBalanceUSD)];
				}
				_totalCollateralBalance = _totalCollateralBalance.add(
					Big(_markets[marketIndex].collateralBalance).mul(_markets[marketIndex].inputTokenPriceUSD).div(1e18)
				);
				_totalBorrowBalance = _totalBorrowBalance.add(
					Big(_markets[marketIndex].borrowBalance).mul(_markets[marketIndex].inputTokenPriceUSD).div(1e18)
				);
				_availableToBorrow = _availableToBorrow.add(
					Big(_markets[marketIndex].collateralBalance).mul(_markets[marketIndex].inputTokenPriceUSD).mul(_markets[marketIndex].maximumLTV).div(100).div(1e18)
				);
				_adjustedDebt = _adjustedDebt.add(
					Big(_markets[marketIndex].borrowBalance).mul(_markets[marketIndex].inputTokenPriceUSD).div(1e18).div(_markets[marketIndex].maximumLTV).mul(100)
				);
			}
			// set all assets to lowercase
			assetsIn = assetsIn.map((asset: string) => asset.toLowerCase());
			for(let i in _markets){
				if(assetsIn.includes(_markets[i].id)){
					_markets[i].isCollateral = true;
				} else {
					_markets[i].isCollateral = false;
				}
			}

			setTotalCollateralBalance(_totalCollateralBalance.toString());
			setTotalBorrowBalance(_totalBorrowBalance.toString());
			setAvailableToBorrow(_availableToBorrow.sub(_totalBorrowBalance).toString());
			setAdjustedDebt(_adjustedDebt.toString());
			setMarkets(_markets);
		});
	};

	const enableCollateral = (market: string) => {
		let _markets = [...markets];
		for(let i in _markets) {
			if(_markets[i].id === market) {
				_markets[i].isCollateral = !_markets[i].isCollateral;
			}
		}
		setMarkets(_markets);
	}

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
		adjustedDebt,
		updateBorrowBalance,
		updateCollateralBalance,
		updateWalletBalance,
		protocolData,
		enableCollateral
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
	adjustedDebt: string;
	updateBorrowBalance: (token: string, amount: string) => void;
	updateCollateralBalance: (token: string, amount: string) => void;
	updateWalletBalance: (token: string, amount: string) => void;
	protocolData: any;
	enableCollateral: (market: any) => void;
}

export { LeverDataProvider, LeverDataContext };
