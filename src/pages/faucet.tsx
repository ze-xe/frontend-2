import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Flex,
	Heading,
	HStack,
	InputLeftElement,
	Text,
	useRadio,
	useRadioGroup,
} from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import { useContext } from 'react';
import { DataContext } from '../context/DataProvider';
import { getABI, getContract, send } from '../utils/contract';

const mintAmount = {
	USDT: 10000,
	USDD: 10000,
	BTC: 1,
	ETH: 10,
	WTRX: 100000,
	BTT: 10000000,
	AURORA: 1000,
	NEAR: 100,
	USDC: 10000,
	ZEXE: 1000000
};

const Big = require('big.js');

import { Input, InputGroup } from '@chakra-ui/react';
import axios from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { ChainID } from '../utils/chains';

function RadioCard(props) {
	const { getInputProps, getCheckboxProps } = useRadio(props);

	const input = getInputProps();
	const checkbox = getCheckboxProps();

	return (
		<>
			<Head>
				<title>Testnet Faucet | ZEXE | Buy & Sell Crypto on TRON</title>
				<link rel="icon" type="image/x-icon" href="/favicon.png"></link>
			</Head>
			<Box as="label">
				<input {...input} />
				<Box
					{...checkbox}
					// bgColor={props.isChecked ? '#E11860' : 'transparent'}
					cursor="pointer"
					borderWidth="1px"
					// borderRadius="md"
					boxShadow="md"
					_checked={{
						bg: 'white',
						color: 'black',
						borderColor: 'gray.600',
					}}
					_focus={{
						boxShadow: 'outline',
					}}
					px={5}
					py={3}>
					{props.children}
				</Box>
			</Box>
		</>
	);
}

export default function faucets() {
	const { tokens, chain, explorer } = useContext(DataContext);
	const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
	const [hydrated, setHydrated] = React.useState(false);

	const [selectedToken, setSelectedToken] = React.useState(0);

	// loading
	const [loading, setLoading] = React.useState(false);
	const [response, setResponse] = React.useState(null);
	const [hash, setHash] = React.useState(null);
	const [confirmed, setConfirmed] = React.useState(false);

	const { getRootProps, getRadioProps } = useRadioGroup({
		// name: tokens[selectedToken].name,
		// defaultValue: tokens[selectedToken].name,
		onChange: (nextValue) => {
			setSelectedToken(Number(nextValue));
		},
	});

	const group = getRootProps();

	const mint = async () => {
		setLoading(true);
		setResponse(null);
		setConfirmed(false);
		setHash(null);

		const token = tokens[selectedToken];
		// mint tokens
		const tokenContract = await getContract('ERC20', chain, token.id);
		send(
			tokenContract,
			'mint',
			[
				evmAddress,
				Big(mintAmount[token.symbol]).times(1e18).toFixed(0),
			],
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

	React.useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return <></>;
	return (
		<Flex justify={'center'}>
			<Box
				my={2}
				px={4}
				py={4}
				bgColor="background2"
				// width={'70%'}
				// maxW="1400px"
			>
				<Text fontSize={'3xl'} fontWeight="bold">
					Faucet
				</Text>
				<Text fontSize={'sm'} mb={4} color="gray.400">
					Testnet tokens
				</Text>

				<Text fontSize={'lg'} fontWeight="bold" mb={2}>
					Choose an asset
				</Text>
				<HStack {...group}>
					{tokens.map((token, index) => {
						console.log(token);
						const radio = getRadioProps({ value: index });
						return (
							<RadioCard
								key={index}
								{...radio}
								minW="150px"
								isChecked={selectedToken == index}>
								<Box
									key={token.id}
									minW={'150px'}
									minH={'160px'}>
									<Image
										src={
											`/assets/crypto_logos/` +
											token.symbol.toLowerCase() +
											'.png'
										}
										width={40}
										height={40}
										alt={token.symbol}
										style={{
											maxHeight: 40,
											borderRadius: '50%',
										}}></Image>
									<Text fontSize={'xl'} mt={2}>
										{token.name}
									</Text>
									<Text>{token.symbol}</Text>

									<Text fontSize={'sm'} my={2} mt={4}>
										Balance{' '}
										{token.balance / 10 ** token.decimals}
									</Text>
								</Box>
							</RadioCard>
						);
					})}
				</HStack>
				<Box>
					<Box my={2}>
						<InputGroup size="lg" width={'100%'}>
							<InputLeftElement
								pointerEvents="none"
								children={
									<Image
										src={
											`/assets/crypto_logos/` +
											tokens[
												selectedToken
											]?.symbol.toLowerCase() +
											'.png'
										}
										width={30}
										height={30}
										alt={tokens[selectedToken]?.symbol}
										style={{
											maxHeight: 30,
											borderRadius: '50%',
										}}></Image>
								}
							/>
							<Input
								disabled
								// borderRadius={'8px 0 0 8px'}
								pr="4.5rem"
								type={'Amount'}
								placeholder="Enter Amount"
								// disabled={needsApproval()}
								value={
									mintAmount[tokens[selectedToken]?.symbol] +
									' ' +
									tokens[selectedToken]?.symbol
								}
							/>
						</InputGroup>
					</Box>

					<Box>
						<Button
							width={'100%'}
							mt={6}
							onClick={() => mint()}
							loadingText="Confirm in your wallet"
							bgGradient={'linear(to-r, #E11860, #CB1DC3)'}
							size="lg"
							isLoading={loading}
							disabled={!isEvmConnected || loading}>
							{isEvmConnected
								? 'Mint'
								: 'Connect Wallet'}
						</Button>
						{response && (
							<Box width={'100%'} my={2}>
								<Alert
									status={
										response.includes('confirm')
											? 'info'
											: confirmed &&
											  response.includes('Success')
											? 'success'
											: 'error'
									}
									variant="subtle">
									<AlertIcon />
									<Box>
										<Text fontSize="md" mb={0}>
											{response}
										</Text>
										{hash && <Link
											href={explorer() + hash}
											target="_blank">
											{' '}
											<Text fontSize={'sm'}>
												View on explorer
											</Text>
										</Link>}
									</Box>
								</Alert>
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		</Flex>
	);
}
