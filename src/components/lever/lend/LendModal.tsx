import {
	Box,
	Button,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	useDisclosure,
	Text,
	Tooltip,
	InputLeftAddon,
	InputRightAddon,
	Flex,
	Alert,
	AlertIcon,
	Link,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import Image from "next/image";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";

import { Input, IconButton } from '@chakra-ui/react';

import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from "@chakra-ui/react";


import {
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
} from "@chakra-ui/react";
import { getContract, send } from "../../../utils/contract";
import { DataContext } from "../../../context/DataProvider";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import Big from "big.js";
import { ChainID } from "../../../utils/chains";
import axios from "axios";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { LeverDataContext } from "../../../context/LeverDataProvider";

export default function LendModal({ market, token }) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [sliderValue, setSliderValue] = React.useState(0);
	const [showTooltip, setShowTooltip] = React.useState(false);
	const [inputAmount, setInputAmount] = useState("0");

	const [loading, setLoading] = React.useState(false);
	const [response, setResponse] = React.useState(null);
	const [hash, setHash] = React.useState(null);
	const [confirmed, setConfirmed] = React.useState(false);

	const { chain, explorer } = useContext(DataContext);
	const { incrementAllowance, updateCollateralBalance, updateWalletBalance } = useContext(LeverDataContext);

	const updateSliderValue = (value: number) => {
		setSliderValue(value);
		if(!token?.balance) return
		setInputAmount(
			(
				(value * (token?.balance / 10 ** token?.decimals)) /
				100
			).toString()
		);
	};

	const updateMax = () => {
		setInputAmount((token?.balance / 10 ** token?.decimals).toString());
		setSliderValue(100);
	};

	const updateAmount = (value: string) => {
		setInputAmount(value);
		// setSliderValue(Number(value) * 100 / (token?.balance / 10 ** token?.decimals));
	};

	const amountExceedsBalance = () => {
		if(!token?.balance) return true
		return Number(inputAmount) > token?.balance / 10 ** token?.decimals;
	};

	const deposit = async () => {
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let amount = Big(inputAmount).times(10 ** token?.decimals);
		const ctoken = await getContract("CToken", chain, market?.id);
		send(ctoken, "mint", [amount.toFixed(0)], chain)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				if (chain == ChainID.NILE) {
					setHash(res);
					checkResponse(res);
				} else {
					setHash(res.hash);
					await res.wait(1);
					setConfirmed(true);
					setResponse("Transaction Successful!");
					updateWalletBalance(market?.id, amount.neg().toString());
					updateCollateralBalance(market?.id, amount.toString());
				}
			})
			.catch((err: any) => {
				console.log(err);
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	// check response in intervals
	const checkResponse = (tx_id: string) => {
		axios
			.get(
				"https://nile.trongrid.io/wallet/gettransactionbyid?value=" +
					tx_id
			)
			.then((res) => {
				if (!res.data.ret) {
					setTimeout(() => {
						checkResponse(tx_id);
					}, 2000);
				} else {
					setConfirmed(true);
					if (res.data.ret[0].contractRet == "SUCCESS") {
						setResponse("Transaction Successful!");
					} else {
						setResponse("Transaction Failed. Please try again.");
					}
				}
			})
			.catch((err: any) => {
				setLoading(false);
			});
	};

	const approve = async () => {
		setLoading(true);
		const cToken = await getContract("ERC20", chain, market?.inputToken.id);
		send(
			cToken,
			"approve",
			[market?.id, ethers.constants.MaxUint256],
			chain
		).then(async (res: any) => {
			await res.wait();
			setLoading(false);
			incrementAllowance(market.id, ethers.constants.MaxUint256.toString());
		})
		.catch((err: any) => {
			console.log(err);
			setLoading(false);
		})
	};

	const _onClose = () => {
		setInputAmount("0");
		setLoading(false);
		setResponse(null);
		setSliderValue(0);
		onClose();
	};

	return (
		<>
			<Box>
				<Button size={'md'}  variant={'outline'} onClick={onOpen} aria-label={""}>
				Deposit <PlusSquareIcon boxSize={'20px'} ml={2} />
				</Button>
			</Box>

			<Modal isOpen={isOpen} onClose={_onClose} isCentered>
				<ModalOverlay />
				<ModalContent bgColor={"#1D1334"} borderRadius={0}>
					<ModalHeader>
						Depositing {market?.inputToken.name}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody mb={2}>
						{Number(inputAmount +1) < Number(market?.allowance) ? (
							<Box>
								<Text
									textAlign={"right"}
									fontSize="xs"
									mb={1}
									mt={-2}
								>
									Balance{" "}
									{token?.balance ? token?.balance / 10 ** token?.decimals : 0}
								</Text>

								<InputGroup>
									<InputLeftAddon
										bgColor={"transparent"}
										borderColor="whiteAlpha.300"
										borderRadius={0}
									>
										<Image
											src={`/assets/crypto_logos/${market.inputToken.symbol.toLowerCase()}.png`}
											alt={""}
											width={30}
											height={30}
											style={{
												maxWidth: "25px",
												maxHeight: "25px",
											}}
										/>
									</InputLeftAddon>
									<NumberInput
										w={"100%"}
										defaultValue={0}
										max={
											token?.balance /
											10 ** token?.decimals
										}
										clampValueOnBlur={false}
										min={0}
										onChange={(e) => updateAmount(e)}
										value={inputAmount}
									>
										<NumberInputField borderRadius={0} />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
									<InputRightAddon
										bgColor={"transparent"}
										borderRadius={0}
										borderColor="whiteAlpha.300"
									>
										<Button
											variant={"ghost"}
											h="1.75rem"
											size="sm"
											onClick={updateMax}
										>
											Max
										</Button>
									</InputRightAddon>
								</InputGroup>

								<Slider
									id="slider"
									defaultValue={0}
									min={0}
									max={100}
									mb={10}
									mt={5}
									onChange={(v) => updateSliderValue(v)}
									value={sliderValue}
									onMouseEnter={() => setShowTooltip(true)}
									onMouseLeave={() => setShowTooltip(false)}
								>
									<SliderMark
										value={25}
										mt="3"
										ml="-2.5"
										fontSize="xs"
									>
										25%
									</SliderMark>
									<SliderMark
										value={50}
										mt="3"
										ml="-2.5"
										fontSize="xs"
									>
										50%
									</SliderMark>
									<SliderMark
										value={75}
										mt="3"
										ml="-2.5"
										fontSize="xs"
									>
										75%
									</SliderMark>
									<SliderTrack>
										<SliderFilledTrack
											bgColor={"primary"}
										/>
									</SliderTrack>
									<Tooltip
										hasArrow
										bg="primary"
										color="white"
										placement="top"
										isOpen={showTooltip}
										label={`${sliderValue}%`}
									>
										<SliderThumb />
									</Tooltip>
								</Slider>

								<Button
									width={"100%"}
									bgColor="primary"
									disabled={inputAmount == '0' || amountExceedsBalance() || loading}
									isLoading={loading}
									loadingText="Sign the transaction in your wallet"
									onClick={deposit}
								>
									{inputAmount == '0' ? 'Enter Amount' : amountExceedsBalance()
										? "Insufficient Balance"
										: "Deposit"}
								</Button>

								{response && (
									<Box my={2}>
										<Box width={"100%"} mb={2}>
											<Alert
												status={
													response.includes("confirm")
														? "info"
														: confirmed &&
														  response.includes(
																"Success"
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
									</Box>
								)}
							</Box>
						) : (
							<Box>
								<Flex gap={3} mb={5}>
									<Image
														src={`/assets/crypto_logos/${market.inputToken.symbol.toLowerCase()}.png`}

										alt={""}
										width={40}
										height={40}
										style={{
											minWidth: "50px",
											minHeight: "45px",
										}}
									/>
									<Box>
										<Text>
											To Deposit {token?.name} tokens to
											zexe, you need to enable it first{" "}
										</Text>
									</Box>
								</Flex>

								<Button
									width={"100%"}
									onClick={approve}
									isLoading={loading}
									loadingText="Approving..."
								>
									Approve {token?.name}
								</Button>
							</Box>
						)}
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}
