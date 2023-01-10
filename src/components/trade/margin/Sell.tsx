import {
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	Box,
	Divider,
	Slider,
	SliderFilledTrack,
	SliderTrack,
	SliderThumb,
	Button,
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
import { isValidNS, isValidAndPositiveNS } from "../../../utils/number";

const Big = require("big.js");
const MIN_TOKEN1 = 10;
const MAX_BORROW_LIMIT = 0.75;

export default function BuyModule({ pair, limit }) {
	const [pairNow, setPairNow] = React.useState(null);
	const [token0Amount, setToken0Amount] = React.useState("0");
	const [token1Amount, setToken1Amount] = React.useState("0");
	const [leverage, setLeverage] = React.useState(3);
	const [borrowLimit, setBorrowLimit] = React.useState(0);
	const [nLoops, setNLoops] = React.useState(0);
	const [liquidationPrice, setLiquidationPrice] = React.useState(0);

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
		// if there is change in pair
		if (pair && pairNow !== pair?.id) {
			const _token0 = tokens.find((t) => t.id === pair?.tokens[0].id);
			const _token1 = tokens.find((t) => t.id === pair?.tokens[1].id);
			setToken0(_token0);
			setToken1(_token1);
			const newExchangeRate = pair?.exchangeRate / 10 ** 18;
			setPrice(newExchangeRate.toFixed(pair?.exchangeRateDecimals));
			setToken1Amount(
				Big(token0Amount)
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
					.div(10 ** token1?.decimals);
				setToken0Amount(
					token0Amount.toNumber().toFixed(pair.exchangeRateDecimals)
				);
				setToken1Amount(
					token0Amount
						.times(_price)
						.toNumber()
						.toFixed(pair.exchangeRateDecimals)
				);
			}
		}

		if (
			isValidNS(token1Amount) &&
			isValidNS(leverage) &&
			parseFloat(token1Amount) > MIN_TOKEN1
		) {
			const _borrowLimit =
				(MIN_TOKEN1 / parseFloat(token1Amount) - 1) / leverage + 1;
			if (!isValidAndPositiveNS(_borrowLimit)) return;
			setBorrowLimit(_borrowLimit);
			if (isValidAndPositiveNS(token1Amount)) {
				const _nLoops = Math.floor(
					Math.log(MIN_TOKEN1 / parseFloat(token1Amount)) /
						Math.log(_borrowLimit)
				);
				if (!isValidAndPositiveNS(_nLoops)) return;
				setNLoops(_nLoops);
				if (isValidAndPositiveNS(price)) {
					const _token0Amount = (
						(parseFloat(token1Amount) *
							_borrowLimit *
							(1 - _borrowLimit ** _nLoops)) /
						(price * (1 - _borrowLimit))
					).toString();
					setToken0Amount(_token0Amount);
					setLiquidationPrice(
						(leverage *
							parseFloat(token1Amount) *
							MAX_BORROW_LIMIT) /
							Number(_token0Amount)
					);
				}
			}
		}
	});

	const updateToken0Amount = (e: string) => {
		setToken0Amount(e);
		if (isValidNS(e)) {
			if (Number(price) > 0) {
				setToken1Amount(Big(Number(e)).times(price).div(leverage).toString());
			} else {
				setToken1Amount("0");
			}
		}
	};

	const updateToken1Amount = (e) => {
		setToken1Amount(e);
		if (isValidNS(e)) {
			if (Number(price)) {
				setToken0Amount(Big(Number(e)).div(price).times(leverage).toString());
			} else {
				setToken0Amount("0");
			}
		}
	};

	const onPriceChange = (e) => {
		setPrice(e);
		if (isValidNS(e)) {
			if (Number(e) > 0) {
				setToken1Amount(Big(Number(token0Amount)).times(e).toString());
			} else {
				setToken1Amount("0");
			}
		}
	};

	const buttonStyle = {
		h: "42px",
		variant: "solid",
		border: "1px",
		borderColor: "gray.700",
	};

	const _setLeverage = (e: string) => {
		if (isValidAndPositiveNS(e)) {
			setLeverage(Number(e));
			setToken0Amount(Number(e) * Number(token0Amount) / leverage)
		}
	};

	const max = () =>
		((token1?.balance ?? 0) - (token1?.inOrderBalance ?? 0)) /
		10 ** token1?.decimals;

	return (
		<Flex flexDir={"column"} gap={4} width={"50%"}>
			<Flex flexDir={"column"} gap={1}>
				<Text fontSize={"sm"}>Price ({pair?.tokens[1].symbol})</Text>
				<NumberInput
					isDisabled={!limit}
					min={pair?.minToken0Order/(10**token0?.decimals) ?? 0}
					precision={pair?.exchangeRateDecimals}
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

			<Flex flexDir={"column"} gap={1}>
				<Flex justify={"space-between"}>
					<Text fontSize={"sm"}>Total ({token1?.symbol})</Text>
					<Text fontSize={"xs"}>
						Balance {tokenFormatter(null).format(max())}{" "}
						{token1?.symbol}
					</Text>
				</Flex>

				<NumberInputWithSlider
					max={max()}
					min={MIN_TOKEN1}
					asset={token1}
					onUpdate={updateToken1Amount}
					value={token1Amount}
					color="red2"
				/>
			</Flex>

			<Flex
				align={"center"}
				flexDir='column'
				mb={2}
			>
				<Flex width={'100%'} justify='space-between'>
					<Text fontSize={"sm"}>Leverage</Text>
					<Text fontSize={"xs"}>
						Liq Price:{" "}
						{tokenFormatter(null).format(liquidationPrice)}
					</Text>
				</Flex>
				<Flex
					width={"100%"}
					pt={1}
					justify="space-between"
					align="center"
				>
					<Box >
						<NumberInput
							step={0.1}
							min={1.1}
							max={3}
							variant="filled"
							border={"1px"}
							borderColor={"gray.700"}
							onChange={(e) => _setLeverage(e)}
							value={leverage}
						>
							<NumberInputField rounded={0} />
							<NumberInputStepper>
								<NumberIncrementStepper />
								<NumberDecrementStepper />
							</NumberInputStepper>
						</NumberInput>
					</Box>
						<Button
							{...buttonStyle}
							onClick={(e) => _setLeverage("1.5")}
						>
							1.5
						</Button>
						<Button
							{...buttonStyle}
							onClick={(e) => _setLeverage("2")}
						>
							2
						</Button>
						<Button
							{...buttonStyle}
							onClick={(e) => _setLeverage("2.5")}
						>
							2.5
						</Button>
						<Button
							{...buttonStyle}
							onClick={(e) => _setLeverage("3")}
						>
							Max
						</Button>
				</Flex>
			</Flex>

			{limit && (
				<Flex flexDir={"column"} gap={1}>
					<Text fontSize={"sm"}>Amount ({token0?.symbol})</Text>
					<NumberInput
						min={0}
						precision={pair?.exchangeRateDecimals}
						value={token0Amount}
						onChange={updateToken0Amount}
						variant="filled"
						border={"1px"}
						borderColor={"gray.700"}
						step={0.01}
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
				token0={token0}
				token1={token1}
				token0Amount={token0Amount}
				token1Amount={token1Amount}
				pair={pair}
				price={price}
				buy={false}
				loops={nLoops}
				borrowLimit={borrowLimit}
			/>
		</Flex>
	);
}
