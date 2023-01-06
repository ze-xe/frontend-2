import {
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
} from "@chakra-ui/react";

import { Box, Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import React from "react";
import { useContext } from "react";
import { DataContext } from "../../../context/DataProvider";
import { useEffect } from "react";

import BuySellModal from "./BuySellModal";
import { tokenFormatter } from "../../../utils/formatters";
import { AppDataContext } from "../../../context/AppData";
import NumberInputWithSlider from "../../app/NumberInputWithSlider";
import { isValidNS } from "../../../utils/number";

const Big = require("big.js");

export default function BuyModule({ pair, limit }) {
	const [pairNow, setPairNow] = React.useState(null);
	const [token1Amount, setToken1Amount] = React.useState("0");
	const [token0Amount, settoken0Amount] = React.useState("0");

	const [sliderValue, setSliderValue] = React.useState(NaN);

	const [token0, setToken0] = React.useState(null);
	const [token1, setToken1] = React.useState(null);

	const { tokens } = useContext(DataContext);
	const { exchangeRate: price, setExchangeRate: setPrice } =
		useContext(AppDataContext);

	useEffect(() => {
		const _token0 = tokens.find((t) => t.id === pair?.tokens[0].id);
		const _token1 = tokens.find((t) => t.id === pair?.tokens[1].id);

		setToken0(_token0);
		setToken1(_token1);
		if (pair && pairNow !== pair?.id) {
			const _token0 = tokens.find((t) => t.id === pair?.tokens[0].id);
			const _token1 = tokens.find((t) => t.id === pair?.tokens[1].id);

			setToken0(_token0);
			setToken1(_token1);
			const newExchangeRate = pair?.exchangeRate / 10 ** 18;

			setPrice(newExchangeRate.toFixed(pair?.exchangeRateDecimals));
			newExchangeRate > 0
				? settoken0Amount(
						Big(token1Amount)
							.div(newExchangeRate)
							.toNumber()
							.toFixed(pair?.exchangeRateDecimals ?? 0)
				  )
				: settoken0Amount("0");
			setPairNow(pair?.id);
		}

		if (
			pair?.exchangeRate > 0 &&
			token1?.balance &&
			token0?.balance &&
			isNaN(sliderValue)
		) {
			const _price = Big(pair.exchangeRate).div(10 ** 18);
			setPrice(_price.toString());
			setSliderValue(20);
			if (_price.toNumber() > 0) {
				const token1Amount = Big(30)
					.times(token1.balance)
					.div(100)
					.div(10 ** token1.decimals);

				setToken1Amount(
					token1Amount.toNumber().toFixed(pair.exchangeRateDecimals)
				);
				settoken0Amount(
					token1Amount
						.div(_price)
						.toNumber()
						.toFixed(pair.exchangeRateDecimals)
				);
			}
		}
	});

	const max = () => {
		if (!token1?.balance) return 0;
		if (!token1?.inOrderBalance) return 0;
		return Big((token1.balance ?? 0) - (token1.inOrderBalance ?? 0))
			.div(10 ** token1.decimals)
			.toNumber();
	};

	const updateToken1Amount = (e: string) => {
		setToken1Amount(e);
		if (isValidNS(e)) {
			if (Number(price) > 0) {
				settoken0Amount(Big(Number(e)).div(price).toString());
			} else {
				settoken0Amount("0");
			}
		}
	};

	const updateToken0Amount = (e: string) => {
		settoken0Amount(e);
		if (isValidNS(e)) {
			if (Number(price) > 0) {
				setToken1Amount(Big(Number(e)).times(price).toString());
			} else {
				setToken1Amount("0");
			}
		}
	};

	const onPriceChange = (e: string) => {
		setPrice(e);
		if (isValidNS(e)) {
			if (Number(e) > 0) {
				settoken0Amount(Big(Number(token1Amount)).div(Number(e)).toString());
			} else {
				settoken0Amount("0");
			}
		}
	};

	return (
		<Flex flexDir={"column"} gap={4} width={"50%"}>
			<Flex flexDir={"column"} gap={1}>
				<Text fontSize={"sm"}>Price ({token1?.symbol})</Text>
				<NumberInput
					isDisabled={!limit}
					min={pair?.minToken0Order / 10 ** token0?.decimals ?? 0}
					precision={10}
					value={limit ? price : "Place order at market price"}
					onChange={onPriceChange}
					variant="filled"
					border={"1px"}
					borderColor={"gray.700"}
				>
					<NumberInputField />
					<NumberInputStepper>
						<NumberIncrementStepper />
						<NumberDecrementStepper />
					</NumberInputStepper>
				</NumberInput>
			</Flex>

			{limit && (
				<Flex flexDir={"column"} gap={1}>
					<Text fontSize={"sm"}>Amount ({token0?.symbol})</Text>
					<NumberInput
						min={pair?.minToken0Order / 10 ** token0?.decimals}
						precision={10}
						value={token0Amount}
						onChange={updateToken0Amount}
						variant="filled"
						border={"1px"}
						// borderRadius="6"
						borderColor={"gray.700"}
					>
						<NumberInputField />
						<NumberInputStepper>
							<NumberIncrementStepper />
							<NumberDecrementStepper />
						</NumberInputStepper>
					</NumberInput>
				</Flex>
			)}

			<Flex flexDir={"column"} gap={1} mb={1}>
				<Flex justify={"space-between"}>
					<Text fontSize={"sm"}>Total ({token1?.symbol})</Text>
					<Text fontSize={"xs"}>
						Min:{" "}
						{tokenFormatter(null).format(
							(pair?.minToken0Order * price) /
								10 ** token0?.decimals
						)}{" "}
						{token1?.symbol}
					</Text>
				</Flex>

				<NumberInputWithSlider
					max={max()}
					min={
						(pair?.minToken0Order * price) / 10 ** token0?.decimals
					}
					asset={token1}
					onUpdate={updateToken1Amount}
					value={token1Amount}
					color="green2"
				/>
			</Flex>

			<BuySellModal
				limit={limit}
				pair={pair}
				token0={token0}
				token1={token1}
				token0Amount={token0Amount}
				token1Amount={token1Amount}
				price={price}
				buy={true}
			/>
		</Flex>
	);
}
