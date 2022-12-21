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
	IconButton,
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

import { Input } from "@chakra-ui/react";

import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from "@chakra-ui/react";

const imageIds = {
	ETH: "1027",
	BTC: "1",
	USDC: "3408",
	DAI: "4943",
};

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
import { ADDRESSES } from "../../../utils/const";
import Big from "big.js";
import { ChainID } from "../../../utils/chains";
import axios from "axios";
import { MinusIcon } from "@chakra-ui/icons";
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
	const { updateBorrowBalance, updateWalletBalance } = useContext(LeverDataContext);

	const { isConnected: isEvmConnected, address: EvmAddress } = useAccount();

	const updateSliderValue = (value: number) => {
		setSliderValue(value);
		setInputAmount(
			(
				(value * Math.min(market?.borrowBalance / 10 ** token?.decimals, market?.balance / 10 ** token?.decimals)) /
				100
			).toString()
		);
	};

	const updateMax = () => {
		setInputAmount((market?.borrowBalance / 10 ** token?.decimals).toString());
		setSliderValue(100);
	};

	const updateAmount = (value: string) => {
		setInputAmount(value);
		// setSliderValue(Number(value) * 100 / (token?.balance / 10 ** token?.decimals));
	};

	const amountExceedsBalance = () => {
		return Number(inputAmount) > market?.borrowBalance / 10 ** token?.decimals;
	};

	const repay = async () => {
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let amount = Big(inputAmount).times(10 ** token?.decimals);
		const ctoken = await getContract("CToken", chain, market?.id);
		send(ctoken, "repayBorrow", [amount.toFixed(0)], chain)
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
					updateBorrowBalance(market?.id, amount.neg().toString());
				}
			})
			.catch((err: any) => {
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
				<Button
					size={"md"}
					
					variant={"outline"}
					onClick={onOpen}
					aria-label={""}
				><MinusIcon boxSize={"20px"} /></Button>
			</Box>

			<Modal isOpen={isOpen} onClose={_onClose} isCentered>
				<ModalOverlay />
				<ModalContent bgColor={"#1D1334"} borderRadius={0}>
					<ModalHeader>
						Repaying {market?.inputToken.name}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody mb={2}>
							<Box>
								<Text
									textAlign={"right"}
									fontSize="xs"
									mb={1}
									mt={-2}
								>
									Balance{" "}
									{market?.borrowBalance / 10 ** token?.decimals}
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
											market?.borrowBalance /
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
									disabled={amountExceedsBalance() || loading}
									isLoading={loading}
									loadingText="Sign the transaction in your wallet"
									onClick={repay}
								>
									{amountExceedsBalance()
										? "Insufficient Balance"
										: "Repay"}
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
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}
