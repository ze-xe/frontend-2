import { Box, Text, IconButton, Flex } from "@chakra-ui/react";
import React, { useState } from "react";
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
import { EditIcon } from "@chakra-ui/icons";
import { MdOutlineCancel } from "react-icons/md";
import CancelOrder from "./CancelOrder";
import { useEffect } from "react";
import { useContext } from "react";
import { DataContext } from "../../../context/DataProvider";
import UpdateOrder from "./UpdateOrder";
import { tokenFormatter } from "../../../utils/formatters";

import {
	Tag,
	TagLabel,
	TagLeftIcon,
	TagRightIcon,
	TagCloseButton,
} from "@chakra-ui/react";

import {
	Pagination,
	usePagination,
	PaginationNext,
	PaginationPage,
	PaginationPrevious,
	PaginationContainer,
	PaginationPageGroup,
} from "@ajna/pagination";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

export default function ExecutedOrders({ pair }) {
	const { orderHistory, cancelledOrders } = useContext(DataContext);

	const getOrders = () => {
		let orders = [];
		let _orderHistory = orderHistory[pair?.id];
		for (let i in _orderHistory) {
			_orderHistory[i].cancelled = false;
			orders.push(_orderHistory[i]);
		}
		for (let i in cancelledOrders[pair?.id]) {
			cancelledOrders[pair?.id][i].cancelled = true;
			cancelledOrders[pair?.id][i].fillAmount =
				cancelledOrders[pair?.id][i].balanceAmount;
			orders.push(cancelledOrders[pair?.id][i]);
		}
		return orders;
	};

	const { currentPage, setCurrentPage, pagesCount, pages } = usePagination({
		initialState: { currentPage: 1 },
		pagesCount: Math.ceil(getOrders().length / 3),
	});
	
	return (
		<Box bgColor="background2">
			{getOrders().length > 0 ? (
				<>
					<TableContainer>
						<Table size="sm" borderColor={"gray.800"}>
							<Thead>
								<Tr>
									<Th borderColor="gray.800">Order</Th>
									<Th borderColor="gray.800">Amount</Th>
									<Th borderColor="gray.800">
										Exchange Rate
									</Th>
									<Th borderColor="gray.800" isNumeric></Th>
								</Tr>
							</Thead>

							<Tbody>
								{getOrders()
									.slice((currentPage - 1) * 3, (currentPage - 1) * 3 + 3)
									.map((order: any, index: number) => {
										return (
											<Tr key={index}>
												<Td borderColor="gray.900">
													<Text
														fontSize={"xs"}
														fontWeight="bold"
													>
														<Tag
														size={"sm"}
														bgColor={
															order
															.orderType == 0
															? "green.700"
															: order
																	.orderType ==
															  1
															? "red.700"
															: order
																	.orderType ==
															  2
															? "green.700"
															: "red.700"
														}
														variant="solid"
														rounded={2}
													>
														{order
															.orderType == 0
															? "BUY"
															: order
																	.orderType ==
															  1
															? "SELL"
															: order
																	.orderType ==
															  2
															? "LONG"
															: "SHORT"}
													</Tag>
													</Text>
												</Td>
												<Td borderColor="gray.900">
													{tokenFormatter(
														null
													).format(
														order.fillAmount /
															10 **
																pair.tokens[0]
																	?.decimals
													)}{" "}
													{pair.tokens[0]?.symbol}
												</Td>
												<Td borderColor="gray.900">
													{tokenFormatter(
														null
													).format(
														order.exchangeRate /
															10 ** 18
													)}{" "}
													{pair.tokens[1]?.symbol}/
													{pair.tokens[0]?.symbol}
												</Td>
												<Td
													borderColor="gray.900"
													isNumeric
													maxW={"100px"}
												>
													{order.cancelled ? (
														<Tag
															size={"sm"}
															rounded={1}
														>
															Cancelled
														</Tag>
													) : (
														<Tag
															size={"sm"}
															rounded={2}
														>
															Executed
														</Tag>
													)}
												</Td>
											</Tr>
										);
									})}
							</Tbody>
						</Table>
					</TableContainer>
					<Pagination
						pagesCount={pagesCount}
						currentPage={currentPage}
						onPageChange={setCurrentPage}
					>
						<PaginationContainer justify={"space-between"} mt={2}>
							<PaginationPrevious
								fontSize={"sm"}
								height={"35px"}
								bgColor="background1"
								color={"gray.400"}
								_hover={{ bgColor: "whiteAlpha.200" }}
								minW="100px"
							>
								<AiOutlineArrowLeft />{" "}
								<Text ml={2}>Previous</Text>
							</PaginationPrevious>
							<PaginationPageGroup>
								{pages.map((page: number) => (
									<PaginationPage
										height={"35px"}
										bgColor="background1"
										color={"gray.400"}
										_hover={{ bgColor: "whiteAlpha.200" }}
										minW="40px"
										key={`pagination_page_${page}`}
										page={page}
									/>
								))}
							</PaginationPageGroup>
							<PaginationNext
								fontSize={"sm"}
								height={"35px"}
								bgColor="background1"
								color={"gray.400"}
								_hover={{ bgColor: "whiteAlpha.200" }}
								minW="100px"
							>
								<Text mr={2}>Next</Text> <AiOutlineArrowRight />
							</PaginationNext>
						</PaginationContainer>
					</Pagination>
				</>
			) : (
				<Box mx={4}>
					<Text color={"gray"}>No orders history found</Text>
				</Box>
			)}
		</Box>
	);
}
