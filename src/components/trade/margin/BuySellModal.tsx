import { Box, Button } from "@chakra-ui/react";
import React, { useContext } from "react";
const Big = require("big.js");

import axios from "axios";

import { DataContext } from "../../../context/DataProvider";
import { useAccount, useSignTypedData } from "wagmi";
import { config, domain, Endpoints, types } from "../../../utils/const";
import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import {
	getAddress,
	getContract,
	getInterface,
	send,
} from "../../../utils/contract";
import { ethers } from "ethers";
import { tokenFormatter } from "../../../utils/formatters";
import { LeverDataContext } from "../../../context/LeverDataProvider";
import { isValidNS, isValidAndPositiveNS } from '../../../utils/number';

export default function BuySellModal({
	pair,
	token1,
	token0,
	token1Amount, // needed for market orders
	token0Amount,
	borrowLimit,
	loops,
	price, // needed for limit orders
	buy,
	limit,
	leverage = 1
}) {
	if (token0Amount == "") token0Amount = "0";
	if (token1Amount == "") token1Amount = "0";
	if (price == "") price = "0";

	const toast = useToast();
	const toastIdRef = React.useRef<any>();

	const [orderToPlace, setOrderToPlace] = React.useState(null);

	const [loading, setLoading] = React.useState(false);

	const { address, isConnected } = useAccount();

	const { chain, incrementAllowance, addPlacedOrder, updateWalletBalance } =
		useContext(DataContext);
	const { data, isError, isLoading, isSuccess, signTypedDataAsync } =
		useSignTypedData();

	const { markets, enableCollateral } = useContext(LeverDataContext);

	const [market, setMarket] = React.useState(null);

	const amountExceedsBalance = () => {
		if (!token1 || !token0) return true;
		const amount = buy ? token0Amount * price : token0Amount;
		const balance = buy
			? token1.balance / 10 ** token1.decimals
			: token0.balance / 10 ** token0.decimals;

		if (isNaN(Number(amount)) || isNaN(Number(balance))) return true;
		return Big(amount).gt(balance);
	};

	useEffect(() => {
		if (token0Amount > 0 && token0 && !orderToPlace) {
			setOrderToPlace(
				Big(token0Amount)
					.times(10 ** token0?.decimals)
					.toFixed(0)
			);
		}
		if (markets && token0) {
			if (!market && markets.length > 0) {
				setMarket(markets.find((m) => m.inputToken.id === (buy ? token0: token1).id));
			}
		}
	}, [token0Amount, token0, orderToPlace, markets, market, buy, token1]);

	const approve = async (_token: any) => {
		setLoading(true);
		const token = await getContract("ERC20", chain, _token.id);
		send(
			token,
			"approve",
			[getAddress("Exchange", chain), ethers.constants.MaxUint256],
			chain
		)
			.then(async (res: any) => {
				await res.wait(1);
				setLoading(false);
				incrementAllowance(
					_token.id,
					ethers.constants.MaxUint256.toString()
				);
			})
			.catch((err: any) => {
				setLoading(false);
				console.log(err);
			});
	};

	const enable = async () => {
		setLoading(true);
		const _lever = await getContract("Lever", chain);
		send(_lever, "enterMarkets", [[market.id]], chain)
		.then(async (res: any) => {
			await res.wait(1);
			setLoading(false);
			enableCollateral(market.id);
		})
		.catch((err: any) => {
			setLoading(false);
			console.log(err);
		});
	}

	// a function to add two numbers


	const execute = async () => {
		setLoading(true);
		let _amount = Big(token0Amount)
			.times(10 ** token0.decimals)
			.toFixed(0);
		// if we're buying && market order: use token1Amount
		if (buy && !limit) {
			_amount = Big(token1Amount)
				.times(10 ** token1.decimals)
				.toFixed(0);
		}

		try {
			const _orders = [];
			// (
			// 	await axios.get(
			// 		Endpoints[chain] +
			// 			`order/${limit ? "limit" : "market"}/matched/` +
			// 			pair.id,
			// 		{
			// 			params: {
			// 				amount: _amount,
			// 				exchangeRate: Big(price)
			// 					.times(10 ** 18)
			// 					.toFixed(0),
			// 				buy,
			// 				chainId: chain,
			// 			},
			// 		}
			// 	)
			// ).data.data;

			if (_orders.length > 0) {
				const exchange = await getContract("Exchange", chain);
				toast.close(toastIdRef.current);
				(toastIdRef as any).current = toast({
					title: "Sending transaction...",
					description: `Executing orders within ${tokenFormatter(
						null
					).format(price)} ${token1.symbol}/${token0.symbol} limit`,
					status: "loading",
					duration: null,
				});
				console.log(_amount);
				const res = await send(
					exchange,
					buy && !limit
						? "executeT1LimitOrders"
						: "executeT0LimitOrders",
					[
						_orders.map((order: any) => order.signature),
						_orders.map((order: any) => order.value),
						_amount,
					],
					chain
				);
				const receipt = await res.wait(1);
				const exchangeItf = await getInterface("Exchange", chain);
				let total = Big(0);
				receipt.logs.forEach((log: any) => {
					try {
						const parsed = exchangeItf.parseLog(log);
						if (parsed.name == "OrderExecuted") {
							console.log(
								"Filled",
								parsed.args.fillAmount.toString(),
								token0.symbol
							);
							total = total.plus(parsed.args.fillAmount);
						}
					} catch (err) {}
				});
				if (buy) {
					updateWalletBalance(token0.id, total.toString());
					updateWalletBalance(
						token1.id,
						Big(total).times(price).neg().toString()
					);
				} else {
					updateWalletBalance(token0.id, total.neg().toString());
					updateWalletBalance(
						token1.id,
						Big(total).times(price).toString()
					);
				}

				_amount = Big(_amount).sub(total).toFixed(0);
			}
			if (Big(_amount).gt(0) && limit) {
				toast.close(toastIdRef.current);
				(toastIdRef as any).current = toast({
					title: "Placing order...",
					description: `Creating limit order of ${tokenFormatter(
						null
					).format(_amount / 1e18)} ${
						token0.symbol
					} at ${tokenFormatter(null).format(price)} ${
						token1.symbol
					}/${token0.symbol}`,
					status: "loading",
					duration: null,
				});

				const value = {
					maker: address,
					token0: token0.id,
					token1: token1.id,
					amount: _amount,
					orderType: buy ? 2 : 3,
					salt: (Math.random() * 1000000).toFixed(0),
					exchangeRate: ethers.utils
						.parseEther(price.toString())
						.toString(),
					borrowLimit: (borrowLimit * 1e6).toFixed(0),
					loops: loops,
				};

				signTypedDataAsync({
					domain: domain(chain),
					types: types,
					value,
				})
					.then((signature) => {
						console.log(signature);
						axios
							.post(Endpoints[chain] + "order/create", {
								signature,
								data: value,
								chainId: chain.toString(),
							})
							.then((res) => {
								addPlacedOrder({
									signature: signature,
									pair: pair.id,
									value: value,
								});
								setLoading(false);
								toast.close(toastIdRef.current);
								toast({
									title: "Order created successfully!",
									description: "Order created successfully!",
									status: "success",
								});
							})
							.catch((err) => {
								setLoading(false);
								toast.close(toastIdRef.current);
								toast({
									title: "Order failed. Please try again!",
									description: err.response.data.error,
									status: "error",
								});
							});
					})
					.catch((err: any) => {
						setLoading(false);
						toast.close(toastIdRef.current);
						toast({
							title: "Order failed. Please try again!",
							description: err.message.slice(0, 100),
							status: "error",
						});
					});
			} else {
				setLoading(false);
				toast.close(toastIdRef.current);
				toast({
					title: "Order executed successfully!",
					description: "Amount was filled within limit!",
					status: "success",
				});
			}
		} catch (err) {
			setLoading(false);
			toast.close(toastIdRef.current);
			toast({
				title: "Order failed. Please try again!",
				description: err.message
					? err.message.slice(0, 100)
					: JSON.stringify(err).slice(0, 100),
				status: "error",
			});
		}
	};

	const shouldEnterAmount = () => {
		if(!isValidAndPositiveNS(token0Amount)) return true;
		return token0Amount < (leverage * pair?.minToken0Order)/(10**token0?.decimals) || amountExceedsBalance()
	}

	token0Amount = parseFloat(token0Amount);
	token1Amount = parseFloat(token1Amount);

	return (
		<>
			{(isValidNS(token0Amount) && Big(token0Amount).lt(token0?.allowance ?? 1e50) || shouldEnterAmount()) ? (
				(isValidNS(token1Amount) && Big(token1Amount).lt(token1?.allowance ?? 1e50) || shouldEnterAmount()) ? (
					((market && market.isCollateral) || shouldEnterAmount()) ? (
						<Button
							width={"100%"}
							mt="2"
							bgColor={buy ? "green2" : "red2"}
							onClick={execute}
							disabled={
								loading ||
								!isValidAndPositiveNS(token0Amount) ||
								!isConnected ||
								amountExceedsBalance() ||
								price == "" ||
								Number(price) <= 0 ||
								borrowLimit == "" ||
								Number(borrowLimit) <= 0 ||
								loops == "" ||
								Number(loops) <= 0
							}
							_hover={{ opacity: 0.7 }}
							loadingText="Executing..."
							isLoading={loading}
						>
							{!isConnected
								? "Please connect wallet to continue"
								: !isValidAndPositiveNS(token0Amount)
								? "Enter Amount"
								: amountExceedsBalance()
								? "Insufficient Trading Balance"
								: buy
								? "Buy (Long)"
								: "Sell (Short)"}
						</Button>
					) : (
						<Button
						width={"100%"}
						mt="2"
						onClick={enable}
						loadingText="Enabling..."
						isLoading={loading}
						disabled={!isConnected}
						>
							{!isConnected ? 'Please connect your wallet' : `Enable ${market?.inputToken.symbol} as collateral`}
						</Button>
					)
				) : (
					<Button
						width={"100%"}
						mt="2"
						onClick={() => approve(token1)}
						loadingText="Approving..."
						isLoading={loading}
						disabled={!isConnected}
					>
						{!isConnected ? 'Please connect your wallet' : `Approve ${token1?.symbol}`}
					</Button>
				)
			) : (
				<Button
					width={"100%"}
					mt="2"
					onClick={() => approve(token0)}
					loadingText="Approving..."
					isLoading={loading}
				>
					Approve {token0?.symbol}
				</Button>
			)}
		</>
	);
}
