// scripts/clearLocalNFTs.js
// À exécuter dans la console du navigateur ou ajouter comme fonction dans votre app

// Supprimer tous les NFTs du localStorage
export const clearAllLocalNFTs = () => {
  try {
    localStorage.removeItem('nft_marketplace_submitted_nfts');
    console.log('✅ Tous les NFTs locaux ont été supprimés');
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression NFTs locaux:', error);
    return false;
  }
};

// Supprimer tout le localStorage de l'application
export const clearAllAppData = () => {
  try {
    // Obtenir toutes les clés qui commencent par notre préfixe
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nft_marketplace_')) {
        keysToRemove.push(key);
      }
    }
    
    // Supprimer chaque clé
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Toutes les données de l\'application ont été supprimées');
    console.log('Clés supprimées:', keysToRemove);
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression données app:', error);
    return false;
  }
};

// Fonction à exécuter dans la console du navigateur
window.clearNFTs = () => {
  const confirmed = confirm('Voulez-vous vraiment supprimer TOUS les NFTs locaux ? Cette action est irréversible.');
  if (confirmed) {
    clearAllLocalNFTs();
    // Recharger la page pour voir les changements
    window.location.reload();
  }
};

// Afficher les statistiques avant suppression
window.showNFTStats = () => {
  try {
    const stored = localStorage.getItem('nft_marketplace_submitted_nfts');
    if (stored) {
      const nfts = JSON.parse(stored);
      console.log(`📊 NFTs locaux trouvés: ${nfts.length}`);
      console.log('Détails:', nfts.map(nft => ({
        id: nft.id,
        name: nft.name,
        price: nft.price,
        createdAt: nft.submittedAt
      })));
    } else {
      console.log('📊 Aucun NFT local trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur lecture NFTs:', error);
  }
};

console.log('🔧 Scripts disponibles:');
console.log('- clearNFTs() : Supprimer tous les NFTs locaux');
console.log('- showNFTStats() : Afficher les statistiques');
console.log('- clearAllAppData() : Supprimer toutes les données app');