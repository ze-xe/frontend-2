import {
	Link as ChakraLink,
	Text,
	Code,
	List,
	ListIcon,
	Image,
	ListItem,
	Flex,
	Button,
	Box,
	Divider,
} from "@chakra-ui/react";

import { Footer } from "../components/landing/Footer";
import { useColorMode } from "@chakra-ui/react";
import Link from "next/link";
import Head from "next/head";
import {
	BsCurrencyExchange,
	BsDiscord,
	BsGithub,
	BsTwitter,
} from "react-icons/bs";
import { RiExchangeFundsFill } from "react-icons/ri";
import { GiBank, GiCardExchange } from "react-icons/gi";
import { useContext } from 'react';
import { LeverDataContext } from "../context/LeverDataProvider";
import { dollarFormatter } from '../utils/formatters';

const featuresTitle = {
	fontSize: "xl",
	fontWeight: "bold",
	mt: 2,
};

const featuresText = {
	fontSize: "sm",
};

const featuresIcon = {
	size: "25",
};

const Index = () => {
	const {protocolData} = useContext(LeverDataContext)
	return (
		<>
			<Head>
				<title>ZEXE | Buy & Sell Crypto on TRON</title>
				<link rel="icon" type="image/x-icon" href="/favicon.png"></link>
			</Head>

			<Flex
				flexDir="column"
				bgColor={"#09001F"}
				height="100vh"
				// justify={'center'}
				pt={"7%"}
				// bgImage="/round.png"
				// bgRepeat={"no-repeat"}
				// bgPosition={{ sm: "70vw 40vh", md: "70vw -160px" }}
				// bgSize={{ xs: '0', sm: "600px", md: "contain" }}
			>
				<Box maxW={"1200px"} ml={"10%"} pb={{xs: '200', sm: '200', md: '0'}}>
					<Box
						style={{
							backgroundColor: "#F60DC9",
							// backgroundImage:
							// 	'linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, #F60DC9 75%, #F60DC9), linear-gradient(45deg, #F60DC9 25%, transparent 25%, transparent 75%, black 75%, #F60DC9), linear-gradient(to bottom, rgb(8, 8, 8), #F60DC9)',
							// backgroundSize: '10px 10px, 10px 10px, 10px 5px',
							// backgroundPosition: '0px 0px, 5px 5px, 0px 0px',
						}}
						bgClip="text"
					>
						<Text
							fontFamily={"Zen Dots"}
							fontSize={{ xs:'50px', sm: "100px", md: "140px" }}
							// fontWeight='bold'
							mb={0}
						>
							zexe
						</Text>
					</Box>

					<Flex flexDir={"column"} justify={"center"} mb={20} mr={10}>
						<Text fontSize={"xl"} fontWeight='bold'>
							Orderbook DEX with onchain spot and derivatives
							market
						</Text>
						{/* <Text
							fontSize={'lg'}
							>
							Transparent. Secure. Better
						</Text> */}
					</Flex>

					<Flex wrap={"wrap"}>
						<Box w={"200px"} my={5}>
							<BsCurrencyExchange {...featuresIcon} />
							<Text {...featuresTitle}>Spot Trading</Text>
							<Text {...featuresText}>
								Market and limit orders with conditional execution
							</Text>
						</Box>

						<Divider
							orientation="vertical"
							borderColor={"#fff"}
							mx={4}
							my={5}
							height='100px'
						/>

						<Box w={"200px"} my={5}>
							<RiExchangeFundsFill {...featuresIcon} />
							<Text {...featuresTitle}>Margin and Futures</Text>
							<Text {...featuresText}>
								With upto 25x leverage with upto 50+ token pairs
							</Text>
						</Box>

						<Divider
							orientation="vertical"
							borderColor={"#fff"}
							mx={4}
							my={5}
							height='100px'
						/>

						<Box w={"200px"} my={5}>
							<GiCardExchange {...featuresIcon} />
							<Text {...featuresTitle}>Option Calls</Text>
							<Text {...featuresText}>
							CALL and PUT options to achieve risk management
							</Text>
						</Box>

						<Divider
							orientation="vertical"
							borderColor={"#fff"}
							mx={4}
							my={5}
							height='100px'
						/>

						<Box w={"200px"} my={5}>
							<GiBank {...featuresIcon} />
							<Text {...featuresTitle}>Money Markets</Text>
							<Text {...featuresText}>
								Lend/Borrow assets with upto 32% APY
							</Text>
						</Box>
					</Flex>

					<Flex gap={2} mt={20} >
						<Link href={"/trade"}>
							<Button size={"lg"} bgColor="white" color={"black"} _hover={{bgColor: 'gray'}}>
								Trade Now
							</Button>
						</Link>
						<Link
							href={
								"https://drive.google.com/file/d/1Jkc0QIvCIiMqdFbl0g39NF5bQIF0cnmZ/view?usp=sharing"
							}
							target="_blank"
						>
							<Button size={"lg"} variant={"outline"}>
								Learn More
							</Button>
						</Link>
					</Flex>

					<Flex flexDir={{sm: 'column', md: 'row'}} gap={10} mt={20}>
						<Box>
							<Text color={'gray'}>Margin provided</Text>
							<Text fontSize={'2xl'} mt={2} fontWeight='bold'>{dollarFormatter(null).format(protocolData.totalDepositBalanceUSD)}</Text>
						</Box>

						<Box>
							<Text color={'gray'}>Leverage used</Text>
							<Text fontSize={'2xl'} mt={2} fontWeight='bold'>{dollarFormatter(null).format(protocolData.totalBorrowBalanceUSD)}</Text>
						</Box>
					</Flex>

					
				</Box>

				{/* <Image src="/assets/cyborg.png" height={400} width={700}  alt="none" /> */}
				{/* <Button display={"flex"} gap="1" variant={'outline'} disabled><Text>Try Now</Text> <Text fontSize={"10px"}>Coming Soon</Text> </Button> */}
				<Footer />
			</Flex>
		</>
	);
};

export default Index;
