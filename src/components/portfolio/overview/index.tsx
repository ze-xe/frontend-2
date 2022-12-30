import React from "react";
import { useContext } from "react";
import { Avatar, Box, Button, Flex, Progress, Text } from "@chakra-ui/react";

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
} from "@chakra-ui/react";
import { DataContext } from "../../../context/DataProvider";
import Link from "next/link";
import {
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	StatGroup,
} from "@chakra-ui/react";
import Head from "next/head";
import Image from "next/image";
import { useAccount, useEnsAvatar } from "wagmi";
import { useEffect } from "react";
import Big from "big.js";
import { dollarFormatter, tokenFormatter } from "../../../utils/formatters";

export default function Overview() {

	const { tokens } = useContext(DataContext);
	const [totalBalance, setTotalBalance] = React.useState(null);
    

	useEffect(() => {
		if (tokens.length > 0 && !totalBalance) {
			let total = Big(0);
			const _tokens = [...tokens];
			for (let i = 0; i < _tokens.length; i++) {
				if (_tokens[i].balance) {
					let amount = Big(_tokens[i].balance)
						.sub(_tokens[i].inOrderBalance)
						.mul(_tokens[i].price ?? 0)
						.div(10 ** _tokens[i].decimals);
					total = total.add(amount);
				} else {
					return;
				}
			}
			setTotalBalance(total.toString());
		}
	});

	return (
		<>
			<Flex justify={"center"} fontFamily="Poppins">
				<Box width="100%">
					<Flex
						bgColor={"background2"}
						align="start"
						p={4}
						pt={10}
						pb={8}
						justify="space-between"
					>
						
						<Box>
							<Stat textAlign={"left"}>
								<StatLabel>Trading Balance</StatLabel>
								<StatNumber>
									{dollarFormatter(null).format(totalBalance)}
								</StatNumber>
								<StatHelpText></StatHelpText>
							</Stat>
						</Box>

                        <Box>
							<Stat textAlign={"left"}>
								<StatLabel>Margin</StatLabel>
								<StatNumber>
									{dollarFormatter(null).format(totalBalance)}
								</StatNumber>
								<StatHelpText></StatHelpText>
							</Stat>
						</Box>
					</Flex>

					<Box bgColor={"background2"} mt={1}>
						{/* <Text p={5} fontSize='lg' fontWeight={'bold'}>Trading Balance</Text> */}
						<TableContainer>
							<Table variant="simple">
								<Thead>
									<Tr>
										<Th borderColor={"primary"}>Asset</Th>
										{/* <Th borderColor={'primary'}>Trading Balance</Th> */}
										<Th borderColor={"primary"}>Balance</Th>
										<Th borderColor={"primary"}></Th>
										<Th
											borderColor={"primary"}
											isNumeric
										></Th>
									</Tr>
								</Thead>
								<Tbody>
									{tokens.map((token, index) => {
										return (
											<Tr key={index}>
												<Td
													borderColor={
														"whiteAlpha.200"
													}
												>
													<Flex
														gap="8px"
														align="center"
													>
														<Image
															alt="al"
															src={
																`/assets/crypto_logos/` +
																token.symbol.toLowerCase() +
																".png"
															}
															width={30}
															height={30}
															style={{
																borderRadius:
																	"50%",
															}}
														/>
														<Text>
															{token.name}
														</Text>
													</Flex>
												</Td>

												<Td
													borderColor={
														"whiteAlpha.200"
													}
												>
													<Box>
														<Text>
															{tokenFormatter(
																null
															).format(
																token.balance /
																	10 **
																		token.decimals
															)}{" "}
															{token.symbol}
														</Text>
														<Text
															fontSize={"sm"}
															color="gray"
														>
															{dollarFormatter(
																null
															).format(
																(token.balance *
																	token.price) /
																	10 **
																		token.decimals
															)}
														</Text>
													</Box>
												</Td>
												<Td
													borderColor={
														"whiteAlpha.200"
													}
												>
													{token.price && (
														<Progress
															value={
																(100 *
																	token.balance *
																	token.price) /
																10 **
																	token.decimals /
																totalBalance
															}
															height="1"
															width={40}
															colorScheme="gray"
															rounded={10}
														/>
													)}
												</Td>
												<Td
													borderColor={
														"whiteAlpha.200"
													}
													textAlign={"right"}
													isNumeric
												>
													<Link href={"/trade"}>
														<Button
															size={"sm"}
															variant="outline"
														>
															Trade
														</Button>
													</Link>
													<Link href={"/lend"}>
														<Button
															size={"sm"}
															variant="outline"
														>
															Lend/Borrow
														</Button>
													</Link>
													<Link href={"/faucet"}>
														<Button
															size={"sm"}
															variant="outline"
														>
															Faucet
														</Button>
													</Link>
												</Td>
											</Tr>
										);
									})}
								</Tbody>
							</Table>
						</TableContainer>
					</Box>
				</Box>
			</Flex>
		</>
	);
}
