import { ChainID } from './chains';
// import fs from 'fs';

export const config = require('../deployments/config.json');
export const deployments = require('../deployments/deployments.json');

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