import React from 'react';
import {
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Input,
    Box,
    Text
} from '@chakra-ui/react';
import AllTokens from './AllTokens';
import TrendingTokens from './TrendingTokens';
import NewTokens from './NewTokens';
import { Divider } from '@chakra-ui/react';

export default function TokensPanel() {
	const [search, setSearch] = React.useState('');

	return (
		<Box >
            <Box pt={3} px={4}>
                <Text fontSize={'md'} fontWeight='bold'>Markets</Text>
            </Box>
            <Divider my={3}/>
			<Box mt={4} >
			<Input size={'md'} fontSize='sm' placeholder="Search market" mb={0} borderRadius={0} variant={'outlined'} onChange={(e) => setSearch(e.target.value)} bgColor='whiteAlpha.200'></Input>
			</Box>
			<Tabs
                mt={3}
				// variant="enclosed"
				size={'sm'}
				colorScheme="gray"
				overflow={'auto'}>
				<TabList>
					<Tab px={0} width='15%'>All</Tab>
					<Tab px={0} width='30%'>Trending</Tab>
					<Tab px={0} width='20%'>New</Tab>
				</TabList>
				<TabPanels>
					<TabPanel px={0}>
						<AllTokens search={search} />
					</TabPanel>
					<TabPanel>
						<TrendingTokens />
					</TabPanel>
					<TabPanel>
						<NewTokens />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>
	);
}
