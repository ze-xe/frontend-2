import { Box, Divider, Flex, Input, Tag, Text } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useContext } from 'react';
import { DataContext } from '../../../context/DataProvider';
import { tokenFormatter } from '../../../utils/formatters';

export default function AllTokens({search, margin = false}) {
	const { pairs, pairStats } = useContext(DataContext);

	const filteredPairs = pairs.filter((pair) => {
		return ( 
			margin ? pair?.marginEnabeled : true &&
			(
				pair?.tokens[0].symbol.toLowerCase().includes(search.toLowerCase()) || 
				pair?.tokens[1].symbol.toLowerCase().includes(search.toLowerCase()) || 
				pair?.tokens[0].name.toLowerCase().includes(search.toLowerCase()) || 
				pair?.tokens[1].name.toLowerCase().includes(search.toLowerCase())
			)
		);
	})

	return (
		<Flex flexDir={'column'} gap={0} mt={-2}>
			{filteredPairs.map((pair, index) => (
				<Link
					key={index}
					href={
						(margin ? '/margin/' : '/trade/') +
						pair.tokens[0].symbol +
						'_' +
						pair.tokens[1].symbol
					}>
					<Flex
						align={'center'}
						justify="space-between"
						px={4}
						py={4}
						_hover={{ bgColor: 'whiteAlpha.100' }}>
						<Flex align="center">
							<Image
								src={
									`/assets/crypto_logos/` +
									pair.tokens[0].symbol.toLowerCase() +
									'.png'
								}
								width={30}
								height={30}
								alt="eth"
								style={{ maxHeight: 30, maxWidth: 30, borderRadius: "50%" }}></Image>
							<Box ml={2}>
								<Text>{pair.tokens[0].name} {(margin && pair?.marginEnabeled) && <Tag size={'sm'}>3x</Tag>} </Text>
								<Text fontSize={'xs'} color='gray.400'>
									{pair.tokens[0].symbol}/
									{pair.tokens[1].symbol}
								</Text>
							</Box>
						</Flex>
						<Box textAlign={'right'} color={Number(pairStats[pair?.id]?.[0].changeInER) >= 0 ? 'green2' : 'red2'}>
							<Text fontWeight={'bold'} color='gray.200'>
								{tokenFormatter(pair.exchangeRateDecimals).format(pair.exchangeRate /
									10 ** 18)}
							</Text>
							<Text fontSize={'xs'} fontWeight='bold'>{tokenFormatter(2).format(pairStats[pair.id]?.[0].changeInER ?? 0)}%</Text>
						</Box>
					</Flex>
				</Link>
			))}
		</Flex>
	);
}
