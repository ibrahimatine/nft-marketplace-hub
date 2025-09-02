// src/blockchain/hooks/useMint.jsx
import { useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import NFTAbi from '../abi/NFT.json';

export function useMint(contractAddress) {
  const { data: signer } = useSigner();
  const { isConnected } = useAccount();

  const mintNFT = async () => {
    if (!signer) return;
    const contract = new ethers.Contract(contractAddress, NFTAbi, signer);
    try {
      const tx = await contract.mint(); // adapter selon ton smart contract
      await tx.wait();
      alert('NFT minted successfully!');
    } catch (err) {
      console.error('Minting failed:', err);
    }
  };

  return { mintNFT, isConnected };
}
