import { Alert, AlertIcon, Box, Button, Flex, Text } from "@chakra-ui/react";
import axios from "axios";
import Big from "big.js";
import { ethers, TypedDataDomain } from "ethers";
import Link from "next/link";
import React, { useContext, useEffect } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { DataContext } from "../../../context/DataProvider";
import { getAddress, getContract, send } from "../../../utils/contract";
import Image from "next/image";
import { imageIds, Endpoints } from '../../../utils/const';
export default function PlaceOrder({
	orderAmount,
	amountToPlace,
	token0,
	token1,
	price,
	buy,
	nextStep,
}) {
	const [loading, setLoading] = React.useState(false);
	const [response, setResponse] = React.useState(null);
	const [hash, setHash] = React.useState(null);
	const [confirmed, setConfirmed] = React.useState(false);

	const [tokenAmountToSpend, setTokenAmountToSpend] = React.useState("0");

	const { data, isError, isLoading, isSuccess, signTypedDataAsync } =
		useSignTypedData();

	const { chain, explorer, incrementAllowance } = useContext(DataContext);
	const { address: EvmAddress } = useAccount();

	const tokenToSpend = buy ? token1 : token0;

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
		if (token0 && token1) {
			if (!buy) {
				const _tokenAmountToSpend = Big(amountToPlace)
					.times(10 ** token0.decimals)
					.toFixed(0);
				setTokenAmountToSpend(_tokenAmountToSpend);
			} else {
				const _tokenAmountToSpend = Big(amountToPlace)
					.times(10 ** token1.decimals)
					.times(price)
					.toFixed(0);
				setTokenAmountToSpend(_tokenAmountToSpend);
			}
		}
	});

	const place = async () => {
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");

		let _amount = Big(amountToPlace)
			// .times(10 ** token0.decimals)
			.toFixed(0);

		const domain: any = {
			name: "zexe",
			version: "1",
			chainId: chain.toString(),
			verifyingContract: getAddress("Exchange", chain),
		};

		// The named list of all type definitions
		const types = {
			Order: [
				{ name: "maker", type: "address" },
				{ name: "token0", type: "address" },
				{ name: "token1", type: "address" },
				{ name: "amount", type: "uint256" },
				{ name: "buy", type: "bool" },
				{ name: "salt", type: "uint32" },
				{ name: "exchangeRate", type: "uint216" },
			],
		};

		const value = {
			maker: EvmAddress,
			token0: token0.id,
			token1: token1.id,
			amount: _amount,
			buy,
			salt: (Math.random() * 1000000).toFixed(0),
			exchangeRate: ethers.utils.parseEther(price.toString()).toString(),
		};

		signTypedDataAsync({
			domain,
			types,
			value,
		}).then((signature) => {
			console.log(signature);
			axios
				.post(Endpoints[chain] + "order/create", {
					signature,
					data: value,
					chainId: chain.toString(),
				})
				.then((res) => {
					setLoading(false);
					setConfirmed(true);
					setResponse("Order created successfully!");
					console.log(res);
				})
				.catch((err) => {
					setLoading(false);
					setConfirmed(true);
					setResponse("Order failed. Please try again!");
					console.log("err", err);
				});
		});
	};

	return (
		<>
			{!Big(tokenAmountToSpend).gt(tokenToSpend.allowance) ? (
				<Box>
					<Text fontSize={"sm"} color="gray" mt={1}>
						Order amount
					</Text>
					<Text>{orderAmount}</Text>

					{(!Big(orderAmount).eq(Big(amountToPlace).div(10 ** 18))) && (
							<>
								<Text fontSize={"sm"} color="gray" mt={1}>
									Executed amount
								</Text>
								<Text>
									{Big(orderAmount)
										.minus(Big(amountToPlace).div(10 ** 18))
										.toFixed(10)}
								</Text>
							</>
						)}

					{amountToPlace == 0 ? (
						<>
							<Box my={4} bg='green.800' py={2} px={4}>
								<Text fontSize={"md"}>
									Limit order was executed successfully!
								</Text>
							</Box>
							<Button width={"100%"} onClick={nextStep}>
								Close
							</Button>
						</>
					) : (
						<>
							{!Big(orderAmount).eq(amountToPlace) && (
									<>
										{" "}
										<Text
											fontSize={"sm"}
											color="gray"
											mt={1}
										>
											Order amount to place
										</Text>
										<Text>
											{Big(amountToPlace)
												.div(10 ** 18)
												.toFixed(10)}
										</Text>
									</>
								)}

										<Text
											fontSize={"sm"}
											color="gray"
											mt={1}
										>
											Limit Price
										</Text>
										<Text>
											{price}
										</Text>

							<Flex flexDir={"column"} width={"100%"} mt={4}>
								{response ? (
									<Box mb={2}>
										<Box width={"100%"} mb={2}>
											<Alert
												status={
													response.includes("confirm")
														? "info"
														: confirmed &&
														  response.includes(
																"success"
														  )
														? "success"
														: "error"
												}
												variant="subtle"
											>
												<AlertIcon />
												<Box>
													<Text fontSize="md" mb={0}>
														{response}
													</Text>
													{hash && (
														<Link
															href={
																explorer() +
																hash
															}
															target="_blank"
														>
															{" "}
															<Text
																fontSize={"sm"}
															>
																View on explorer
															</Text>
														</Link>
													)}
												</Box>
											</Alert>
										</Box>
										<Button onClick={nextStep} width="100%">
											Close
										</Button>
									</Box>
								) : (
									<>
										<Button
											bgColor={buy ? "green2" : "red2"}
											mt={4}
											width="100%"
											onClick={place}
											loadingText="Sign the transaction in your wallet"
											isLoading={loading}
										>
											Place {buy ? "buy" : "sell"} order
										</Button>
										{/* <Button onClick={onClose} mt={2}>
										Cancel
									</Button>{' '} */}
									</>
								)}
							</Flex>
						</>
					)}
				</Box>
			) : (
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
							{tokenToSpend.symbol} tokens to place this order.
						</Text>
					</Flex>
					<Button
						width={"100%"}
						mt={5}
						onClick={approve}
						loadingText="Approving..."
						isLoading={loading}
					>
						Approve
					</Button>
				</>
			)}
		</>
	);
}
