// src/blockchain/hooks/useMarketplace.jsx
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';
import MarketplaceAbi from '../abi/Marketplace.json'; // ABI de ton contrat marketplace

export function useMarketplace(contractAddress) {
  const { data: signer } = useSigner();

  const buyNFT = async (tokenId, price) => {
    if (!signer) return;
    const contract = new ethers.Contract(contractAddress, MarketplaceAbi, signer);
    try {
      const tx = await contract.buy(tokenId, { value: price });
      await tx.wait();
      alert('NFT purchased successfully!');
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  const listNFT = async (tokenId, price) => {
    if (!signer) return;
    const contract = new ethers.Contract(contractAddress, MarketplaceAbi, signer);
    try {
      const tx = await contract.listItem(tokenId, price);
      await tx.wait();
      alert('NFT listed successfully!');
    } catch (err) {
      console.error('Listing failed:', err);
    }
  };

  return { buyNFT, listNFT };
}
