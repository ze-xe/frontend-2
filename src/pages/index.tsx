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
import { useContext } from "react";
import { LeverDataContext } from "../context/LeverDataProvider";
import { dollarFormatter } from "../utils/formatters";
import { AiOutlineInfoCircle } from "react-icons/ai";

const featuresTitle = {
	fontSize: "xl",
	fontWeight: "bold",
	mt: 2,
	fontFamily: "Poppins",
};

const featuresText = {
	fontSize: "sm",
	fontFamily: "Poppins",
};

const featuresIcon = {
	size: "25",
};

import { NextSeo } from "next-seo";

const Index = () => {
	const { protocolData } = useContext(LeverDataContext);

	const dividerStyle = {
		borderColor: { xs: "transparent", sm: "transparent", md: "#E50EC0" },
		mx: 4,
		my: 5,
		height: "130px",
		display: { xs: "none", sm: "block" },
		orientation: 'vertical'
	};

	return (
		<>
			<NextSeo
				title="ZEXE: Orderbook DEX on Arbitrum One"
				description="Zexe is an Orderbook DEX (decentralised exchange) with Spot and Derivatives market. It is a fully decentralized orderbook exchange with a focus on low fees and high liquidity."
				canonical="https://www.zexe.io/"
				openGraph={{
					url: "https://www.zexe.io/trade",
					title: "Trade on Zexe",
					description: "Zexe is an Orderbook DEX (decentralised exchange) with Spot and Derivatives market. It is a fully decentralized orderbook exchange with a focus on low fees and high liquidity.",
					images: [
						// {
						// 	url: "https://www.example.ie/og-image-01.jpg",
						// 	width: 800,
						// 	height: 600,
						// 	alt: "Og Image Alt",
						// 	type: "image/jpeg",
						// },
						// { url: "https://www.example.ie/og-image-03.jpg" },
						// { url: "https://www.example.ie/og-image-04.jpg" },
					],
					siteName: "ZEXE",
				}}
				twitter={{
					handle: "@zexeio",
					site: "@zexeio",
					cardType: "summary_large_image",
				}}
			/>
			<Head>
				<title>
					ZEXE | Buy and Sell Crypto with Low Fees and High Liquidity
				</title>
				<link rel="icon" type="image/x-icon" href="/favicon.png"></link>
			</Head>

			<Flex
				flexDir="column"
				bgColor={"#09001F"}
				bgImage="/Rectangle.png"
				bgRepeat={"no-repeat"}
				bgSize={{ xs: "0", sm: "contain", md: "contain" }}
				bgPosition={"center top"}
			>
				<Box
					bgImage="/Rectangle2.png"
					bgRepeat={"no-repeat"}
					bgSize={{ xs: "0", sm: "1000px", md: "contain" }}
					bgPosition={"center bottom"}
				>
					<Box
						maxW={"1200px"}
						ml={"10%"}
					>
						<Box>
							<Text
								fontFamily={"Silkscreen"}
								fontSize={"56.53px"}
								letterSpacing="-10px"
								color={"#F60DC9"}
								mt={10}
							>
								zexe
							</Text>
						</Box>

						<Flex
							flexDir={"column"}
							justify={"center"}
							mt={{xs: '80px', sm: '120px', md: "160px"}}
							mb={"60px"}
							fontFamily={"BG"}
							fontSize={{ xs: "38", sm: "40", md: "64.5" }}
							lineHeight={"121%"}
							mr={"10%"}
						>
							<Text fontWeight="bold">ORDERBOOK DEX</Text>
							<Text
								className={"stroke"}
								color="transparent"
								fontWeight="bold"
							>
								WITH SPOT AND
							</Text>
							<Text fontWeight="bold">DERIVATIVE MARKETS</Text>
						</Flex>

						<Flex wrap={"wrap"} gap={5}>
							<Box w={"200px"} my={5}>
								<BsCurrencyExchange {...featuresIcon} />
								<Text {...featuresTitle}>Spot Trading</Text>
								<Box
									h={"2px"}
									mt={2}
									mb={4}
									w={"100%"}
									bgGradient="linear(to-r, #F60DC9, #1AE5C8)"
								></Box>
								<Text {...featuresText}>
									Market and limit orders with conditional
									execution
								</Text>
							</Box>

							<Divider {...dividerStyle} />

							<Box w={"250px"} my={5}>
								<RiExchangeFundsFill {...featuresIcon} />
								<Text {...featuresTitle}>
									Margin and Futures
								</Text>
								<Box
									h={"2px"}
									mt={2}
									mb={4}
									w={"100%"}
									bgGradient="linear(to-r, #F60DC9, #1AE5C8)"
								></Box>
								<Text {...featuresText}>
									With upto 125x leverage with upto 50+ token
									pairs
								</Text>
							</Box>

							<Divider {...dividerStyle} />

							<Box w={"200px"} my={5}>
								<GiCardExchange {...featuresIcon} />
								<Text {...featuresTitle}>Option Calls</Text>
								<Box
									h={"2px"}
									mt={2}
									mb={4}
									w={"100%"}
									bgGradient="linear(to-r, #F60DC9, #1AE5C8)"
								></Box>
								<Text {...featuresText}>
									CALL and PUT options to achieve risk
									management
								</Text>
							</Box>

							<Divider {...dividerStyle} />

							<Box w={"200px"} my={5}>
								<GiBank {...featuresIcon} />
								<Text {...featuresTitle}>Money Market</Text>
								<Box
									h={"2px"}
									mt={2}
									mb={4}
									w={"100%"}
									bgGradient="linear(to-r, #F60DC9, #1AE5C8)"
								></Box>
								<Text {...featuresText}>
									Lend/Borrow assets with upto 12+% APY
								</Text>
							</Box>
						</Flex>

						<Flex gap={2} mt={"60px"} mb={"20px"} wrap={"wrap"}>
							<Link href={"/trade"}>
								<Button
									size={"lg"}
									bgColor="#E50EC0"
									color="white"
									// color={"black"}
									_hover={{ opacity: "0.5" }}
								>
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

						<Divider mt={{xs: 16, sm: 20, md: 28}} mb={5} />
					</Box>
					<Box
						py={5}
						pb={20}
					>
						<Flex
							flexDir={{ xs: "column", sm: "column", md: "row" }}
							gap={10}
							ml="10%"
							mb={10}
						>
							<Box>
								<Text fontWeight={"bold"} fontFamily="Poppins">
									Margin provided
								</Text>
								<Text
									fontWeight={"bold"}
									fontFamily="Poppins"
									fontSize={"3xl"}
									mt={1}
								>
									{dollarFormatter(null).format(
										protocolData.totalDepositBalanceUSD
									)}
								</Text>
							</Box>

							<Box>
								<Text fontWeight={"bold"} fontFamily="Poppins">
									Leverage used
								</Text>
								<Text
									fontWeight={"bold"}
									fontFamily="Poppins"
									fontSize={"3xl"}
									mt={1}
								>
									{dollarFormatter(null).format(
										protocolData.totalBorrowBalanceUSD
									)}
								</Text>
							</Box>
						</Flex>
						<Flex
							align={"center"}
							gap={1}
							color="gray.400"
							mt={2}
							ml="10%"
						>
							<AiOutlineInfoCircle />
							<Text fontSize={"sm"}>Testnet figures</Text>
						</Flex>
					</Box>
				</Box>
			</Flex>
		</>
	);
};

export default Index;
