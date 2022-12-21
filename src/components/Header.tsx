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
import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuItemOption,
	MenuGroup,
	MenuOptionGroup,
	MenuDivider,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
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
import { useAccount, useConnect, chain } from 'wagmi';
import { ChainID, chainIndex, chains } from '../utils/chains';
import { LeverDataContext } from '../context/LeverDataProvider';

export const Header = ({ title }: { title: string }) => {
	const router = useRouter();
	const { isOpen, onToggle } = useDisclosure();

	const { isFetchingData, isDataReady, fetchData, setChain } = useContext(DataContext);
	const [init, setInit] = useState(false);
	const { fetchData: fetchLeverData } = useContext(LeverDataContext);

	const {address: evmAddress, isConnected: isEvmConnected, isConnecting: isEvmConnecting} = useAccount({
		onConnect({ address, connector, isReconnected }) {
			console.log('Connected', address)
			fetchData(address, connector.chains[0].id);
			fetchLeverData(address, connector.chains[0].id);
			setChain(connector.chains[0].id);
		}
	});
	// const {connectAsync: connectEvm, connectors} = useConnect();

	useEffect(() => {
		if (localStorage.getItem('chakra-ui-color-mode') === 'light') {
			localStorage.setItem('chakra-ui-color-mode', 'dark');
		}
		// if (typeof window !== 'undefined') {
			// if (!isConnected && !isConnecting && !isEvmConnected && !isEvmConnecting && !init) {
			// 	const _address = localStorage.getItem('address');
			// 	const _chain = localStorage.getItem('chain');
			// 	if(_address && _chain){
			// 		if(parseInt(_chain) == ChainID.NILE){
			// 			connect((_address: string | null, _err: string) => {
			// 				if (!isDataReady && !isFetchingData && _address) {
			// 					fetchData(_address, ChainID.NILE);
			// 					setChain(ChainID.NILE); 
			// 					setInit(true)
			// 				}
			// 			});
			// 		} else {
			// 			connectEvm({chainId: parseInt(_chain), connector: connectors[chainIndex[parseInt(_chain)]]}).then((res) => {
			// 				if (!isDataReady && !isFetchingData && res.account) {
			// 					fetchData(res.account, ChainID.AURORA);
			// 					setChain(ChainID.AURORA);
			// 					localStorage.setItem("address", res.account)
			// 					localStorage.setItem("chain", ChainID.AURORA.toString());
			// 					setInit(true)
			// 				}
			// 			})
			// 			.catch((err: any) => {
			// 				err = JSON.stringify(err);
			// 				if(err.includes('ChainNotConfigured')){
			// 					window.ethereum.request({method: 'wallet_addEthereumChain', params: [{
			// 						chainId: '0x' + ChainID.AURORA.toString(16),
			// 						chainName: 'Aurora Testnet',
			// 						nativeCurrency: {
			// 							name: 'Aurora',
			// 							symbol: 'ETH',
			// 							decimals: 18
			// 						},
			// 						rpcUrls: [chains[chainIndex[ChainID.AURORA]].rpcUrls.default],
			// 						blockExplorerUrls: [chains[chainIndex[ChainID.AURORA]].blockExplorers.default.url]
			// 					}]})
			// 					.then((res) => {
			// 						setInit(false);
			// 					})
			// 				} else if (err.includes("ConnectorNotFoundError")) {
			// 					setConnectionError("Please install Metamask wallet extension.");
			// 				} else {
			// 					setConnectionError(err);
			// 				}
			// 				setInit(true)
			// 				fetchData(null, ChainID.AURORA, false);
			// 			})
			// 		}
			// 	} else if(!init) {
			// 		fetchData(null, ChainID.AURORA, false);
			// 		setInit(true)
			// 	}
			// }
		// }
	});
	if (router.pathname === '/') {
		return <></>;
	}
	return (
		<>
			<Flex
				justifyContent="space-between"
				align="center"
				// bgClip="text"
				bgColor={'background2'}
				// color={"white"}
				py={1}
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
					justify={{ base: 'center', md: 'start' }}>
					<Link href={'/'}>
						<Box>
							<Text fontSize="3xl" color={'primary'} fontFamily='Zen Dots'>
								zexe
							</Text>
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
						// minW={'330px'}
						>
						{/* <WalletMenu /> */}
						{/* <Box>
							<Link href={'/deposit'}>
								<Button variant={'unstyled'} fontSize="sm">
									Deposit
								</Button>
							</Link>
						</Box>
						<Box>
							<Link href={'/withdraw'}>
								<Button variant={'unstyled'} fontSize="sm">
									Withdraw
								</Button>
							</Link>
						</Box> */}
						<Box>
							<Link href={'/portfolio'}>
								<Button variant={'unstyled'} fontSize="sm">
									Portfolio
								</Button>
							</Link>
						</Box>
						{/* <Box>
							<Link href={'/portfolio'}>
								<Button variant={'unstyled'} fontSize="sm" whiteSpace={'nowrap'}>
									My Wallet
								</Button>
							</Link>
						</Box> */}
						<Box>
						<ConnectButton chainStatus={'icon'} showBalance={false}/>
						</Box>
					</Flex>
				</Stack>
			</Flex>
			<Collapse in={isOpen} animateOpacity>
				<MobileNav />
			</Collapse>
		</>
	);
};

const MenuOption = ({ href, title, disabled = false, size = 'sm' }) => {
	return (
		<Box height={'100%'} pt={1} px={2}>
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
						size={size}
						fontSize="sm">
						{title}
					</Button>
				</Tooltip>
			</Link>
		</Box>
	);
};

const WalletMenu = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	return (
		<Menu isOpen={isOpen}>
			<MenuButton
				as={Button}
				variant="ghost"
				fontSize={'sm'}
				p="2"
				_hover={{ bgColor: 'none' }}
				onMouseEnter={onOpen}
				onMouseLeave={onClose}>
				My Wallet {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
			</MenuButton>
			<MenuList
				bgColor={'gray.50'}
				color={'gray.900'}
				onMouseEnter={onOpen}
				onMouseLeave={onClose}>
				<MenuItem as={Link} href="/deposit">
					<div>
						<div>Deposit</div>
						<div style={{ fontSize: '10px' }}>
							Add tokens to your wallet
						</div>
					</div>
				</MenuItem>

				<MenuItem as={Link} href="/withdraw">
					<div>
						<div>Withdraw</div>
						<div style={{ fontSize: '10px' }}>
							Withdraw tokens from your wallet
						</div>
					</div>
				</MenuItem>

				<MenuItem as={Link} href="/portfolio">
					<div>
						<div>Portfolio</div>
						<div style={{ fontSize: '10px' }}>
							View your asset holdings
						</div>
					</div>
				</MenuItem>
			</MenuList>
		</Menu>
	);
};

const DesktopNav = () => {
	const linkColor = useColorModeValue('gray.600', 'gray.200');
	const linkHoverColor = useColorModeValue('gray.800', 'white');
	const popoverContentBgColor = useColorModeValue('white', 'gray.800');

	return (
		<Stack direction={'row'} spacing={2} align="center" mt={1}>
			{/* <Divider orientation='vertical'/> */}
			<MenuOption href={'/trade'} title={'Spot'} />
			{/* <Divider orientation='vertical'/> */}
			<MenuOption href={'/lend'} title={'Money Market'} />
			{/* <Divider orientation='vertical'/> */}
			<MenuOption href={'/margin'} title={'Margin'} disabled={true} />
			{/* <MenuOption href={'/'} title={'Options'} disabled={true} /> */}
		</Stack>
	);
};

const MobileNav = () => {
	return (
		<Stack
			bg={useColorModeValue('white', 'gray.800')}
			p={4}
			display={{ md: 'none' }}>
			<MenuOption href={'/trade'} title={'Spot'} />
			<MenuOption href={'/'} title={'Margin'} disabled={true} />
			<MenuOption href={'/'} title={'Lend'} disabled={true} />
			{/* <MenuOption href={'/'} title={'Options'} disabled={true} /> */}
			<MenuOption href={'/faucet'} title={'💰 Faucet'} />
			<MenuOption href={'/deposit'} title={'Deposit'} />
			<MenuOption href={'/withdraw'} title={'Withdraw'} />
			<MenuOption href={'/portfolio'} title={'Portfolio'} />
			<Box width={'100%'}>
				<ConnectButton />
			</Box>
		</Stack>
	);
};

Header.defaultProps = {
	title: 'zexe',
};
