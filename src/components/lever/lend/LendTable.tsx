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
} from "@chakra-ui/react";

import Image from "next/image";
import { LeverDataContext } from "../../../context/LeverDataProvider";
import { dollarFormatter, tokenFormatter } from "../../../utils/formatters";
import { BiPlus } from "react-icons/bi";
import { PlusSquareIcon } from "@chakra-ui/icons";
import LendModal from "./LendModal";
import BorrowModal from "./WithdrawModal";
import { DataContext } from "../../../context/DataProvider";
import useEffect from "react";
import { useAccount } from "wagmi";

const imageIds = {
	ETH: "1027",
	BTC: "1",
	USDC: "3408",
	DAI: "4943",
};

export default function LendingTable() {
	const { markets } = React.useContext(LeverDataContext);
	const { tokens } = React.useContext(DataContext);
	const { isConnected } = useAccount()

	const token = (tokenId: string) => {
		return tokens.find(
			(token) => token.id.toLowerCase() === tokenId.toLowerCase()
		);
	};

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
										Supply APR (%)
									</Th>
									<Th borderColor={"primary"}>Balance</Th>
									<Th borderColor={"primary"}>
										Total Deposits
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

											<Td
												borderColor={"whiteAlpha.200"}
												isNumeric
											>
												<Flex
													gap={2}
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
