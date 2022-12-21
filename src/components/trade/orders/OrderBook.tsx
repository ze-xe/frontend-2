import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { Box, Flex, Spacer, Text, Divider } from '@chakra-ui/react';
import React from 'react';
import { useContext } from 'react';
import { DataContext } from '../../../context/DataProvider';
import {useEffect, useState} from 'react';
import { tokenFormatter } from '../../../utils/formatters';
import { AppDataContext } from '../../../context/AppData';

const Order = ({ order, index, total, pair, orderType }) => {
	const {setExchangeRate} = useContext(AppDataContext);
	return (
		<Box onClick={() => setExchangeRate(order.exchangeRate/(10**18))} _hover={{ cursor: 'pointer' }}
		// bgGradient={'linear(to-r,' + (orderType == 'BUY' ? 'rgba(24, 176, 95, 100%), rgba(24, 176, 95, 100%))' : 'rgba(200, 50, 50, 100%), rgba(200, 50, 50, 100%))')}
		// bgSize={'1%'}
		// bgRepeat='no-repeat'
		>
			<Flex
				key={index}
				justify="space-between"
				color={orderType == 'BUY' ? 'green2' : 'red2'}
				py={'3px'}
				px={4}
				mb={0.5}
				_hover={{ bgColor: orderType == 'BUY' ? 'rgba(24, 176, 95, 10%)' : 'rgba(200, 50, 50, 10%)' }}
				bgGradient={'linear(to-r,' + (orderType == 'BUY' ? 'rgba(24, 176, 95, 20%), rgba(24, 176, 95, 20%))' : 'rgba(200, 50, 50, 20%), rgba(200, 50, 50, 20%))')}
				bgSize={700*order.amount/total + '%'}
				bgRepeat='no-repeat'
				>
				<Text fontSize={'xs'}>
					{tokenFormatter(null).format(order.amount/(10**pair?.tokens[0].decimals))}
				</Text>
				<Text fontSize={'xs'}>
					{tokenFormatter(null).format((order.amount/(10**(pair?.tokens[0].decimals)))*(order.exchangeRate/(10**18)))}
				</Text>
				<Text fontSize="xs" fontWeight={'bold'}>
					{tokenFormatter(pair?.exchangeRateDecimals).format(order.exchangeRate/(10**18))} 
				</Text>
			</Flex>
			</Box>

	);
};

export default function OrderBook({ pair }) {
	const {orders} = useContext(DataContext);
	const [buyOrders, setBuyOrders] = useState([]);
	const [sellOrders, setSellOrders] = useState([]);
	const [totalBuy, setTotalBuy] = useState(0);
	const [totalSell, setTotalSell] = useState(0);


	useEffect(() => {
		if(orders[pair?.id]){
			setBuyOrders(orders[pair.id].buyOrders);
			setSellOrders(orders[pair.id].sellOrders);
			// calculate total buy
			setTotalBuy(orders[pair.id].buyOrders.reduce((acc: any, order: any) => acc + parseFloat(order.amount), 0));
			// calculate total sell
			setTotalSell(orders[pair.id].sellOrders.reduce((acc: any, order: any) => acc + parseFloat(order.amount), 0));
		}
	})

	return (
		<Flex flexDir={'column'}>
			<Flex justify={'space-between'} px={2} py={2} mb={1} mt={{sm: -2, md: -2, lg: -2, xl: 0}} gap={2}>
				<Text fontSize={'xs'} fontWeight='bold' color={'gray.300'}>{pair?.tokens[0].symbol} </Text>
				<Text fontSize={'xs'} fontWeight='bold' color={'gray.300'}>{pair?.tokens[1].symbol}</Text>
				<Text fontSize={'xs'} fontWeight='bold' color={'gray.300'}>{pair?.tokens[1].symbol}/{pair?.tokens[0].symbol}</Text>
			</Flex>
			{[...sellOrders].slice(0, 22).reverse().map((order: any, index: number) => {
				return (
					<Box key={index}>
					<Order
						order={order}
						index={index}
						total={totalSell}
						pair={pair}
						key={index}
						orderType={'SELL'}
					/>
					</Box>
				);
			})}
			<Divider bgColor="transparent" />
			<Flex py={2} align="end" gap={2} color={pair?.priceDiff < 0 ? 'red2' : 'green2'} justify="end">
				<Flex textAlign={'right'} mb={1.5} mr={-1}>
				
				{pair?.priceDiff < 0 ? <ArrowDownIcon width={3}/> : <ArrowUpIcon width={3}/>}
				<Text fontSize={'xs'} mt={-0.5}>{pair?.priceDiff/ (10**18)}</Text>

				</Flex>
				<Text
					fontSize={'2xl'}
					fontWeight="bold"
					textAlign={'right'}
					mr={4}>
					{tokenFormatter(pair?.exchangeRateDecimals).format(pair?.exchangeRate / (10**18))}
				</Text>
			</Flex>
			<Divider bgColor="transparent" />
			{buyOrders.slice(0, 22).map((order: any, index: number) => {
				return (
					<Box key={index}>

					<Order
						order={order}
						index={index}
						total={totalBuy}
						pair={pair}
						key={index}
						orderType={'BUY'}
					/>
					</Box>
				);
			})}
		</Flex>
	);
}
