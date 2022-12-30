import { Box, Text, Flex, Divider } from '@chakra-ui/react';
import Image from 'next/image';
import React, { useContext } from 'react';
import { DataContext } from '../../context/DataProvider';
import { dollarFormatter, tokenFormatter } from '../../utils/formatters';

export default function TitlePanel({ pair }) {
	
	const {pairStats} = useContext(DataContext);

	return (
		<Box bgColor={'background2'} px="4" pb={2} pt={3} fontFamily='Poppins'>
			<Flex justify={'space-between'}>
			<Flex align={'center'} gap={2}>
				<Image
					src={
						`/assets/crypto_logos/` +
								pair?.tokens[0].symbol.toLowerCase() +
								'.png'
					}
					width={40}
					height={40}
					alt="eth"
					style={{ maxHeight: 40, borderRadius: '50%' }}></Image>
				<Text fontSize={'3xl'} fontWeight="bold">
					{pair?.tokens[0].symbol}/{pair?.tokens[1].symbol}
				</Text>
				<Box>
					<Text fontSize={'xs'} color="gray.500">
						{pair?.tokens[0].name}
					</Text>
					<Text fontSize={'xs'} color="gray.500" mt={-0.5}>
						{pair?.tokens[1].name}
					</Text>
				</Box>
			</Flex>
			<Box textAlign={'right'} color={pairStats[pair?.id]?.[0].changeInER < 0 ? 'red2' : 'green2'}>
				{/* <Text fontSize={'xs'} textTransform='uppercase'>Price</Text> */}
				<Text fontSize={'3xl'} fontWeight='bold'>{tokenFormatter(pair?.exchangeRateDecimals).format(pair?.exchangeRate / (10**18))} </Text>
				<Text fontSize={'sm'} mt={-1}>{tokenFormatter(null).format(pairStats[pair?.id]?.[0].changeInER)}%</Text>
			</Box>
			</Flex>
			<Divider mt={2} mb={4} />
			<Flex justify={'space-between'} mb={2}>
				<Box>
					<Text
						fontSize={'xs'}
						fontWeight="bold"
						textTransform={'uppercase'}
						color="gray.400">
						Trading Volume
					</Text>
					<Text fontSize={'sm'} fontWeight="bold">
					{dollarFormatter(null).format(pairStats[pair?.id]?.[0].volume * pair?.exchangeRate / (10**18))}
					</Text>
				</Box>
				<Box>
					<Text
						fontSize={'xs'}
						fontWeight="bold"
						textTransform={'uppercase'}
						color="gray.400">
						24h Change
					</Text>
					<Text fontSize={'sm'} fontWeight="bold">
						{tokenFormatter(null).format(pairStats[pair?.id]?.[0].changeInER)} %
					</Text>
				</Box>
				<Box>
					<Text
						fontSize={'xs'}
						fontWeight="bold"
						textTransform={'uppercase'}
						color="gray.400">
						7d Change
					</Text>
					<Text fontSize={'sm'} fontWeight="bold">
					{tokenFormatter(null).format(pairStats[pair?.id]?.[1].changeInER)} %
					</Text>
				</Box>
				<Box>
					<Text
						fontSize={'xs'}
						fontWeight="bold"
						textTransform={'uppercase'}
						color="gray.400">
						30d Change
					</Text>
					<Text fontSize={'sm'} fontWeight="bold">
					{tokenFormatter(null).format(pairStats[pair?.id]?.[2].changeInER)} %
					</Text>
				</Box>
				<Box>
					<Text
						fontSize={'xs'}
						fontWeight="bold"
						textTransform={'uppercase'}
						color="gray.400">
						90d Change
					</Text>
					<Text fontSize={'sm'} fontWeight="bold">
					{tokenFormatter(null).format(pairStats[pair?.id]?.[3].changeInER)} %
					</Text>
				</Box>
				<Box>
					<Text
						fontSize={'xs'}
						fontWeight="bold"
						textTransform={'uppercase'}
						color="gray.400">
						1y Change
					</Text>
					<Text fontSize={'sm'} fontWeight="bold">
					{tokenFormatter(null).format(pairStats[pair?.id]?.[4].changeInER)} %
					</Text>
				</Box>
			</Flex>
		</Box>
	);
}
