import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
    goerli,
    polygonMumbai
} from 'wagmi/chains';


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
        // Production chains
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        // Test chains - toujours inclus pour faciliter les tests
        sepolia,
        polygonMumbai,
        goerli,
        arbitrumGoerli,
        optimismGoerli,
    ],
    ssr: false,
});

// export const config = getDefaultConfig({
//     appName: 'NFT-Marketplace',
//     projectId: '5ce045e2ffb9e2c9081e4e077c83aa80',
//     chains: [
//         mainnet,
//         polygon,
//         optimism,
//         arbitrum,
//         base,
//         ...(process.env.NODE_ENV === 'development' ? [sepolia] : []),
//     ],
//     ssr: false,
// });