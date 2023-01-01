import {
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
} from "@chakra-ui/react";

import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { useContext } from "react";
import { DataContext } from "../../../context/DataProvider";
import { useEffect } from "react";
import axios from "axios";
import { tokenFormatter } from "../../../utils/formatters";
import { AppDataContext } from "../../../context/AppData";
import BuySellModal from "./BuySellModal";
import NumberInputWithSlider from "../../app/NumberInputWithSlider";
import { isValidNS } from "../../../utils/number";

const Big = require("big.js");

export default function BuyModule({ pair, limit }) {
	const [pairNow, setPairNow] = React.useState(null);
	const [amount, setAmount] = React.useState("0");
	const [token1Amount, settoken1Amount] = React.useState("0");

	const [sliderValue, setSliderValue] = React.useState(NaN);

	const [token0, setToken0] = React.useState(null);
	const [token1, setToken1] = React.useState(null);

	const { tokens } = useContext(DataContext);
	const { exchangeRate: price, setExchangeRate: setPrice } = useContext(AppDataContext);

	useEffect(() => {
		const _token0 = tokens.find((t) => t.id === pair?.tokens[0].id);
		const _token1 = tokens.find((t) => t.id === pair?.tokens[1].id);
		setToken0(_token0);
		setToken1(_token1);
		// if there is change in pair
		if (pair && pairNow !== pair?.id) {
			const _token0 = tokens.find((t) => t.id === pair?.tokens[0].id);
			const _token1 = tokens.find((t) => t.id === pair?.tokens[1].id);
			setToken0(_token0);
			setToken1(_token1);
			const newExchangeRate = pair?.exchangeRate / 10 ** 18;
			setPrice(newExchangeRate.toFixed(pair?.exchangeRateDecimals));
			settoken1Amount(
				Big(amount)
					.mul(newExchangeRate)
					.toNumber()
					.toFixed(pair?.exchangeRateDecimals ?? 0)
			);
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
				const token0Amount = Big(30)
					.times(token0.balance)
					.div(100)
					.div(10 ** token1.decimals);
				setAmount(
					token0Amount.toNumber().toFixed(pair.exchangeRateDecimals)
				);
				settoken1Amount(
					token0Amount
						.times(_price)
						.toNumber()
						.toFixed(pair.exchangeRateDecimals)
				);
			}
		}
	});

	const max = () => {
		if (!token0) return;
		if(!token0.balance) return;
		if(!token0.inOrderBalance) return;

		return Big((token0?.balance ?? 0) - (token0?.inOrderBalance ?? 0))
			.div(10 ** token0?.decimals).toNumber();
	};

	const updateToken0Amount = (e: string) => {
		setAmount(e);
		if (isValidNS(e)){
			if(Number(price) > 0){
				settoken1Amount(Big(e).times(price).toString());
			} else {
				settoken1Amount("0");
			}
		}
	};

	const updateToken1Amount = (e) => {
		settoken1Amount(e);
		if (isValidNS(e)){
			if(Number(price)){
				setAmount(Big(e).div(price).toString());
			} else {
				setAmount("0");
			}
		}
	};

	const onPriceChange = (e) => {
		setPrice(e);
		if (isValidNS(e)){
			if(Number(e) > 0){
				settoken1Amount(Big(amount).times(e).toString());
			} else {
				settoken1Amount("0");
			}
		}
	};

	return (
		<Flex flexDir={"column"} gap={4} width={"50%"}>
			<Flex flexDir={"column"} gap={1}>
				<Text fontSize={"sm"}>Price ({pair?.tokens[1].symbol})</Text>
				<NumberInput
				isDisabled={!limit}
					min={0}
					precision={pair?.exchangeRateDecimals}
					value={limit ? price : 'Place order at market price'}
					onChange={onPriceChange}
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

			{limit && <Flex flexDir={"column"} gap={1}>
				<Text fontSize={"sm"}>Amount ({pair?.tokens[1].symbol})</Text>
				<NumberInput
					min={0}
					precision={pair?.exchangeRateDecimals}
					value={token1Amount}
					onChange={updateToken1Amount}
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
			</Flex>}

			<Flex flexDir={"column"} gap={1} mb={1}>
				<Flex justify={"space-between"}>
					<Text fontSize={"sm"}>
						Total ({pair?.tokens[0].symbol})
					</Text>
					<Text fontSize={"xs"}>
						Balance{" "}
						{tokenFormatter(null).format(
							((token0?.balance ?? 0) - (token0?.inOrderBalance ?? 0)) / 10 ** token0?.decimals
						)} {token0?.symbol}
					</Text>
				</Flex>
				
				<NumberInputWithSlider max={max()} asset={token0} onUpdate={updateToken0Amount} value={amount} color='red2'/>

			</Flex>

			<BuySellModal
				limit={limit}
				token0={token0}
				token1={token1}
				token0Amount={amount}
				token1Amount={token1Amount}
				pair={pair}
				price={price}
				buy={false}
			/>
		</Flex>
	);
}