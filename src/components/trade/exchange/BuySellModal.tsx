import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Flex,
	Skeleton,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import React, { useContext } from "react";
const Big = require("big.js");

import axios from "axios";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";

import { DataContext } from "../../../context/DataProvider";
import { useAccount } from "wagmi";
import { Endpoints } from "../../../utils/const";
import OrdersToExecute from "./OrdersToExecute";

import { Step, Steps, useSteps } from "chakra-ui-steps";
import PlaceOrder from "./PlaceOrder";
import { useEffect } from "react";

export default function BuySellModal({
	pair,
	token1,
	token0,
	token1Amount, // needed for market orders
	token0Amount,
	price, // needed for limit orders
	buy,
	limit,
}) {
	if (token0Amount == "") token0Amount = "0";
	if (token1Amount == "") token1Amount = "0";
	if (price == "") price = "0";

	const { isOpen, onOpen, onClose } = useDisclosure();
	const [orders, setOrders] = React.useState<any[] | null>(null);
	const [orderToPlace, setOrderToPlace] = React.useState(null);

	const { isConnected: isEvmConnected } = useAccount();

	const { chain } = useContext(DataContext);

	const amountExceedsBalance = () => {
		const amount = buy ? token0Amount * price : token0Amount;
		const balance = buy
			? token1?.balance / 10 ** token1?.decimals
			: token0?.balance / 10 ** token0?.decimals;

		if (isNaN(Number(amount))) return false;
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
	});

	const _onOpen = () => {
		onOpen();
		let _amount = Big(token0Amount)
			.times(10 ** token0.decimals)
			.toFixed(0);
		if (buy && !limit) {
			_amount = Big(token1Amount)
				.times(10 ** token1.decimals)
				.toFixed(0);
		}

		axios
			.get(
				Endpoints[chain] +
					`order/${limit ? "limit" : "market"}/matched/` +
					pair.id,
				{
					params: {
						amount: _amount,
						exchangeRate: Big(price)
							.times(10 ** 18)
							.toFixed(0),
						buy,
						chainId: chain,
					},
				}
			)
			.then((resp) => {
				let _orders = resp.data.data;
				console.log(_orders);
				setOrders(_orders);
			});
	};

	const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
		initialStep: 0,
	});

	const _onClose = () => {
		setOrderToPlace(null);
		setOrders(null);
		onClose();
		reset();
	};

	return (
		<>
			<Button
				width={"100%"}
				mt="2"
				bgColor={buy ? "green2" : "red2"}
				onClick={_onOpen}
				disabled={
					!Big(token0Amount).gt(0) ||
					!(isEvmConnected) ||
					amountExceedsBalance() ||
					price == "" ||
					Number(price) <= 0
				}
			>
				{!(isEvmConnected)
					? "Connect Wallet"
					: !Big(token0Amount).gt(0)
					? "Enter Amount"
					: amountExceedsBalance()
					? "Insufficient Trading Balance"
					: buy
					? "Limit Buy"
					: "Limit Sell"}
			</Button>
			<Modal
				isOpen={isOpen}
				onClose={_onClose}
				isCentered
				size={"xl"}
				scrollBehavior="inside"
			>
				<ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
				<ModalOverlay />
				<ModalContent bgColor={"gray.1000"} pb={4}>
					<ModalHeader>
						{orders
							? orders.length > 0 && !(activeStep >= 1)
								? "Execute orders within limit"
								: "Place order"
							: "Review Order"}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex flexDir="column" width="100%">
							{orders ? (
								limit ? (
									orders.length > 0 ? (
										<Steps activeStep={activeStep}>
											<Step label={"Execute"}>
												<Box mt={4}>
													<OrdersToExecute
														limit={limit}
														price={price}
														orders={orders}
														pair={pair}
														amountToFill={
															token0Amount
														}
														close={_onClose}
														nextStep={nextStep}
														buy={buy}
														token0={token0}
														token1={token1}
														setOrderToPlace={
															setOrderToPlace
														}
													/>
												</Box>
											</Step>
											<Step label={"Place"}>
												<Box mt={4}>
													<PlaceOrder
														orderAmount={
															token0Amount
														}
														amountToPlace={
															orderToPlace
														}
														nextStep={_onClose}
														buy={buy}
														token0={token0}
														token1={token1}
														price={price}
													/>
												</Box>
											</Step>
										</Steps>
									) : (
										<PlaceOrder
											orderAmount={token0Amount}
											amountToPlace={orderToPlace}
											nextStep={_onClose}
											buy={buy}
											token0={token0}
											token1={token1}
											price={price}
										/>
									)
								) : (
									<OrdersToExecute
										limit={limit}
										price={price}
										orders={orders}
										pair={pair}
										amountToFill={token0Amount}
										close={_onClose}
										nextStep={nextStep}
										buy={buy}
										token0={token0}
										token1={token1}
										setOrderToPlace={setOrderToPlace}
									/>
								)
							) : (
								<>
									<Skeleton
										height="40px"
										bg="green.500"
										color="white"
										mt={4}
										fadeDuration={1}
									></Skeleton>
									<Skeleton
										height="40px"
										bg="green.500"
										color="white"
										mt={2}
										fadeDuration={1}
									></Skeleton>
									<Skeleton
										height="40px"
										bg="green.500"
										color="white"
										mt={2}
										mb={4}
										fadeDuration={1}
									></Skeleton>
								</>
							)}
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}
