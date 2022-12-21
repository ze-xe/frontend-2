import React from "react";
import {
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Box,
	Flex,
	Text,
} from "@chakra-ui/react";
import OrderBook from "./OrderBook";
import OrderHistory from "./OrderHistory";

export default function OrdersPanel({ pair }) {
	return (
		<>
			<Box
				display={{ sm: "block", md: "block", lg: "block", xl: "none" }}
				bgColor={"background2"}
				width={{ sm: "100%", md: "100%", lg: "100%", xl: "0" }}
				height={{ sm: "100%", md: "100%", lg: "100%", xl: "0" }}
			>
				<Tabs
					align="start"
					variant="line"
					size={"sm"}
					colorScheme="gray"
					overflow={"auto"}
				>
					<TabList>
						<Tab>Order Book</Tab>
						<Tab>Order History</Tab>
					</TabList>
					<TabPanels>
						<TabPanel px={0}>
							<OrderBook pair={pair} />
						</TabPanel>
						<TabPanel px={0}>
							<OrderHistory pair={pair} />
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
			<Box
				display={{ sm: "none", md: "none", lg: "none", xl: "flex" }}
				width={"100%"}
				gap={1}
				height={"100%"}
			>
				<Box width={"50%"} bgColor={"background2"}>
					<OrderBook pair={pair} />
				</Box>
				<Box width={"50%"} bgColor={"background2"}>
					<OrderHistory pair={pair} />
				</Box>
			</Box>
		</>
	);
}
