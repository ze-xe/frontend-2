import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import React from "react";

import { LeverDataContext } from "../../../context/LeverDataProvider";
import { dollarFormatter, tokenFormatter } from '../../../utils/formatters';
import {useEffect} from 'react';
import { DataContext } from "../../../context/DataProvider";
import { call, getContract, send } from "../../../utils/contract";
import { useAccount, useNetwork } from 'wagmi';
import { ChainID } from '../../../utils/chains';
import { RiHandCoinFill } from "react-icons/ri";

export default function Rewards() {
	const { markets, availableToBorrow, totalBorrowBalance, totalCollateralBalance, adjustedDebt } = React.useContext(LeverDataContext);
	const { chain } = React.useContext(DataContext);
	const {address, isConnected} = useAccount();
	const [claimLoading, setClaimLoading] = React.useState(false);

	const [zexeAccrued, setZexeAccrued] = React.useState(null);
	const {chain: activeChain} = useNetwork();

	const boxStyle = {
		px: 4,
		py: 10,
		mb: 1,
		bgColor: "background2",
		width: "100%"
	}

	useEffect(() => {
		if(!zexeAccrued && isConnected && !activeChain.unsupported){
			getContract('Lever', chain)
			.then(lever => {
				lever.callStatic.getRewardBalance([address], true, true)
				.then((res: any) => {
					setZexeAccrued(res.toString());
				})
			})
		}
	})

	const claim = () => {
		setClaimLoading(true);
		getContract('Lever', chain)
		.then(lever => {
			send(lever, 'claimComp(address)', [address], chain ?? ChainID.ARB_GOERLI)
			.then((res: any) => {
				setClaimLoading(false);
			})
		})
	}

	return (
		<>
			<Flex flexDir={"column"} fontFamily='Poppins' >
				<Box width={"100%"}>
					<Flex justify="space-between" gap={1}>


						<Box
						    {...boxStyle}
						>
							<Text fontSize={"md"}>Liquidity Incentives</Text>
							<Flex gap={5} align='flex-end'>

							<Text mt={1} fontSize="2xl" fontWeight={"bold"}>
								{zexeAccrued ? tokenFormatter(null).format(
									zexeAccrued / 10 ** 18
									) : '-'} ZEXE
							</Text>
							</Flex>
							<Button mt={2} size={'sm'} onClick={claim} isLoading={claimLoading} loadingText='Claiming'> <RiHandCoinFill/> <Text ml={1}>Claim</Text></Button>
						</Box>

					</Flex>
					<Flex justify="space-between" gap={1}>
						
                    <Box
						    {...boxStyle}
						>
							<Text fontSize={"md"}>Trading Rewards</Text>
							<Flex gap={5} align='flex-end'>

							<Text mt={1} fontSize="2xl" fontWeight={"bold"}>
								{zexeAccrued ? tokenFormatter(null).format(
									0
									) : '-'} ZEXE
							</Text>
							</Flex>
							<Button mt={2} disabled size={'sm'} onClick={claim} isLoading={claimLoading} loadingText='Claiming'> <RiHandCoinFill/> <Text ml={1}>Claim</Text></Button>
						</Box>

					</Flex>
				</Box>
			</Flex>
		</>
	);
}
