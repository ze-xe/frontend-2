import {
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	HStack,
	useNumberInput,
	Divider,
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
import { isValidNS, isValidAndPositiveNS } from "../../../utils/number";

import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from "@chakra-ui/react";

const Big = require("big.js");

const MIN_TOKEN0 = 0.01;
const MAX_BORROW_LIMIT = 0.75;

export default function BuyModule({ pair, limit }) {
	const [leverage, setLeverage] = React.useState(1);
	const [borrowLimit, setBorrowLimit] = React.useState(0);
	const [nLoops, setNLoops] = React.useState(0);
	const [liquidationPrice, setLiquidationPrice] = React.useState(0);
	// const [maxLeverage, setMaxLeverage] = React.useState(10);


	const [pairNow, setPairNow] = React.useState(null);
	const [token1Amount, setToken1Amount] = React.useState("0");
	const [token0Amount, setToken0Amount] = React.useState("0");

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
		if (pair && pairNow !== pair?.id) {
			const _token0 = tokens.find((t) => t.id === pair?.tokens[0].id);
			const _token1 = tokens.find((t) => t.id === pair?.tokens[1].id);

			setToken0(_token0);
			setToken1(_token1);
			const newExchangeRate = pair?.exchangeRate / 10 ** 18;

			setPrice(newExchangeRate.toFixed(pair?.exchangeRateDecimals));
			newExchangeRate > 0
				? setToken0Amount(
						Big(token1Amount)
							.div(newExchangeRate)
							.toFixed(parseInt(pair?.exchangeRateDecimals) ?? 0)
				  )
				: setToken0Amount("0");
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
			setSliderValue(3);
			if (_price.toNumber() > 0) {
				const token1Amount = Big(30)
					.times(token1.balance)
					.div(100)
					.div(10 ** token1.decimals);

				setToken1Amount(
					token1Amount.toNumber().toFixed(pair.exchangeRateDecimals)
				);
				setToken0Amount(
					token1Amount
						.div(_price)
						.toNumber()
						.toFixed(pair.exchangeRateDecimals)
				);
			}
		}
		if (
			isValidNS(token0Amount) &&
			isValidNS(leverage) &&
			parseFloat(token0Amount) > MIN_TOKEN0
		) {
			const _borrowLimit = (MIN_TOKEN0 / parseFloat(token0Amount) - 1) / leverage + 1;
			if (!isValidAndPositiveNS(_borrowLimit)) return;
			setBorrowLimit(_borrowLimit);
			if (isValidAndPositiveNS(token1Amount)) {
				const _nLoops = Math.floor(
					Math.log(MIN_TOKEN0 / parseFloat(token0Amount)) /
						Math.log(_borrowLimit)
				);
				if (!isValidAndPositiveNS(_nLoops)) return;
				setNLoops(_nLoops);
				if (isValidAndPositiveNS(price)) {
					const _token1Amount = (price * parseFloat(token0Amount) * _borrowLimit * (1 - _borrowLimit ** _nLoops)) / (1 - _borrowLimit)
					console.log('token1amount', _token1Amount, _borrowLimit, _nLoops);
					setToken1Amount(_token1Amount.toString());
					setLiquidationPrice(Number(_token1Amount) / (leverage * parseFloat(token0Amount) * MAX_BORROW_LIMIT));
					console.log(Number(_token1Amount) / (price * parseFloat(token0Amount) * MAX_BORROW_LIMIT));

				}
			}
		}
	});

	const maxLeverage = () => {
		if(!isValidAndPositiveNS(price)) return 3;
		if(!isValidAndPositiveNS(token0Amount)) return 3;
		if(!isValidAndPositiveNS(token1Amount)) return 3;
		return 3
	}

	const max = () => {
		if (!token0?.balance) return 0;
		if (!token0?.inOrderBalance) return 0;
		return Big((token0.balance ?? 0) - (token0.inOrderBalance ?? 0))
			.div(10 ** token0.decimals)
			.toNumber();
	};

	const updateToken0Amount = (e: string) => {
		setToken0Amount(e);
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
				setToken0Amount(
					Big(Number(token1Amount)).div(Number(e)).toString()
				);
			} else {
				setToken0Amount("0");
			}
		}
	};

	return (
		<Flex flexDir={"column"} gap={4} width={"50%"}>
			<Flex flexDir={"column"} gap={1}>
				<Text fontSize={"sm"}>Price ({token1?.symbol})</Text>
				<NumberInput
					isDisabled={!limit}
					min={0}
					precision={10}
					value={limit ? price : "Place order at market price"}
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

			<Flex flexDir={"column"} gap={1}>
				<Flex justify={"space-between"}>
					<Text fontSize={"sm"}>Amount ({token0?.symbol})</Text>
					<Text fontSize={"xs"}>
						Balance{" "}
						{tokenFormatter(null).format(
							((token0?.balance ?? 0) -
								(token0?.inOrderBalance ?? 0)) /
								10 ** token0?.decimals
						)}{" "}
						{token0?.symbol}
					</Text>
				</Flex>

				<NumberInputWithSlider
					max={max()}
					asset={token0}
					onUpdate={updateToken0Amount}
					value={parseFloat(token0Amount)}
					color="green2"
				/>
			</Flex>

			<Flex
				border="1px"
				borderColor={"gray.700"}
				bgColor={"whiteAlpha.100"}
				align={"center"}
				flexDir='column'
				py={2}
				px={4}
			>
				<Flex width={'100%'} justify='space-between'>
					<Text fontSize={"xs"}>Leverage</Text>
					<Text fontSize={"xs"}>
						Liq Price:{" "}
						{tokenFormatter(null).format(liquidationPrice)}
					</Text>
				</Flex>
				<Flex width={'100%'} pt={1} justify='space-between' align='center'>
					<Box height="6" width={'20%'}>
						{tokenFormatter(null).format(leverage)} x
					</Box>
					<Slider
						min={1.1}
						max={3}
						step={0.1}
						defaultValue={3}
						value={leverage}
						onChange={(e) => setLeverage(e)}
					>
						<SliderTrack>
							<SliderFilledTrack bgColor={"white"} />
						</SliderTrack>
						<SliderThumb />
					</Slider>
				</Flex>
			</Flex>

			{limit && (
				<Flex flexDir={"column"} gap={1}>
					<Text fontSize={"sm"}>Total ({token1?.symbol})</Text>
					<NumberInput
						min={0}
						precision={10}
						value={price * parseFloat(token0Amount) * leverage}
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

			<BuySellModal
				limit={limit}
				pair={pair}
				token0={token0}
				token1={token1}
				token0Amount={token0Amount}
				token1Amount={token1Amount}
				price={price}
				buy={true}
				loops={nLoops}
				borrowLimit={borrowLimit}
			/>
		</Flex>
	);
}
