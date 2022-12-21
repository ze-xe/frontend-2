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
import { ChainID } from '../../../utils/chains';

import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
  } from '@chakra-ui/react'

export default function CancelOrder({
	pair,
	token1,
	token0,
	price,
    order
}) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [loading, setLoading] = React.useState(false);
	const [response, setResponse] = React.useState(null);
	const [hash, setHash] = React.useState(null);
	const [confirmed, setConfirmed] = React.useState(false);
	const { chain, explorer } = useContext(DataContext);

	const update = async () => {
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse('');

		let exchange = await getContract('Exchange', chain);
		send(
			exchange,
			'cancelOrder',
			[
				order.signature,
                order.value,
			],
			chain
		)
		.then(async (res: any) => {
			setLoading(false);
			setResponse('Transaction sent! Waiting for confirmation...');
			setHash(res.hash);
			await res.wait(1);
			setConfirmed(true);
			setResponse('Transaction Successful!');
		})
		.catch((err: any) => {
			setLoading(false);
			setConfirmed(true);
			setResponse('Transaction failed. Please try again!');
		});
	};


	const _onOpen = () => {
		onOpen();
	};

	const _onClose = () => {
		setLoading(false);
		setResponse(null);
		onClose();
	};

	return (
		<>
			<Button
                size={'sm'}
                my={-2}
				variant='ghost'
                onClick={_onOpen}
                aria-label={''}>
			<MdCancel /> <Text ml={2}>Cancel</Text>
			</Button>
            
			<Modal isOpen={isOpen} onClose={_onClose} isCentered size={'xl'}>
				<ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
				<ModalOverlay />
				<ModalContent bgColor={'gray.1000'}>
					<ModalHeader>Review</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
                        <Text mb={4}>You are about to cancel the following order:</Text>

                        <Text>Order Amount</Text>
                        <Text mb={2}>{order.value.amount/(10**token0?.decimals)} {token0?.symbol}</Text>
                        <Text>Exchange Rate</Text>
                        <Text mb={2}>{order.value.exchangeRate/(10**18)} {token1?.symbol}/{token0?.symbol}</Text>
                        <Text>Order Type</Text>
                        <Text mb={2}>{order.value.buy ? 'Buy' : 'Sell'}</Text>
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
										bgColor="orange.700"
										_hover={{ bgColor: 'orange.600' }}
										mr={3}
										width="100%"
										onClick={update}
										loadingText="Sign the transaction in your wallet"
										isLoading={loading}>
										Confirm Cancel
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
