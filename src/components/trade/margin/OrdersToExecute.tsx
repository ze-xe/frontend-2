import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Flex,
	Skeleton,
	Text,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { tokenFormatter } from "../../../utils/formatters";
import { useEffect } from "react";
import { DataContext } from "../../../context/DataProvider";
import Link from "next/link";
import Big from "big.js";
import {
	getContract,
	send,
	getAddress,
	getInterface,
} from "../../../utils/contract";
import axios from "axios";
import { ChainID } from "../../../utils/chains";
import { ethers } from "ethers";
import Image from "next/image";
import { imageIds } from "../../../utils/const";

export default function OrdersToExecute({
	orders,
	pair,
	amountToFill,
	nextStep,
	close,
	token0,
	token1,
	buy,
	setOrderToPlace,
	price,
	limit,
}) {
	const [remainingAmount, setRemainingAmount] = React.useState(amountToFill);
	const [totalSize, setTotalSize] = React.useState(0);
	const [tokenAmountToSpend, setTokenAmountToSpend] = React.useState("0");
	const [amountExecuted, setAmountExecuted] = React.useState("0");
	const [loading, setLoading] = React.useState(false);
	const [response, setResponse] = React.useState(null);
	const [hash, setHash] = React.useState(null);
	const [confirmed, setConfirmed] = React.useState(false);

	const { chain, explorer, incrementAllowance } = useContext(DataContext);

	const execute = async () => {
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let _amount = Big(amountToFill)
			.times(10 ** pair.tokens[0].decimals)
			.toFixed(0);
		console.log(orders);
		const exchange = await getContract("Exchange", chain);
		send(
			exchange,
			"executeMultipleLimitOrders",
			[
				orders.map((order: any) => order.signature),
				orders.map((order: any) => order.value),
				_amount,
			],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				const receipt = await res.wait(1);
				const exchangeItf = await getInterface("Exchange", chain);
				// parse orders from receipt.logs
				let total = Big(0);

				receipt.logs.forEach((log: any) => {
					try {
						const parsed = exchangeItf.parseLog(log);
						if (parsed.name == "OrderExecuted") {
							console.log(parsed);
							total = total.plus(parsed.args.fillAmount);
						}
					} catch (err) {}
				});
				setOrderToPlace(Big(_amount).sub(total).toFixed(0));
				setRemainingAmount(Big(_amount).sub(total).toFixed(0));
				setAmountExecuted(total.toFixed(0));
				setConfirmed(true);
				setResponse("Transaction Successful!");
				
			})
			.catch((err: any) => {
				console.log(err);
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	const tokenToSpend = buy ? token1 : token0;
	// const tokenAmountToSpend = buy ? totalSize : Big(totalSize).times(10**pair.tokens[0].decimals).times(orders[-1].value.exchangeRate).toFixed(0);

	const approve = async () => {
		setLoading(true);
		const token = await getContract("ERC20", chain, tokenToSpend.id);
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
					tokenToSpend.id,
					ethers.constants.MaxUint256.toString()
				);
			})
			.catch((err: any) => {
				setLoading(false);
				console.log(err);
			});
	};

	useEffect(() => {
		if (orders) {
			// calculate total size
			let total = 0;
			orders.forEach((o: any) => {
				if (Number(o.value.amount) > 0) {
					total += Number(o.value.amount);
				}
			});
			setTotalSize(total);
			if (!buy) {
				const _tokenAmountToSpend = Big(amountToFill)
					.times(10 ** pair.tokens[0].decimals)
					.toFixed(0);
				setTokenAmountToSpend(_tokenAmountToSpend);
			} else {
				const _tokenAmountToSpend = Big(amountToFill)
					.times(10 ** pair.tokens[0].decimals)
					.times(price)
					.toFixed(0);
				setTokenAmountToSpend(_tokenAmountToSpend);
			}
		}
	});

	const status = response
		? response.includes("confirm")
			? "info"
			: confirmed && response.includes("Success")
			? "success"
			: "error"
		: null;

	return (
		<Box>
			{Big(tokenAmountToSpend).gt(tokenToSpend.allowance) ? (
				<>
					<Flex gap={3} my={5}>
						<Image
							src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${
								imageIds[tokenToSpend.symbol]
							}.png`}
							alt={""}
							width={40}
							height={40}
							style={{
								minWidth: "50px",
								minHeight: "45px",
							}}
						/>
						<Text fontSize={"md"}>
							You need to approve zexe to use your{" "}
							{tokenToSpend.symbol} tokens to execute this order.
						</Text>
					</Flex>
					<Button width={"100%"} mt={5} onClick={approve}>
						Approve
					</Button>
				</>
			) : (
				<>
					<Box my={4}>
						{[...orders].slice(0, 2).map((o: any) => {
							if (Number(o.value.amount) > 0)
								return (
									<Box
										py={2}
										my={2}
										bgColor="gray.900"
										px={2}
									>
										<Text fontSize={"xs"}>
											{o.signature}
										</Text>

										<Text>
											{tokenFormatter(null).format(
												o.value.amount /
													10 **
														pair.tokens[0].decimals
											)}{" "}
											{pair.tokens[0].symbol} @{" "}
											{tokenFormatter(null).format(
												o.value.exchangeRate / 10 ** 18
											)}{" "}
											{pair.tokens[1].symbol}
										</Text>
									</Box>
								);
							else return null;
						})}
						{orders.length == 0 ? (
							<Text mb={2} color="gray" fontSize={"sm"}>
								No orders to execute
							</Text>
						) : (orders.length > 2) ? (
							<Text mb={2} color="gray" fontSize={"sm"}>
								... {orders.length - 2} more orders
							</Text>
						) : <></>
						}
					</Box>

					<Text fontSize={"sm"} color="gray" mt={1}>
						Amount to fill
					</Text>
					<Text>
						{amountToFill} {pair.tokens[0].symbol}
					</Text>

					<Text fontSize={"sm"} color="gray" mt={1}>
						Total Size
					</Text>
					<Text>
						{tokenFormatter(null).format(
							totalSize / 10 ** pair.tokens[0].decimals
						)}{" "}
						{pair.tokens[0].symbol}
					</Text>

					{Number(amountExecuted) > 0 && (
						<>
							{/* {" "}
							<Text fontSize={"sm"} color="green" mt={1}>
								Total Executed
							</Text>
							<Text color="green">
								{tokenFormatter(null).format(
									Big(amountExecuted)
										.div(10 ** pair.tokens[0].decimals)
										.toNumber()
								)}{" "}
								{pair.tokens[0].symbol}
							</Text> */}
						</>
					)}
					{orders && (
						<Flex flexDir={"column"} width={"100%"} mt={5}>
							<Box mb={0}>
								<Box width={"100%"} mb={2}>
									{status && (
										<Alert status={status} variant="subtle">
											<AlertIcon />
											<Box>
												<Text fontSize="md" mb={0}>
													{response}
												</Text>
												{hash && (
													<Link
														href={explorer() + hash}
														target="_blank"
													>
														{" "}
														<Text fontSize={"sm"}>
															View on explorer
														</Text>
													</Link>
												)}
											</Box>
										</Alert>
									)}
								</Box>
								{status == "info" ? (
									<></>
								) : status == "success" ||
								  orders.length == 0 ? (
									<Button onClick={limit && Big(remainingAmount).gt(0) ? nextStep: close} width="100%">
										{limit && Big(remainingAmount).gt(0) ? "Next" : "Close"}
									</Button>
								) : (
									<Button
										bgColor={buy ? "green2" : "red2"}
										width="100%"
										onClick={execute}
										loadingText="Sign the transaction in your wallet"
										isLoading={loading}
										disabled={!orders}
									>
										Execute {buy ? "buy" : "sell"} orders
									</Button>
								)}
							</Box>
						</Flex>
					)}
				</>
			)}
		</Box>
	);
}
