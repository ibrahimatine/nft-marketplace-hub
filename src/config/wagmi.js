import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
    goerli,
    polygonMumbai,
    arbitrumGoerli,
    optimismGoerli,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'NFT Hub',
    projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Obtenir sur https://cloud.walletconnect.com
    chains: [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        sepolia,       // testnet Ethereum
        polygonMumbai, // testnet Polygon
        goerli,        // testnet Ethereum
        arbitrumGoerli, // testnet Arbitrum
        optimismGoerli, // testnet Optimism
    ],
    ssr: false,
});
