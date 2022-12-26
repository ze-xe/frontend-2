import { ChainID } from './chains';
export const DUMMY_ADDRESS = 'TU6nPbkDzMfhtg13nUnTMbuVFFMpLSs3P3';
export const HELPER = '';
export const EXCHANGE = '';
export const VAULT = '';
export const SYSTEM = '';

export const ADDRESSES = {
	[ChainID.NILE]: {
		System: 'TS4vQFq4uWtJi8MNW5fbPzGQNiJmoUB5iX',
		Helper: 'TSXXTkC6MsihVqqSnh7KQbgvwgqyPPq7Qt',
		Exchange: 'TQ32dozWeUuXYN8amYJhSGqJJpSU8oR6YV',
		Vault: 'TRDs6u17ACqoQXi1BTxWTWGBnZwDB7x4nN',
	},
    [ChainID.AURORA]: {
		System: '0x9F749C59D0332eC4F865360d0a6fF6Cdcf83Bd12',
		Helper: '0x13ace582a4B80913db1fe81135EA04983068267B',
		Exchange: '0x047d17892cd3D3226C455B12E5edef7d75b3E50D',
		Vault: '0x4811419e3c5e1d91Ac83427562a455C22B5eA95F',
	},
	[ChainID.ARB_GOERLI]: {
		Exchange: '0x9509abD256C8c05756a2f88142b89B6247b47C6f',
		Multicall: '0x511f64296fa72526231E5A55615d8e4eE5a2d4cF',
		Lever: '0xc683afe8F98b53e98C85A7BFd9ab8AAfcBF4f723'
	}
};

export const Endpoints = {
	[ChainID.NILE]: 'https://api.zexe.io/',
	[ChainID.AURORA]: 'https://aurora.api.zexe.io/',
	[ChainID.ARB_GOERLI]: 'https://api.zexe.io/',
};

// list of tokens
export const coingeckoIds = {
	'BTC': 'bitcoin',
	'ETH': 'ethereum',
	'USDT': 'tether',
	'USDD': 'usdd',
	'WTRX': 'tron',
	'BTT': 'bittorrent',
	'NEAR': 'near',
	'AURORA': 'aurora-near',
	'USDC': 'usd-coin',
};

export const dummyPrices = {
	'BTC': '18000',
	'ETH': '1200',
	'USDT': '1',
	'USDD': '1',
	'WTRX': '0.006',
	'BTT': '0.0000008',
	'NEAR': '3.2',
	'AURORA': '0.8',
	'USDC': '1',
};

export const imageIds = {
	ETH: "1027",
	BTC: "1",
	USDC: "3408",
	DAI: "4943",
};