import { Box, Text, IconButton, Flex, Tag } from '@chakra-ui/react';
import React from 'react';
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
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { MdOutlineCancel } from 'react-icons/md';
import CancelOrder from './CancelOrder';
import { useEffect } from 'react';
import { useContext } from 'react';
import { DataContext } from '../../../context/DataProvider';
import UpdateOrder from './UpdateOrder';
import { tokenFormatter } from '../../../utils/formatters';

import {
	Pagination,
	usePagination,
	PaginationNext,
	PaginationPage,
	PaginationPrevious,
	PaginationContainer,
	PaginationPageGroup,
} from "@ajna/pagination";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';

export default function PlacedOrders({ pair }) {
	const { tokens, placedOrders } = useContext(DataContext);
	const [token0, setToken0] = React.useState(null);
	const [token1, setToken1] = React.useState(null);
	const [pairNow, setPairNow] = React.useState(null);

	useEffect(() => {
		if(pair){
		if (pairNow !== pair.id || (!token0)) {
			setToken0(
				tokens.find((token) => token.symbol === pair.tokens[0].symbol)
			);
			setToken1(
				tokens.find((token) => token.symbol === pair.tokens[1].symbol)
			);
			setPairNow(pair.id)
		}
	}
	});

	const { currentPage, setCurrentPage, pagesCount, pages } = usePagination({
		initialState: { currentPage: 1 },
		pagesCount: Math.floor((placedOrders[pair?.id] ? placedOrders[pair?.id].length : 0) / 3),
	});

	return (
		<Box bgColor="background2">
			{placedOrders[pair?.id]?.length > 0 ? 
			<>
			<TableContainer>
				<Table size="sm" borderColor={'gray.800'}>
					<Thead>
						<Tr>
							<Th borderColor='gray.800'>Order</Th>
							<Th borderColor='gray.800'>Amount</Th>
							<Th borderColor='gray.800'>Exchange Rate</Th>
							<Th isNumeric borderColor='gray.800'></Th>
						</Tr>
					</Thead>
					<Tbody>
						{placedOrders[pair?.id]?.slice(currentPage * 3, currentPage * 3 + 3).map(
							(order: any, index: number) => {
								return (
									<Tr>
										<Td
										color={
												!order.value.buy
													? 'red2'
													: 'green2'
											}
											borderColor='gray.900'
											>
											<Tag
													size={"sm"}
													bgColor={
														order.value.buy
															? "green.700"
															: "red.700"
													}
													variant="solid"
													rounded={2}
												>
													{order.value.buy ?
													"BUY"
													: "SELL"}
												</Tag>
										</Td>
										<Td
										borderColor='gray.900'>
											{tokenFormatter(null).format(
												order.value.amount /
													10 ** token0?.decimals
											)}{' '}
											{token0?.symbol}
										</Td>
										<Td
										borderColor='gray.900'>
											{tokenFormatter(pair?.exchangeRateDecimals).format(
												order.value.exchangeRate /
													10 ** 18
											)}{' '}
											{token1?.symbol}/{token0?.symbol}
										</Td>
										<Td isNumeric
										borderColor='gray.900' maxW={'100px'}>
											<Flex justify={'end'}>
												{/* <UpdateOrder
													pair={pair}
													token0={token0}
													token1={token1}
													price={0}
													order={order}
												/> */}
												<CancelOrder
													pair={pair}
													token0={token0}
													token1={token1}
													price={0}
													order={order}
												/>
											</Flex>
										</Td>
									</Tr>
								);
							}
						)}
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
			: <Box mx={4}>
				<Text color={'gray'}>No active orders</Text>
			</Box>
			}
		</Box>
	);
}
