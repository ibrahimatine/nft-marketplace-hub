// COPIEZ ET COLLEZ TOUT CE CODE DANS LA CONSOLE DU NAVIGATEUR (F12)

// Supprimer tous les NFTs du localStorage
window.clearAllLocalNFTs = () => {
  try {
    localStorage.removeItem('nft_marketplace_submitted_nfts');
    console.log('✅ Tous les NFTs locaux ont été supprimés');
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression NFTs locaux:', error);
    return false;
  }
};

// Supprimer un NFT spécifique par ID
window.deleteNFTById = (nftId) => {
  try {
    const stored = localStorage.getItem('nft_marketplace_submitted_nfts');
    if (stored) {
      const nfts = JSON.parse(stored);
      const filtered = nfts.filter(nft => nft.id !== nftId);
      localStorage.setItem('nft_marketplace_submitted_nfts', JSON.stringify(filtered));
      console.log(`✅ NFT avec ID ${nftId} supprimé`);
      console.log(`📊 NFTs restants: ${filtered.length}`);
      return true;
    }
    console.log('❌ Aucun NFT trouvé');
    return false;
  } catch (error) {
    console.error('❌ Erreur suppression NFT:', error);
    return false;
  }
};

// Supprimer tout le localStorage de l'application
window.clearAllAppData = () => {
  try {
    // Obtenir toutes les clés qui commencent par notre préfixe
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('nft_marketplace_') || key.startsWith('nft_'))) {
        keysToRemove.push(key);
      }
    }
    
    // Supprimer chaque clé
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Toutes les données de l\'application ont été supprimées');
    console.log('🗑️ Clés supprimées:', keysToRemove);
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression données app:', error);
    return false;
  }
};

// Fonction pour supprimer avec confirmation
window.clearNFTs = () => {
  const confirmed = confirm('⚠️ Voulez-vous vraiment supprimer TOUS les NFTs locaux ? Cette action est irréversible.');
  if (confirmed) {
    clearAllLocalNFTs();
    // Recharger la page pour voir les changements
    window.location.reload();
  }
};

// Afficher les statistiques détaillées
window.showNFTStats = () => {
  try {
    const stored = localStorage.getItem('nft_marketplace_submitted_nfts');
    if (stored) {
      const nfts = JSON.parse(stored);
      console.log(`📊 NFTs locaux trouvés: ${nfts.length}`);
      console.table(nfts.map(nft => ({
        ID: nft.id,
        Nom: nft.name,
        Prix: nft.price ? `${nft.price} ETH` : 'Non en vente',
        Catégorie: nft.category,
        'Créé le': nft.submittedAt || nft.createdAt || 'Date inconnue'
      })));
      
      // Afficher plus de détails
      console.log('📝 Détails complets des NFTs:');
      nfts.forEach((nft, index) => {
        console.log(`\n--- NFT #${index + 1} ---`);
        console.log('ID:', nft.id);
        console.log('Nom:', nft.name);
        console.log('Description:', nft.description?.substring(0, 100) + '...');
        console.log('Image présente:', nft.image ? '✅ Oui' : '❌ Non');
      });
    } else {
      console.log('📊 Aucun NFT local trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur lecture NFTs:', error);
  }
};

// Supprimer les NFTs en double (garde seulement les uniques)
window.removeDuplicateNFTs = () => {
  try {
    const stored = localStorage.getItem('nft_marketplace_submitted_nfts');
    if (stored) {
      const nfts = JSON.parse(stored);
      const uniqueNFTs = nfts.filter((nft, index, self) =>
        index === self.findIndex(n => n.name === nft.name && n.description === nft.description)
      );
      
      const duplicatesRemoved = nfts.length - uniqueNFTs.length;
      
      if (duplicatesRemoved > 0) {
        localStorage.setItem('nft_marketplace_submitted_nfts', JSON.stringify(uniqueNFTs));
        console.log(`✅ ${duplicatesRemoved} doublons supprimés`);
        console.log(`📊 NFTs uniques restants: ${uniqueNFTs.length}`);
      } else {
        console.log('✅ Aucun doublon trouvé');
      }
      return true;
    }
    console.log('❌ Aucun NFT trouvé');
    return false;
  } catch (error) {
    console.error('❌ Erreur suppression doublons:', error);
    return false;
  }
};

// Exporter les NFTs en JSON (pour sauvegarde)
window.exportNFTs = () => {
  try {
    const stored = localStorage.getItem('nft_marketplace_submitted_nfts');
    if (stored) {
      const nfts = JSON.parse(stored);
      const dataStr = JSON.stringify(nfts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nfts_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      console.log('✅ NFTs exportés avec succès');
    } else {
      console.log('❌ Aucun NFT à exporter');
    }
  } catch (error) {
    console.error('❌ Erreur export NFTs:', error);
  }
};

// Menu d'aide
console.clear();
console.log('%c🎨 Gestionnaire de NFTs Locaux', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
console.log('%c📋 Commandes disponibles:', 'font-size: 14px; font-weight: bold; color: #764ba2;');
console.log('');
console.log('%c📊 showNFTStats()', 'color: #3b82f6;', '- Afficher tous les NFTs locaux');
console.log('%c🗑️  clearNFTs()', 'color: #ef4444;', '- Supprimer TOUS les NFTs (avec confirmation)');
console.log('%c🗑️  clearAllLocalNFTs()', 'color: #ef4444;', '- Supprimer tous les NFTs (sans confirmation)');
console.log('%c🗑️  deleteNFTById(id)', 'color: #ef4444;', '- Supprimer un NFT spécifique');
console.log('%c🔧 removeDuplicateNFTs()', 'color: #f59e0b;', '- Supprimer les doublons');
console.log('%c💾 exportNFTs()', 'color: #10b981;', '- Exporter les NFTs en JSON');
console.log('%c🧹 clearAllAppData()', 'color: #ef4444;', '- Supprimer TOUTES les données de l\'app');
console.log('');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
console.log('💡 Tapez une commande pour commencer. Ex: showNFTStats()');

// Afficher automatiquement les stats au chargement
showNFTStats();