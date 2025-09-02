// src/blockchain/hooks/useBalance.js
import { useAccount, useBalance as useWagmiBalance } from 'wagmi';

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount();

  const { data, isLoading, isError } = useWagmiBalance({
    address: address,
    watch: true, // se met à jour automatiquement si la balance change
  });

  return {
    balance: data,          // contient { formatted, symbol, value }
    isConnected,
    isLoading,
    isError,
  };
};
