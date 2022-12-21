import { Chain } from 'wagmi';


export enum ChainID {
    AURORA = 1313161555,
    ARB_GOERLI = 421613,
    NILE = -3,
	HARMONY = 1666700000
}

const aurora: Chain = {
	/** ID in number form */
	id: ChainID.AURORA,
	/** Human-readable name */
	name: 'Aurora Testnet',
	/** Internal network name */
	network: 'Aurora',
	/** Currency used by chain */
	nativeCurrency: {
		name: 'Ethereum',
		symbol: 'ETH',
		decimals: 18,
	},
	/** Collection of RPC endpoints */
	rpcUrls: {
		public: 'https://testnet.aurora.dev',
		default: 'https://testnet.aurora.dev',
	},
	/** Collection of block explorers */
	blockExplorers: {
		etherscan: {
			name: 'AuroraScan',
			url: 'https://testnet.aurorascan.dev/',
		},
		default: {
			name: 'AuroraScan',
			url: 'https://testnet.aurorascan.dev/',
		},
	},

	/**
	 * Chain [multicall3 contract](https://github.com/mds1/multicall)
	 */
	// multicall?: {
	//     address: Address;
	//     blockCreated: number;
	// };
	/** Flag for test networks */
	testnet: true,
};

const arbitrumGoerli: Chain = {
	/** ID in number form */
	id: ChainID.ARB_GOERLI,
	/** Human-readable name */
	name: 'Arbitrum Goerli',
	/** Internal network name */
	network: 'Arbitrum Goerli',
	/** Currency used by chain */
	nativeCurrency: {
		name: 'Ethereum',
		symbol: 'ETH',
		decimals: 18,
	},
	/** Collection of RPC endpoints */
	rpcUrls: {
		public: 'https://arbitrum-goerli.infura.io/v3/bb621c9372d048979f8677ba78fe41d7',
		default: 'https://arbitrum-goerli.infura.io/v3/bb621c9372d048979f8677ba78fe41d7',
	},
	/** Collection of block explorers */
	blockExplorers: {
		etherscan: {
			name: 'Arbiscan',
			url: 'https://goerli.arbiscan.io/',
		},
		default: {
			name: 'Arbiscan',
			url: 'https://goerli.arbiscan.io/',
		},
	},

	/**
	 * Chain [multicall3 contract](https://github.com/mds1/multicall)
	 */
	// multicall?: {
	//     address: Address;
	//     blockCreated: number;
	// };
	/** Flag for test networks */
	testnet: true,
};

const harmony: Chain = {
	/** ID in number form */
	id: ChainID.HARMONY,
	/** Human-readable name */
	name: 'Harmony Testnet',
	/** Internal network name */
	network: 'Harmony Testnet',
	/** Currency used by chain */
	nativeCurrency: {
		name: 'Harmony ONE',
		symbol: 'ONE',
		decimals: 18,
	},
	/** Collection of RPC endpoints */
	rpcUrls: {
		public: 'https://api.s0.b.hmny.io/',
		default: 'https://api.s0.b.hmny.io/',
	},
	/** Collection of block explorers */
	blockExplorers: {
		etherscan: {
			name: 'Harmony Explorer',
			url: 'https://explorer.testnet.harmony.one/',
		},
		default: {
			name: 'Harmony Explorer',
			url: 'https://explorer.testnet.harmony.one/',
		},
	},

	/**
	 * Chain [multicall3 contract](https://github.com/mds1/multicall)
	 */
	// multicall?: {
	//     address: Address;
	//     blockCreated: number;
	// };
	/** Flag for test networks */
	testnet: true,
};

export const chains: Chain[] = [
    aurora, 
    arbitrumGoerli,
	harmony
];

export const chainMapping = {
	[ChainID.AURORA]: aurora,
	[ChainID.ARB_GOERLI]: arbitrumGoerli,
	[ChainID.HARMONY]: harmony,
}

export const chainIndex = {
	[ChainID.AURORA]: 0,
	[ChainID.ARB_GOERLI]: 1,
	[ChainID.HARMONY]: 2,
}