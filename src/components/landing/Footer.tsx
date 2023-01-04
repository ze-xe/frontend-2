import { Box, Divider, Flex, FlexProps } from "@chakra-ui/react";
import {
	Link as ChakraLink,
	Text,
	Code,
	List,
	ListIcon,
	Image,
	ListItem,
	Button,
} from "@chakra-ui/react";
import { CheckCircleIcon, LinkIcon } from "@chakra-ui/icons";
import { BsDiscord, BsGithub, BsTwitter } from "react-icons/bs";
import { useContext } from "react";
import { DataContext } from "../../context/DataProvider";

export const Footer = () => {
	const { block } = useContext(DataContext);

	return (
		<Box position={"fixed"} bottom="0" width={"100%"}>
			<Divider bgColor={"whiteAlpha.200"} />
			<Flex bgColor={"background2"}>
				<Flex gap={5} justify="left" minH={8} align="center" ml={"10%"}>
					<Image src="/BuildOnArbitrum.png" width={"150px"} my={5} />
					<Divider mx={5} orientation="vertical" />

					<Text fontSize="sm" color={"gray.400"}>
						Join the revolution
					</Text>
					<Flex
						gap={5}
						my={5}
						mx={5}
						flexDir={{ xs: "column", sm: "column", md: "row" }}
					>
						<ChakraLink
							isExternal
							href="https://github.com/ze-xe"
							fontWeight="bold"
						>
							<BsGithub size={"30px"} />
						</ChakraLink>

						<ChakraLink
							isExternal
							href="https://twitter.com/zexeio"
							fontWeight="bold"
						>
							<BsTwitter size={"30px"} />
						</ChakraLink>

						<ChakraLink
							isExternal
							fontWeight="bold"
							href="https://discord.gg/MdngKExqjv"
						>
							<BsDiscord size={"30px"} />
						</ChakraLink>
					</Flex>
				</Flex>
			</Flex>
		</Box>
	);
};
