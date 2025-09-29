// src/utils/storage.js
export const NFT_STORAGE_KEY = 'nft_marketplace_submitted_nfts';

// Sauvegarder un NFT nouvellement créé
export const saveSubmittedNFT = (nftData) => {
  try {
    const existingNFTs = getSubmittedNFTs();
    const newNFT = {
      ...nftData,
      id: Date.now(), // ID unique basé sur timestamp
      submittedAt: new Date().toISOString(),
      status: 'submitted' // Pour différencier des NFTs du contrat
    };
    
    const updatedNFTs = [...existingNFTs, newNFT];
    localStorage.setItem(NFT_STORAGE_KEY, JSON.stringify(updatedNFTs));
    
    return newNFT;
  } catch (error) {
    console.error('Erreur sauvegarde NFT:', error);
    return null;
  }
};

// Récupérer tous les NFTs soumis
export const getSubmittedNFTs = () => {
  try {
    const stored = localStorage.getItem(NFT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur récupération NFTs:', error);
    return [];
  }
};

// Mettre à jour un NFT (par exemple quand il est minté sur la blockchain)
export const updateSubmittedNFT = (nftId, updates) => {
  try {
    const existingNFTs = getSubmittedNFTs();
    const updatedNFTs = existingNFTs.map(nft => 
      nft.id === nftId ? { ...nft, ...updates } : nft
    );
    
    localStorage.setItem(NFT_STORAGE_KEY, JSON.stringify(updatedNFTs));
    return true;
  } catch (error) {
    console.error('Erreur mise à jour NFT:', error);
    return false;
  }
};

// Supprimer un NFT
export const removeSubmittedNFT = (nftId) => {
  try {
    const existingNFTs = getSubmittedNFTs();
    const filteredNFTs = existingNFTs.filter(nft => nft.id !== nftId);
    
    localStorage.setItem(NFT_STORAGE_KEY, JSON.stringify(filteredNFTs));
    return true;
  } catch (error) {
    console.error('Erreur suppression NFT:', error);
    return false;
  }
};

// Vider tous les NFTs soumis (utile pour debug)
export const clearSubmittedNFTs = () => {
  try {
    localStorage.removeItem(NFT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erreur nettoyage NFTs:', error);
    return false;
  }
};

// Alias pour le service de contrat
export const clearLocalStorage = clearSubmittedNFTs;