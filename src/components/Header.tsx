import {
	Flex,
	Heading,
	Box,
	Text,
	Button,
	useDisclosure,
	Tooltip,
	Divider,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';

// import ConnectButton from './ConnectButton';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { DataContext } from '../context/DataProvider';

import {
	IconButton,
	Stack,
	Collapse,
	Icon,
	Popover,
	PopoverTrigger,
	PopoverContent,
	useColorModeValue,
	useBreakpointValue,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useAccount, useConnect, chain, Chain, useNetwork } from 'wagmi';
import { ChainID, chainIndex, chains, supportedChains } from '../utils/chains';
import { LeverDataContext } from '../context/LeverDataProvider';
import Image from 'next/image';

export const Header = () => {
	const router = useRouter();
	const { isOpen, onToggle } = useDisclosure();

	const { isFetchingData, isDataReady, fetchData, setChain } = useContext(DataContext);
	const [init, setInit] = useState(false);
	const { fetchData: fetchLeverData } = useContext(LeverDataContext);
	const {chain} = useNetwork();

	const {address, isConnected, isConnecting, connector: activeConnector} = useAccount({
		onConnect({ address, connector, isReconnected }) {
			console.log('Connected', address, connector.chains[0], supportedChains);
			console.log(chain);
			if (!chain.unsupported){
				fetchData(address, connector.chains[0].id);
				fetchLeverData(address, connector.chains[0].id);
				setChain(connector.chains[0].id);
			} else {
				fetchData(null, ChainID.ARB_GOERLI);
				fetchLeverData(null, ChainID.ARB_GOERLI);
			}
		},
		onDisconnect() {
			console.log('Disconnected');
			fetchData(null, ChainID.ARB_GOERLI);
			fetchLeverData(null, ChainID.ARB_GOERLI);
		}
	});

	// const {connectAsync: connectEvm, connectors} = useConnect();

	useEffect(() => {
		localStorage.setItem('chakra-ui-color-mode', 'dark');
		if(activeConnector) window.ethereum.on('accountsChanged', function (accounts: any[]) {
			// Time to reload your interface with accounts[0]!
			fetchData(accounts[0], activeConnector?.chains[0].id);
			fetchLeverData(accounts[0], activeConnector?.chains[0].id);
			setChain(activeConnector?.chains[0].id);
		})
		if (localStorage.getItem('chakra-ui-color-mode') === 'light') {
			localStorage.setItem('chakra-ui-color-mode', 'dark');
		}

		if(!isConnected && !isConnecting) {
			fetchData(null, ChainID.ARB_GOERLI);
			fetchLeverData(null, ChainID.ARB_GOERLI);
		}
	}, [isConnected, isConnecting]);
	
	if (router.pathname === '/') {
		return <></>;
	}
	return (
		<>
			<Flex
				justifyContent="space-between"
				align="center" 
				bgColor={'background2'}
				
				pl={6}
				pr={2}>
				<Flex
					flex={{ base: 1, md: 'auto' }}
					ml={{ base: -2 }}
					display={{ base: 'flex', md: 'none' }}>
					<IconButton
						onClick={onToggle}
						icon={
							isOpen ? (
								<CloseIcon w={3} h={3} />
							) : (
								<HamburgerIcon w={5} h={5} />
							)
						}
						variant={'ghost'}
						aria-label={'Toggle Navigation'}
					/>
				</Flex>
				<Flex
					flex={{ base: 1 }}
					justify={{ base: 'center', md: 'start' }}
					align="center"
					
					>
					<Link href={'/'}>
						<Box py={2}>
						<Image src='/zexe.png' width={'25'} height={'25'} alt={''}/>
						</Box>
					</Link>

					<Flex display={{ base: 'none', md: 'flex' }} ml={6}>
						<DesktopNav />
					</Flex>
				</Flex>

				<Stack
					flex={{ base: 1, md: 1 }}
					justify={'flex-end'}
					align="center"
					direction={'row'}>
					<Flex
						display={{ sm: 'none', md: 'flex' }}
						align="center"
						justify={'flex-end'}
						gap={4} 
						>
						{isConnected && <MenuOption href='/portfolio' title='Portfolio'/>}
						<Box>
						<ConnectButton chainStatus={'icon'} showBalance={false}/>
						</Box>
					</Flex>
				</Stack>
			</Flex>
			<Collapse in={isOpen} animateOpacity>
				<MobileNav isConnected={isConnected} />
			</Collapse>
		</>
	);
};

const MenuOption = ({ href, title, disabled = false, size = 'sm' }) => {
	const route = useRouter();
	
	return (
		<Box height={'100%'} _hover={{bg: 'whiteAlpha.50'}} px={4} mx={-2} py={2} rounded='2'>
			<Link href={href}>
				<Tooltip
					isDisabled={!disabled}
					hasArrow
					label="Coming Soon"
					bg="white"
					color={'gray.800'}>
					<Button
						variant={'unstyled'}
						disabled={disabled}
						color={route.pathname.includes(href) ? 'primary' : 'gray.200'}
						// textDecoration={route.pathname.includes(href) ? 'underline' : 'none'}
						// fontWeight={route.pathname.includes(href) ? 'bold' : 'medium'}
						textUnderlineOffset="4px"
						size={size}
						fontSize="sm"
						fontFamily={'Poppins'}
						>
						{title}
					</Button>
				</Tooltip>
			</Link>
		</Box>
	);
};

const DesktopNav = () => {
	return (
		<Stack direction={'row'} align="center">
			{/* <Divider orientation='vertical'/> */}
			<MenuOption href={'/trade'} title={'Spot'} />
			{/* <Divider orientation='vertical'/> */}
			{/* <MenuOption href={'/lend'} title={'Money Market'} /> */}
			{/* <Divider orientation='vertical'/> */}
			<MenuOption href={'/margin'} title={'Margin'} />
			{/* <MenuOption href={'/'} title={'Options'} disabled={true} /> */}
		</Stack>
	);
};

const MobileNav = ({isConnected}) => {
	return (
		<Stack
			bg='background1'
			p={4}
			display={{ md: 'none' }}>
			<MenuOption href={'/trade'} title={'Spot'} />
			{/* <MenuOption href={'/lend'} title={'Money Market'} /> */}
			<MenuOption href={'/margin'} title={'Margin'}  />
			{/* <MenuOption href={'/'} title={'Options'} disabled={true} /> */}
			{/* {isConnected && <MenuOption href={'/faucet'} title={'💰 Faucet'} />} */}
			{isConnected && <MenuOption href={'/portfolio'} title={'Portfolio'} />}
			<Box width={'100%'}>
				<ConnectButton />
			</Box>
		</Stack>
	);
};

Header.defaultProps = {
	title: 'zexe',
};
