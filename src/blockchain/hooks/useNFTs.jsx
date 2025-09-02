// src/blockchain/hooks/useNFTs.jsx
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import NFTAbi from '../abi/NFT.json';

export function useNFTs(contractAddress) {
  const { address, isConnected } = useAccount();
  const [nfts, setNFTs] = useState([]);

  useEffect(() => {
    if (!isConnected) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, NFTAbi, provider);

    const fetchNFTs = async () => {
      try {
        const balance = await contract.balanceOf(address);
        const items = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i);
          const tokenUri = await contract.tokenURI(tokenId);
          items.push({ tokenId, tokenUri });
        }
        setNFTs(items);
      } catch (err) {
        console.error('Failed to fetch NFTs:', err);
      }
    };

    fetchNFTs();
  }, [address, isConnected, contractAddress]);

  return nfts;
}
