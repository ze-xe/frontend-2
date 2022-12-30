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

const Index = () => {
	const { protocolData } = useContext(LeverDataContext);

	const dividerStyle = {
		borderColor: "#E50EC0",
		mx: 4,
		my: 5,
		height: "130px",
		display: { xs: 'none', sm: 'block'}
	};

	return (
		<>
			<Head>
				<title>ZEXE | Buy & Sell Crypto</title>
				<link rel="icon" type="image/x-icon" href="/favicon.png"></link>
			</Head>

			<Flex
				flexDir="column"
				bgColor={"#09001F"}
				bgImage="/Rectangle.png"
				bgRepeat={"no-repeat"}
				bgSize={{ xs: "0", sm: "600px", md: "contain" }}
			>
				<Box
					bgImage="/Rectangle2.png"
					bgRepeat={"no-repeat"}
					bgSize={{ xs: "0", sm: "600px", md: "contain" }}
					pt={"3%"}
					bgPosition={{ sm: "70vw 40vh", md: "0 50vh" }}
					height={"100vh"}
				>
					<Box
						maxW={"1200px"}
						ml={"10%"}
						pb={{ xs: "200", sm: "200", md: "0" }}
					>
						<Box >
							<Text
								fontFamily={"Silkscreen"}
								fontSize={"56.53px"}
								letterSpacing="-10px"
								color={'#F60DC9'}
								mb={0}
							>
								zexe
							</Text>
						</Box>

						<Flex
							flexDir={"column"}
							justify={"center"}
							mt={'120px'}
							mb={'60px'}
							fontFamily={"BG"}
							fontSize={{xs: '38', sm: '40', md: "67.5"}}
							lineHeight={"121%"}
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

							<Divider {...dividerStyle} orientation='vertical'/>

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

							<Divider {...dividerStyle} orientation='vertical'/>

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

							<Divider {...dividerStyle} orientation='vertical'/>

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

						<Flex gap={2} mt={'60px'} mb={'20px'} wrap={'wrap'}>
							<Link href={"/trade"}>
								<Button
									size={"lg"}
									bgColor="#E50EC0"
									color='white'
									// color={"black"}
									_hover={{ opacity: "0.5" }}
									disabled={true}
								>
									Trade Now <sup><Text fontSize={'xs'}>Coming soon</Text></sup>
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

						<Divider mt={20} mb={5}/>

					</Box >
						<Box py={5} 
						// bgColor="rgba(26, 229, 200, 0.2)"
						>
							<Flex
								flexDir={{ sm: "column", md: "row" }}
								gap={10}
								ml='10%'
							>
								<Box>
									<Text
										fontWeight={"bold"}
										fontFamily="Poppins"
									>
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
									<Text
										fontWeight={"bold"}
										fontFamily="Poppins"
									>
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
								ml='10%'
							>
								<AiOutlineInfoCircle />
								<Text fontSize={"sm"}>Testnet figures</Text>
							</Flex>
						</Box>

					{/* <Image src="/assets/cyborg.png" height={400} width={700}  alt="none" /> */}
					{/* <Button display={"flex"} gap="1" variant={'outline'} disabled><Text>Try Now</Text> <Text fontSize={"10px"}>Coming Soon</Text> </Button> */}
					{/* <Footer /> */}
				</Box>
			</Flex>
		</>
	);
};

export default Index;
