import {
	Box,
	Button,
	InputGroup,
	useDisclosure,
	Text,
	Tooltip,
	InputLeftAddon,
	InputRightAddon,
	Alert,
	AlertIcon,
	Link,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import Image from "next/image";

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

import { getContract, send } from "../../../../utils/contract";
import { DataContext } from "../../../../context/DataProvider";
import Big from "big.js";
import { LeverDataContext } from "../../../../context/LeverDataProvider";
import { tokenFormatter } from "../../../../utils/formatters";

export default function LendModal({ market, token }) {
	const [sliderValue, setSliderValue] = React.useState(0);
	const [showTooltip, setShowTooltip] = React.useState(false);
	const [inputAmount, setInputAmount] = useState("0");

	const [loading, setLoading] = React.useState(false);
	const [response, setResponse] = React.useState(null);
	const [hash, setHash] = React.useState(null);
	const [confirmed, setConfirmed] = React.useState(false);

	const { chain, explorer, updateWalletBalance } = useContext(DataContext);
	const { availableToBorrow, updateBorrowBalance } =
		useContext(LeverDataContext);

	const updateSliderValue = (value: number) => {
		setSliderValue(value);
		setInputAmount(
			((value * maxBorrow) / market.inputTokenPriceUSD / 100).toString()
		);
	};

	const updateMax = () => {
		setInputAmount((maxBorrow / market.inputTokenPriceUSD).toString());
		setSliderValue(100);
	};

	const updateAmount = (value: string) => {
		setInputAmount(value);
		// setSliderValue(Number(value) * 100 / (token?.balance / 10 ** token?.decimals));
	};

	const amountExceedsBalance = () => {
		return Number(inputAmount) > maxBorrow / market.inputTokenPriceUSD;
	};

	const borrow = async () => {
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		let amount = Big(inputAmount).times(10 ** token?.decimals);
		const exchange = await getContract("Exchange", chain);
		send(exchange, "borrow", [token.id, amount.toFixed(0)], chain)
			.then(async (res: any) => {
				setLoading(false);
				setResponse("Transaction sent! Waiting for confirmation...");
				setHash(res.hash);
				await res.wait(1);
				setConfirmed(true);
				setResponse("Transaction Successful!");
				updateWalletBalance(token?.id, amount.toString());
				updateBorrowBalance(market?.id, amount.toString());
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setResponse("Transaction failed. Please try again!");
			});
	};

	const maxBorrow = Math.min(
		parseFloat(availableToBorrow),
		market?.totalDepositBalanceUSD - market?.totalBorrowBalanceUSD
	);

	return (
		<>
			<Box>
				<Text textAlign={"right"} fontSize="xs" mb={1} mt={-2}>
					Max{" "}
					{tokenFormatter(null).format(
						maxBorrow / market.inputTokenPriceUSD
					)}{" "}
					{market.inputToken.symbol}
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
							parseFloat(availableToBorrow) /
							market.inputTokenPriceUSD
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
					<SliderMark value={25} mt="3" ml="-2.5" fontSize="xs">
						25%
					</SliderMark>
					<SliderMark value={50} mt="3" ml="-2.5" fontSize="xs">
						50%
					</SliderMark>
					<SliderMark value={75} mt="3" ml="-2.5" fontSize="xs">
						75%
					</SliderMark>
					<SliderTrack>
						<SliderFilledTrack bgColor={"primary"} />
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
					onClick={borrow}
				>
					{amountExceedsBalance() ? "Insufficient Balance" : "Borrow"}
				</Button>

				{response && (
					<Box my={2}>
						<Box width={"100%"} mb={2}>
							<Alert
								status={
									response.includes("confirm")
										? "info"
										: confirmed &&
										  response.includes("Success")
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
											href={explorer() + hash}
											target="_blank"
										>
											<Text fontSize={"sm"}>
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
		</>
	);
}
