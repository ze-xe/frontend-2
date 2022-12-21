import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import {
	darkTheme,
	getDefaultWallets,
	lightTheme,
	midnightTheme,
	RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { Chain, chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import theme from "../styles/theme";
import { AppProps } from "next/app";
import { DataProvider } from "../context/DataProvider";
import { AppDataProvider } from "../context/AppData";
// import { Header } from "../components/Header";
import { LeverDataProvider } from "../context/LeverDataProvider";
import rainbowTheme from "../styles/rainbowTheme";

const { chains, provider } = configureChains(
	[
		{
			...chain.arbitrumGoerli,
			iconUrl:
				"https://arbitrum.io/wp-content/uploads/2021/01/Arbitrum_Symbol-Full-color-White-background.png",
		} as Chain
	],
	[alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
	appName: "My RainbowKit App",
	chains,
});

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

import dynamic from 'next/dynamic';


const Header = dynamic(
	() =>
		import('../components/Header').then(mod => mod.Header),
	{ ssr: false },
);

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider chains={chains} theme={rainbowTheme()}>
				<ChakraProvider theme={theme}>
					<DataProvider>
						<LeverDataProvider>
							<AppDataProvider>
								<Header title={""} />
								<Component {...pageProps} />
							</AppDataProvider>
						</LeverDataProvider>
					</DataProvider>
				</ChakraProvider> 
			</RainbowKitProvider>
		</WagmiConfig>
	);
}

export default MyApp;
