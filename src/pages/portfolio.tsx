import React from "react";
import { Avatar, Box, Button, Divider, Flex, Progress, Text } from "@chakra-ui/react";
import Overview from "../components/portfolio/overview";
import Position from "../components/portfolio/position";

import Head from "next/head";
import { useAccount, useBalance, useEnsAvatar } from "wagmi";
import { useEffect } from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { tokenFormatter } from "../utils/formatters";
import { ethers } from 'ethers';

export default function portfolio() {
	const { address: _address } = useAccount();
	const [address, setAddress] = React.useState(null);
	const [balance, setBalance] = React.useState(null);

	const {data} = useBalance({
		address: _address,
	});

	useEffect(() => {
		setAddress(_address);
		if(data) setBalance(parseFloat(ethers.utils.formatEther(data.value)))
	});

	const tabStyle = {
		_hover: {
			bg: "whiteAlpha.50",
		},
		_selected: {
			bg: "whiteAlpha.200",
		},
		py: 2,
		borderColor: "background2",
		minW: "250px"
	}
	
	return (
		<>
			<Head>
				<title>Portfolio | ZEXE | Buy & Sell Crypto on TRON</title>
				<link rel="icon" type="image/x-icon" href="/favicon.png"></link>
			</Head>

			<Box mt={1} fontFamily="Poppins">
				<Tabs orientation="vertical" colorScheme={"purple"} outline='none' >
					<TabList bgColor="background2" borderColor={'black'}>
						<Flex minH={'95vh'} justify={'space-between'} flexDir='column'>
						<Box>
						<Box  py={'60px'} >
							<Flex
								flexDir={"column"}
								justify="center"
								textAlign={"center"}
								align="center"
							>
								<Avatar
									bgGradient={
										"linear(to-r, #E11860, #CB1DC3)"
									}
									icon={<Text fontSize={'5xl'}>🐼</Text>}
									size={"xl"}
								></Avatar>
								<Text ml={4} mt={4} fontSize="xl" fontWeight={"bold"}>
									{address?.slice(0, 6) +
										"..." +
										address?.slice(-4)}
								</Text>
								<Text ml={4} fontSize="sm" color={"gray.400"}>
									{/* {tokenFormatter(null).format(balance / 1e6)}{" "} */}
									{balance && <>{tokenFormatter(null).format(balance)}</>} ETH
								</Text>
							</Flex>
						</Box>
						<Divider borderColor='background1'/>
						<Tab {...tabStyle}>Overview</Tab>
						<Divider borderColor='background1'/>
						<Tab {...tabStyle}>Margin Position</Tab>
						<Divider borderColor='background1'/>
						<Tab {...tabStyle}>Orders</Tab>
						<Divider borderColor='background1'/>
						</Box>

						<Box>
						<Divider borderColor='background1'/>
						<Tab {...tabStyle}>Get Testnet Tokens</Tab>
						<Divider borderColor='background1'/>
						<Tab {...tabStyle}>Sign Out</Tab>
						<Divider borderColor='background1'/>
						</Box>
						</Flex>
					</TabList>

					<TabPanels>
						<TabPanel p={0} px={1}>
							<Overview />
						</TabPanel>
						<TabPanel p={0} px={1}>
							<Position />
						</TabPanel>
						<TabPanel>
							<p>Coming soon...</p>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
		</>
	);
}
