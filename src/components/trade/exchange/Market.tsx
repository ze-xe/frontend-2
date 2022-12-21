import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import React from 'react';

import SellModule from './Sell';
import BuyModule from './Buy';

const MarketOrder = ({ pair }) => {
	return (
		<Flex gap={5}>
			<BuyModule pair={pair} limit={false}/>
			<SellModule pair={pair} limit={false} />
		</Flex>
	);
};

export default MarketOrder;
