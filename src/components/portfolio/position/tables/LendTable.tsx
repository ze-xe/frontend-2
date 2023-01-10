import React from "react";
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Box,
	Flex,
	Text,
	Button,
	CircularProgress,
	useDisclosure,
	TabPanel,
	TabList,
	Tab,
	Tabs,
	TabPanels,
	Tooltip,
} from "@chakra-ui/react";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";

import Image from "next/image";
import { LeverDataContext } from "../../../../context/LeverDataProvider";
import { dollarFormatter, tokenFormatter } from "../../../../utils/formatters";
import LendModal from "../modals/LendModal";
import WithdrawModal from "../modals/WithdrawModal";
import { DataContext } from "../../../../context/DataProvider";
import { useAccount } from "wagmi";
import { Switch } from "@chakra-ui/react";
import { getContract, send } from "../../../../utils/contract";
import { InfoIcon } from "@chakra-ui/icons";

export default function LendingTable() {
	const { markets, enableCollateral } = React.useContext(LeverDataContext);
	const { tokens, chain } = React.useContext(DataContext);
	const { isConnected } = useAccount();
	const [enabling, setEnabling] = React.useState({});
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [marketOpen, setMarketOpen] = React.useState(0);

	const token = (tokenId: string) => {
		return tokens.find(
			(token) => token.id.toLowerCase() === tokenId.toLowerCase()
		);
	};

	const enable = async (market: any) => {
		setEnabling({ [market.id]: true });
		const _lever = await getContract("Lever", chain);
		send(
			_lever,
			market.isCollateral ? "exitMarket" : "enterMarkets",
			market.isCollateral ? [market.id] : [[market.id]],
			chain
		)
			.then(async (res: any) => {
				await res.wait(1);
				setEnabling({ [market.id]: false });
				enableCollateral(market.id);
			})
			.catch((err: any) => {
				setEnabling({ [market.id]: false });
				console.log(err);
			});
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
									<Th>
										Supply Asset
									</Th>
									<Th>APY (%)</Th>
									<Th>Balance</Th>
									<Th isNumeric maxW='60px'>
										<Flex align={'center'} justify='flex-end'>

										<Text fontSize={"10px"}>
											Enabled
										</Text>
										<Tooltip label="If this asset is enabled as collateral">
										<InfoIcon ml={1}/>
										</Tooltip>
										</Flex>
									</Th>
								</Tr>
							</Thead>
							<Tbody>
								{markets.map((market: any, index: number) => {
									return (
										<Tr h='90px'>
											<Td borderColor={"whiteAlpha.200"} cursor={'pointer'} onClick={(e) => openMarket(index)}>
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

											<Td borderColor={"whiteAlpha.200"} cursor={'pointer'} onClick={(e) => openMarket(index)}>
												<Text>
													{parseFloat(
														market.rates[1].rate
													).toFixed(2)}{" "}
													%
												</Text>
												<Text fontSize={"xs"}>
													+{" "}
													{tokenFormatter(2).format(
														market.rewardsAPR
															? market
																	.rewardsAPR[0]
															: "0"
													)}{" "}
													%
												</Text>
											</Td>

											<Td borderColor={"whiteAlpha.200"} cursor={'pointer'} onClick={(e) => openMarket(index)}>
												<Text>
													{isConnected
														? tokenFormatter(
																null
														  ).format(
																market.collateralBalance /
																	10 **
																		market
																			.inputToken
																			.decimals
														  )
														: "-"}{" "}
													{market.inputToken.symbol}
												</Text>

												<Text fontSize={"xs"} mt={1}>
													{isConnected
														? dollarFormatter(
																null, true
														  ).format(
																(market.collateralBalance *
																	market
																		.inputToken
																		.lastPriceUSD) /
																	10 **
																		market
																			.inputToken
																			.decimals
														  )
														: "-"}
												</Text>
											</Td>

											<Td borderColor={"whiteAlpha.200"} maxW='60px'>
												<Flex gap={2} justify='flex-end'>
													<Switch
														display={
															!enabling[market.id]
																? "block"
																: "none"
														}
														size="md"
														colorScheme={"primary"}
														isChecked={
															market.isCollateral
														}
														onChange={(e) => enable(market)}
													/>
													<CircularProgress
														display={
															enabling[market.id]
																? "block"
																: "none"
														}
														size={"20px"}
														thickness="30px"
														isIndeterminate
														color={"purple"}
													/>
												</Flex>
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
											<LendModal
												market={markets[marketOpen]}
												token={token(markets[marketOpen].inputToken.id)}
											/>
										</TabPanel>
										<TabPanel px={0}>
											<WithdrawModal
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
