import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import PlacedOrders from "./PlacedOrders";
import ExecutedOrders from "./ExecutedOrders";
import { useAccount } from "wagmi";

export default function UserOrders({ pair }) {
	return (
		<>
			<Tabs colorScheme={"gray"} size="sm">
				<TabList>
					<Tab>Active Orders</Tab>
					<Tab>Order History</Tab>
				</TabList>

				<TabPanels>
					<TabPanel mx={-4}>
						<PlacedOrders pair={pair} />
					</TabPanel>
					<TabPanel mx={-4}>
						<ExecutedOrders pair={pair} />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</>
	);
}
