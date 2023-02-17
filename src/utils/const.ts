import { ChainID } from './chains';
import { getAddress } from './contract';
// import fs from 'fs';

export const config = require('../deployments/config.json');
export const deployments = require('../deployments/deployments.json');

export const Endpoints = {
	[ChainID.NILE]: 'https://api.zexe.io/',
	[ChainID.AURORA]: 'https://aurora.api.zexe.io/',
	[ChainID.ARB_GOERLI]: `https://api.zexe.io/v/0.0.6/`,
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
	'LINK': 'chainlink',
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
	'ZEXE': '0.001',
	'LINK': '4.5'
};

export const mintAmount = {
	USDT: 10000,
	USDD: 10000,
	BTC: 1,
	ETH: 10,
	WTRX: 100000,
	BTT: 10000000,
	AURORA: 1000,
	NEAR: 100,
	USDC: 10000,
	ZEXE: 1000000,
	LINK: 100,
};

export const imageIds = {
	ETH: "1027",
	BTC: "1",
	USDC: "3408",
	DAI: "4943",
};

export const domain = (chain: number) => {
	return {
		name: config.name,
		version: config.version,
		chainId: chain.toString(),
		verifyingContract: getAddress("Exchange", chain)
	}
};

// The named list of all type definitions
export const types = {
	Order: [
		{ name: 'maker', type: 'address' },
		{ name: 'token0', type: 'address' },
		{ name: 'token1', type: 'address' },
		{ name: 'amount', type: 'uint256' },
		{ name: 'orderType', type: 'uint8' },
		{ name: 'salt', type: 'uint32' },
		{ name: 'exchangeRate', type: 'uint176' },
		{ name: 'borrowLimit', type: 'uint32' },
		{ name: 'loops', type: 'uint8' }
	],
};