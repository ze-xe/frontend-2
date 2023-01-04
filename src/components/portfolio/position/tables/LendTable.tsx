import React from "react";
import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
	Box,
	Flex,
	Text,
	Button,
	CircularProgress,
} from "@chakra-ui/react";

import Image from "next/image";
import { LeverDataContext } from "../../../../context/LeverDataProvider";
import { dollarFormatter, tokenFormatter } from "../../../../utils/formatters";
import LendModal from "../modals/LendModal";
import BorrowModal from "../modals/WithdrawModal";
import { DataContext } from "../../../../context/DataProvider";
import { useAccount } from "wagmi";
import { Switch } from '@chakra-ui/react'
import { getContract, send } from "../../../../utils/contract";

export default function LendingTable() {
	const { markets, enableCollateral } = React.useContext(LeverDataContext);
	const { tokens, chain } = React.useContext(DataContext);
	const { isConnected } = useAccount()
	const [enabling, setEnabling] = React.useState({});

	const token = (tokenId: string) => {
		return tokens.find(
			(token) => token.id.toLowerCase() === tokenId.toLowerCase()
		);
	};

	const enable = async (market: any) => {
		setEnabling({[market.id] : true});
		const _lever = await getContract("Lever", chain);
		console.log(_lever, market);
		send(_lever, market.isCollateral ? "exitMarket" : "enterMarkets", market.isCollateral ? [market.id] : [[market.id]], chain)
		.then(async (res: any) => {
			await res.wait(1);
			setEnabling({[market.id] : false});
			enableCollateral(market.id);
		})
		.catch((err: any) => {
			setEnabling({[market.id] : false});
			console.log(err);
		});
	}

	return (
		<>
			{tokens.length > 0 && (
				<Box bgColor={"background2"} p={2}>
					<TableContainer>
						<Table variant="simple">
							<Thead>
								<Tr>
									<Th borderColor={"primary"}>
										Supply Asset
									</Th>
									<Th borderColor={"primary"}>
										APY (%)
									</Th>
									<Th borderColor={"primary"}>Balance</Th>
									<Th borderColor={"primary"}>
										Total Deposits
									</Th>
									<Th borderColor={"primary"}>
										<Text fontSize={'10px'}>Enabled as</Text>
										<Text fontSize={'10px'} mt={-1}>collateral</Text>
									</Th>

									<Th borderColor={"primary"} isNumeric></Th>
								</Tr>
							</Thead>
							<Tbody>
								{markets.map((market) => {
									return (
										<Tr>
											<Td borderColor={"whiteAlpha.200"}>
												<Flex gap={2} align="center">
													<Image
														src={`/assets/crypto_logos/${market.inputToken.symbol.toLowerCase()}.png`}
														alt={""}
														width={30}
														height={30}
														style={{
															maxWidth: "30px",
															maxHeight: "30px",
															borderRadius: "50%",
														}}
													/>
													<Box>
														<Text>
															{" "}
															{
																market
																	.inputToken
																	.name
															}{" "}
															(
															{
																market
																	.inputToken
																	.symbol
															}
															){" "}
														</Text>
														<Text fontSize={"xs"}>
															{" "}
															{dollarFormatter(
																null
															).format(
																market
																	.inputToken
																	.lastPriceUSD
															)}{" "}
														</Text>
													</Box>
												</Flex>
											</Td>

											<Td borderColor={"whiteAlpha.200"}>
												<Text>
													{parseFloat(
														market.rates[1].rate
													).toFixed(2)}{" "}
													%
												</Text>
												<Text fontSize={"xs"}>
													+{" "}
													{tokenFormatter(2).format(market.rewardsAPR ? market.rewardsAPR[0] : '0')}{" "}
													%
												</Text>
											</Td>

											<Td borderColor={"whiteAlpha.200"}>
												<Text>
													{isConnected ? tokenFormatter(
														null
													).format(
														market.collateralBalance / 10 ** market.inputToken.decimals
													) : '-'}{" "}
													{market.inputToken.symbol}
												</Text>

												<Text fontSize={"xs"} mt={1}>
													{isConnected ? dollarFormatter(
														null
													).format(
														market.collateralBalance *
															market.inputToken
																.lastPriceUSD / 10 ** market.inputToken.decimals
													) : '-'}
												</Text>
											</Td>

											<Td borderColor={"whiteAlpha.200"}>
												{dollarFormatter(null).format(
													market.totalDepositBalanceUSD
												)}
											</Td>

											<Td borderColor={"whiteAlpha.200"}>
												<Flex gap={2}>
													<Switch display={!enabling[market.id] ? 'block' : 'none'} size='md' colorScheme={'purple'} isChecked={market.isCollateral} onChange={() => enable(market)} />
													<CircularProgress display={enabling[market.id] ? 'block' : 'none'} size={'20px'} thickness='30px' isIndeterminate color='primary' />
												</Flex>
											</Td>

											<Td
												borderColor={"whiteAlpha.200"}
												isNumeric
											>
												<Flex
													gap={0}
													justify="flex-end"
												>
													<LendModal
														market={market}
														token={token(
															market.inputToken.id
														)}
													/>
													<BorrowModal
														market={market}
														token={token(
															market.inputToken.id
														)}
													/>
												</Flex>
											</Td>
										</Tr>
									);
								})}
							</Tbody>
						</Table>
					</TableContainer>
				</Box>
			)}
		</>
	);
}
