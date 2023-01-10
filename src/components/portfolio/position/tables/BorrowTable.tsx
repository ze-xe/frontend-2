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
	TabPanel,
	TabList,
	Tab,
	Tabs,
	TabPanels,
	useDisclosure,
} from "@chakra-ui/react";

import Image from "next/image";
import { LeverDataContext } from "../../../../context/LeverDataProvider";
import { dollarFormatter, tokenFormatter } from '../../../../utils/formatters';

import RepayModal from "../modals/RepayModal";
import BorrowModal from "../modals/BorrowModal";
import { DataContext } from "../../../../context/DataProvider";
import { useAccount } from 'wagmi';


import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";

export default function LendingTable() {
	const { markets } = React.useContext(LeverDataContext);
	const { tokens } = React.useContext(DataContext);
	const { isConnected } = useAccount();
	const [marketOpen, setMarketOpen] = React.useState(0);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const token = (tokenId: string) => {
		return tokens.find(
			(token) => token.id.toLowerCase() === tokenId.toLowerCase()
		);
	};

	const openMarket = (index: number) => {
		setMarketOpen(index);
		onOpen();
	}

	return (
		<>
			{tokens.length > 0 && (
				<Box bgColor={"background2"}>
					<TableContainer>
						<Table variant="simple">
							<Thead>
								<Tr>
									<Th>Borrow Asset</Th>
									<Th>APY (%)</Th>
									<Th>Balance</Th>
									<Th>Liquidity</Th>
								</Tr>
							</Thead>
							<Tbody>
								{markets.map((market, index) => {
									return (
										<Tr cursor={'pointer'} onClick={() => openMarket(index)} h='90px'>
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
															}
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
														market.rates[0].rate
													).toFixed(2)}{" "}
													%
												</Text>
												<Text fontSize={"xs"}>
													+{" "}{tokenFormatter(2).format(market.rewardsAPR ? market.rewardsAPR[0] : '0')}{" "}%
												</Text>
											</Td>
											
											<Td borderColor={"whiteAlpha.200"}>
												<Text>
												{isConnected ? tokenFormatter(null).format(
													market.borrowBalance / 10**market.inputToken.decimals
												): '-'} {market.inputToken.symbol}
												</Text>

												<Text fontSize={'xs'} mt={1}>
												{isConnected ? dollarFormatter(null).format(
													market.borrowBalance / 10**market.inputToken.decimals * market.inputToken.lastPriceUSD
												): '-'}
												</Text>
											</Td>

											<Td borderColor={"whiteAlpha.200"}>
											<Text>
												{tokenFormatter(null, true).format(
													(market.totalDepositBalanceUSD - market.totalBorrowBalanceUSD) / market.inputToken.lastPriceUSD
													)} {market.inputToken.symbol}
													</Text>

												<Text fontSize={'xs'} mt={1}>
												{dollarFormatter(null, true).format(
													market.totalDepositBalanceUSD - market.totalBorrowBalanceUSD
												)}
												</Text>
											</Td>
										</Tr>
									);
								})}
							</Tbody>
						</Table>
					</TableContainer>

					{(markets.length > 0 && tokens.length > 0) && <Modal isOpen={isOpen} onClose={onClose} isCentered>
						<ModalOverlay />
						<ModalContent bgColor={"#1D1334"} borderRadius={0}>
							<ModalHeader>{markets[marketOpen]?.inputToken.name}</ModalHeader>
							<ModalCloseButton />
							<ModalBody mb={2}>
								<Tabs>
									<TabList>
										<Tab>Deposit</Tab>
										<Tab>Withdraw</Tab>
									</TabList>

									<TabPanels>
										<TabPanel px={0}>
											<BorrowModal
												market={markets[marketOpen]}
												token={token(markets[marketOpen].inputToken.id)}
											/>
										</TabPanel>
										<TabPanel px={0}>
											<RepayModal
												market={markets[marketOpen]}
												token={token(markets[marketOpen].inputToken.id)}
											/>
										</TabPanel>
									</TabPanels>
								</Tabs>
							</ModalBody>
						</ModalContent>
					</Modal>}
				</Box>
			)}
		</>
	);
}
