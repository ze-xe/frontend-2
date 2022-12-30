import { Box, Flex, Tooltip } from "@chakra-ui/react";
import React from "react";

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

import SellModule from "./Sell";
import BuyModule from "./Buy";

const Exchange = ({ pair }) => {
	const [hydrated, setHydrated] = React.useState(false);
	React.useEffect(() => {
		setHydrated(true);
	}, []);
	if (!hydrated) return <></>;
	return (
		<Box bgColor={"background2"}>
			<Tabs
				variant="line"
				size={"sm"}
				colorScheme="gray"
				overflow={"auto"}
				pt={0}
			>
				<TabList>
					<Tab>Limit</Tab>
					{/* <Tab>Market</Tab> */}
					<Tooltip
						size={"sm"}
						hasArrow
						label="Coming Soon"
						bg="white"
						color={"gray.800"}
					>
						<Tab isDisabled>Market</Tab>
					</Tooltip>
					<Tooltip
						size={"sm"}
						hasArrow
						label="Coming Soon"
						bg="white"
						color={"gray.800"}
					>
						<Tab isDisabled>Stop</Tab>
					</Tooltip>
				</TabList>
				<TabPanels>
					<TabPanel>
						<Flex gap={5}>
							<BuyModule pair={pair} limit={true} />
							<SellModule pair={pair} limit={true} />
						</Flex>
					</TabPanel>
					{/* <TabPanel>
						<Flex gap={5}>
							<BuyModule pair={pair} limit={false} />
							<SellModule pair={pair} limit={false} />
						</Flex>
					</TabPanel> */}
				</TabPanels>
			</Tabs>
		</Box>
	);
};

export default Exchange;
