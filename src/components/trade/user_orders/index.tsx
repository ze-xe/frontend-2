import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import PlacedOrders from "./PlacedOrders";
import ExecutedOrders from "./ExecutedOrders";

export default function index({ pair }) {
	return (
		<>
			<Tabs colorScheme={"gray"} size="sm">
				<TabList>
					<Tab>Active Orders</Tab>
					<Tab>Order History</Tab>
					{/* <Tab>Cancelled Orders</Tab> */}
				</TabList>

				<TabPanels>
					<TabPanel mx={-4}>
						<PlacedOrders pair={pair} />
					</TabPanel>
					<TabPanel mx={-4}>
						<ExecutedOrders pair={pair} />
					</TabPanel>
					{/* <TabPanel mx={-4}>
						<CancelledOrders pair={pair} />
					</TabPanel> */}
				</TabPanels>
			</Tabs>
		</>
	);
}
