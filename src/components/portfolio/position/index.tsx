import { Box, Button, Flex, Heading, Progress, Text } from "@chakra-ui/react";
import React from "react";
import LendingTable from "./tables/LendTable";
import BorrowTable from "./tables/BorrowTable";

import { LeverDataContext } from "../../../context/LeverDataProvider";
import { dollarFormatter, tokenFormatter } from "../../../utils/formatters";
import { useEffect } from "react";
import { DataContext } from "../../../context/DataProvider";
import { call, getContract, send } from "../../../utils/contract";
import { useAccount, useNetwork } from "wagmi";

export default function position() {
	const {
		markets,
		availableToBorrow,
		totalBorrowBalance,
		totalCollateralBalance,
		adjustedDebt,
	} = React.useContext(LeverDataContext);
	const { chain } = React.useContext(DataContext);
	const { address, isConnected } = useAccount();

	const [zexeAccrued, setZexeAccrued] = React.useState(null);
	const { chain: activeChain } = useNetwork();

	const boxStyle = {
		px: 4,
		py: 10,
		mb: 1,
		// bgColor: "background2",
	};

	useEffect(() => {
		if (!zexeAccrued && isConnected && !activeChain.unsupported) {
			getContract("Lever", chain).then((lever) => {
				lever.callStatic
					.getRewardBalance([address], true, true)
					.then((res: any) => {
						setZexeAccrued(res.toString());
					});
			});
		}
	});

	const yieldAPR = () => {
		if (!markets[0]) return;
		if (!markets[0].rewardsAPR) return;
		let apr = 0;
		let totalCollateral = 0;
		for (let i in markets) {
			let collateral =
				(markets[i].inputToken.lastPriceUSD *
					markets[i].collateralBalance) /
				1e18;
			let borrow =
				(markets[i].inputToken.lastPriceUSD *
					markets[i].borrowBalance) /
				1e18;
			totalCollateral += collateral;
			apr +=
				(parseFloat(markets[i].rates[1].rate) +
					parseFloat(markets[i].rewardsAPR[1])) *
				collateral;
			apr +=
				(parseFloat(markets[i].rewardsAPR[0]) -
					parseFloat(markets[i].rates[0].rate)) *
				borrow;
		}
		return apr / totalCollateral;
	};

	return (
		<>
			<Flex flexDir={"column"} fontFamily="Poppins">
				<Box width={"100%"} pt={10} my={1} bg="background2">
					<Flex justify="space-between" gap={1} align="center">
						<Box textAlign={"right"} w={100 / 3 + "%"}>
							<Text fontSize={"md"}>Margin Balance</Text>
							<Text mt={1} fontSize="2xl" fontWeight={"bold"}>
								{totalCollateralBalance
									? dollarFormatter(null).format(
											parseFloat(totalCollateralBalance)
									  )
									: "-"}
							</Text>
						</Box>

						<Box
							textAlign={"center"}
							border={"2px"}
							shadow="0 0 4px 10px rgba(159, 122, 234, 0.1)"
							borderColor="primary.400"
							borderRadius="1000px"
							width="200px"
							height="200px"
						>
							<Flex
								flexDir={"column"}
								justify="center"
								align={"center"}
								h="100%"
							>
								<Text fontSize={"md"}>Average APR</Text>
								<Text mt={1} fontSize="2xl" fontWeight={"bold"}>
									{yieldAPR()
										? tokenFormatter(null).format(
												yieldAPR()
										  )
										: "-"}{" "}
									%
								</Text>
							</Flex>
						</Box>

						<Box {...boxStyle} w={100 / 3 + "%"}>
							<Text fontSize={"md"}>Borrow Balance</Text>
							<Text mt={1} fontSize="2xl" fontWeight={"bold"}>
								{totalBorrowBalance
									? dollarFormatter(null).format(
											parseFloat(totalBorrowBalance)
									  )
									: "-"}
							</Text>
						</Box>
					</Flex>

					<Box py={2} mx={8} mb={6}>
						<Flex justify={"space-between"} align="flex-end" mb={2}>
							<Box>
								<Text fontSize={"sm"}>Borrow Limit</Text>
								<Text mt={0} fontSize="xl" fontWeight={"bold"}>
									{parseFloat(adjustedDebt) > 0
										? tokenFormatter(null).format(
												(100 *
													parseFloat(adjustedDebt)) /
													parseFloat(
														totalCollateralBalance
													)
										  ) + "%"
										: "-"}
								</Text>
							</Box>
							<Text mt={1} fontSize="sm" color={"gray"}>
								Available To Borrow{" "}
								{dollarFormatter(null).format(
									parseFloat(availableToBorrow)
								)}
							</Text>
						</Flex>

						<Flex>
							<Box
								h={4}
								width={`${
									parseFloat(adjustedDebt) > 0
										? (100 * parseFloat(adjustedDebt)) /
										  parseFloat(totalCollateralBalance)
										: 0
								}%`}
								bg="primary.400"
							></Box>
							
							<Box h={4} width="100%" bg="whiteAlpha.300"></Box>
						</Flex>
					</Box>
				</Box>
				<Flex width={"100%"} gap={1}>
					<Box width={"50%"}>
						<LendingTable />
					</Box>
					<Box width={"50%"}>
						<BorrowTable />
					</Box>
				</Flex>
			</Flex>
		</>
	);
}
