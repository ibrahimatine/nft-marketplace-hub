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
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '5ce045e2ffb9e2c9081e4e077c83aa80',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
    polygonMumbai,
    goerli,
    arbitrumGoerli,
    optimismGoerli,
  ],
  ssr: false,
});
