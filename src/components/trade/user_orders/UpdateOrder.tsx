import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Flex,
	IconButton,
	Input,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
const Big = require('big.js');

const MIN_T0_ORDER = '10000000000000000';
import axios from 'axios';
import { getABI, getAddress, getContract, send } from '../../../utils/contract';

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from '@chakra-ui/react';

import { DataContext } from '../../../context/DataProvider';
import Link from 'next/link';
import { AiOutlineLoading } from 'react-icons/ai';
import { CheckIcon } from '@chakra-ui/icons';
import { MdCancel, MdEdit } from 'react-icons/md';
import { useEffect } from 'react';

import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from '@chakra-ui/react';
import { ChainID } from '../../../utils/chains';

export default function UpdateOrder({ pair, token1, token0, price, order }) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [loading, setLoading] = React.useState(false);
	const [response, setResponse] = React.useState(null);
	const [hash, setHash] = React.useState(null);
	const [token0Amount, setToken0Amount] = React.useState('0');
	const [maxAmount, setMaxAmount] = React.useState('0');
	const [confirmed, setConfirmed] = React.useState(false);
	const [orders, setOrders] = React.useState([]);
	const [orderToPlace, setOrderToPlace] = React.useState(0);
	const [expectedOutput, setExpectedOutput] = React.useState(0);
	const [sliderValue, setSliderValue] = React.useState(0);

	const { chain, explorer } = useContext(DataContext);

	useEffect(() => {
		if (token0?.tradingBalance) {
			if (order.orderType == '0') {
				setMaxAmount(
					(token0.tradingBalance / 10 ** token0.decimals).toString()
				);
			} else {
				setMaxAmount(
					(
						token1.tradingBalance /
						(order.exchangeRate / 10 ** pair.exchangeRateDecimals) /
						10 ** token1.decimals
					).toString()
				);
			}
		}
	}, [token0.tradingBalance, token0.decimals, order.orderType, order.exchangeRate, token1.tradingBalance, token1.decimals, pair.exchangeRateDecimals]);

	const amountExceedsBalance = () => {
		if (token0Amount == '0' || token0Amount == '' || !token1.tradingBalance)
			return false;
		if (Number(token0Amount)) return Big(token0Amount).gt(Big(maxAmount));
	};

	const amountExceedsMin = () => {
		if (token0Amount == '0' || token0Amount == '') return false;
		if (Number(token0Amount))
			return Big(token0Amount).lt(
				Big(MIN_T0_ORDER).div(10 ** token0.decimals)
			);
	};

	const changeSliderValue = (value) => {
		setSliderValue(value);
		setToken0Amount(((value / 100) * Number(maxAmount)).toString());
	};

	const update = async () => {
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse('');
		let _amount = Big(token0Amount)
			.times(10 ** token0.decimals)
			.toFixed(0);

		let exchange = await getContract('Exchange', chain);
		send(
			exchange,
			'updateLimitOrder',
			[(chain == ChainID.NILE ? '0x' : '') + order.id, _amount],
			chain
		)
			.then(async (res: any) => {
				setLoading(false);
				setResponse('Transaction sent! Waiting for confirmation...');
				if (chain == ChainID.NILE) {
					setHash(res);
					checkResponse(res);
				} else {
					setHash(res.hash);
					await res.wait(1);
					setConfirmed(true);
					setResponse('Transaction Successful!');
				}
			})
			.catch((err: any) => {
				setLoading(false);
				setConfirmed(true);
				setResponse('Transaction failed. Please try again!');
			});
	};

	// // check response in intervals
	const checkResponse = (tx_id: string) => {
		axios
			.get(
				'https://nile.trongrid.io/wallet/gettransactionbyid?value=' +
					tx_id
			)
			.then((res) => {
				if (!res.data.ret) {
					setTimeout(() => {
						checkResponse(tx_id);
					}, 2000);
				} else {
					setConfirmed(true);
					if (res.data.ret[0].contractRet == 'SUCCESS') {
						setResponse('Transaction Successful!');
					} else {
						setResponse('Transaction Failed. Please try again.');
					}
				}
			});
	};

	const _onOpen = () => {
		onOpen();
	};

	const _onClose = () => {
		setOrderToPlace(0);
		setLoading(false);
		setResponse(null);
		setOrders([]);
		onClose();
	};

	return (
		<>
			<IconButton
				size={'sm'}
				my={-2}
				variant="ghost"
				icon={<MdEdit />}
				onClick={_onOpen}
				aria-label={''}></IconButton>

			<Modal isOpen={isOpen} onClose={_onClose} isCentered size={'xl'}>
				<ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
				<ModalOverlay />
				<ModalContent bgColor={'gray.1000'}>
					<ModalHeader>
						Review {order.orderType == '0' ? 'SELL' : 'BUY'}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text mb={2}>
							Exchange Rate{' '}
							{order.exchangeRate /
								10 ** pair?.exchangeRateDecimals}{' '}
							{token1?.symbol}/{token0?.symbol}
						</Text>
						<Text fontSize={'sm'} mb={1} color="gray">
							Previous Amount
						</Text>
						<Input
							disabled
							value={
								order.amount / 10 ** token0?.decimals +
								' ' +
								token0?.symbol
							}
						/>
						<Text fontSize={'sm'} my={1} color="gray">
							New Amount
						</Text>
						<Input
							placeholder="Enter Amount"
							value={token0Amount}
							onChange={(e) => setToken0Amount(e.target.value)}
						/>
						<Slider
							aria-label="slider-ex-1"
							value={sliderValue}
							onChange={changeSliderValue}>
							<SliderTrack>
								<SliderFilledTrack bgColor={'orange'} />
							</SliderTrack>
							<SliderThumb />
						</Slider>
						<Text mt={4}>
							Estimated Output:{' '}
							{(Number(token0Amount) * order.exchangeRate) /
								10 ** pair.exchangeRateDecimals}{' '}
							{token1?.symbol}
						</Text>
					</ModalBody>

					<ModalFooter>
						<Flex flexDir={'column'} width={'100%'}>
							{response ? (
								<Box mb={2}>
									<Box width={'100%'} mb={2}>
										<Alert
											status={
												response.includes('confirm')
													? 'info'
													: confirmed &&
													  response.includes(
															'Success'
													  )
													? 'success'
													: 'error'
											}
											variant="subtle">
											<AlertIcon />
											<Box>
												<Text fontSize="md" mb={0}>
													{response}
												</Text>
												<Link
													href={
														explorer() +
														hash
													}
													target="_blank">
													{' '}
													<Text fontSize={'sm'}>
														View on explorer
													</Text>
												</Link>
											</Box>
										</Alert>
									</Box>
									<Button onClick={_onClose} width="100%">
										Close
									</Button>
								</Box>
							) : (
								<>
									<Button
										bgColor="orange"
										mr={3}
										width="100%"
										onClick={update}
										loadingText="Sign the transaction in your wallet"
										isLoading={loading}
										disabled={
											amountExceedsBalance() ||
											!Number(token0Amount) ||
											token0Amount == '0' ||
											amountExceedsMin()
										}>
										{amountExceedsMin()
											? 'Amount is too less'
											: amountExceedsBalance()
											? 'Insufficient Balance'
											: token0Amount == '0'
											? 'Enter Amount'
											: 'Confirm Update'}
									</Button>
									<Button onClick={onClose} mt={2}>
										Back
									</Button>{' '}
								</>
							)}
						</Flex>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
