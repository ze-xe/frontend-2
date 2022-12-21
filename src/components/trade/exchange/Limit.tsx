import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import React from 'react';

import SellModule from './Sell';
import BuyModule from './Buy';

const LimitOrder = ({ pair }) => {
	return (
		<Flex gap={5}>
			<BuyModule pair={pair} limit={true}/>
			<SellModule pair={pair} limit={true} />
		</Flex>
	);
};

export default LimitOrder;
