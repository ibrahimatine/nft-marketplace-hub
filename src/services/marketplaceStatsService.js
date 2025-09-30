// src/services/marketplaceStatsService.js

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Calcule les statistiques côté client en cas de problème serveur
 * @param {string} serverError Message d'erreur du serveur
 * @returns {Promise<Object>} Statistiques calculées côté client
 */
const calculateClientSideStats = async (serverError) => {
  try {
    // Importer les utilitaires nécessaires
    const { fetchAllMarketplaceNFTs } = await import('../utils/contract');
    const { getSubmittedNFTs } = await import('../utils/storage');

    // 1. Récupérer les NFTs blockchain
    let blockchainNFTs = [];
    try {
      blockchainNFTs = await fetchAllMarketplaceNFTs();
      console.log(`📦 ${blockchainNFTs.length} NFTs blockchain trouvés`);
    } catch (blockchainError) {
      console.warn('⚠️ Erreur blockchain dans fallback:', blockchainError.message);
    }

    // 2. Récupérer les NFTs locaux ACTIFS (non migrés)
    const allLocalNFTs = getSubmittedNFTs();
    const activeLocalNFTs = allLocalNFTs.filter(nft =>
      nft.blockchainStatus !== 'minted' && nft.status === 'submitted'
    );

    console.log(`🏠 ${allLocalNFTs.length} NFTs locaux totaux, ${activeLocalNFTs.length} actifs (non migrés)`);

    // 3. Calculer les NFTs en vente
    const nftsForSale = blockchainNFTs.filter(nft => nft.forSale && !nft.sold).length +
                       activeLocalNFTs.filter(nft => nft.forSale).length;

    // 4. Calculer le volume total
    const totalVolume = blockchainNFTs.reduce((sum, nft) => sum + (parseFloat(nft.price) || 0), 0);

    // 5. Calculer les utilisateurs uniques (approximation)
    const uniqueOwners = new Set([
      ...blockchainNFTs.map(nft => nft.owner).filter(Boolean),
      ...activeLocalNFTs.map(nft => nft.owner || 'local-user').filter(Boolean)
    ]).size;

    const stats = {
      totalNFTs: blockchainNFTs.length + activeLocalNFTs.length,
      blockchainNFTs: blockchainNFTs.length,
      localNFTs: activeLocalNFTs.length, // IMPORTANT: seulement les actifs !
      nftsForSale: nftsForSale,
      totalUsers: uniqueOwners,
      totalVolume: `${totalVolume.toFixed(4)} ETH`,
      contractAddress: null,
      lastUpdated: new Date().toISOString(),
      source: 'client-fallback',
      serverError: serverError
    };

    console.log('✅ Stats calculées côté client:', stats);
    return stats;

  } catch (error) {
    console.error('❌ Erreur calcul stats client:', error);

    // Dernier fallback
    return {
      totalNFTs: 0,
      blockchainNFTs: 0,
      localNFTs: 0,
      nftsForSale: 0,
      totalUsers: 0,
      totalVolume: '0 ETH',
      contractAddress: null,
      lastUpdated: new Date().toISOString(),
      source: 'emergency-fallback',
      error: error.message
    };
  }
};

/**
 * Service pour récupérer les statistiques complètes du marketplace
 * depuis le serveur (qui combine blockchain + localStorage)
 */

/**
 * Récupère les statistiques en temps réel du marketplace
 * @returns {Promise<Object>} Statistiques du marketplace
 */
export const getMarketplaceStats = async () => {
  try {
    console.log('📊 Récupération des stats marketplace depuis le serveur...');

    const response = await fetch(`${API_BASE_URL}/marketplace-stats`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const serverStats = await response.json();
    console.log('✅ Stats reçues du serveur:', serverStats);

    // IMPORTANT: Le serveur ne peut pas connaître les NFTs locaux migrés
    // car cette info est dans localStorage. On utilise donc les stats côté client
    // pour les NFTs locaux, et les stats serveur pour la blockchain.
    console.log('🔄 Calcul hybride: blockchain (serveur) + locaux (client)...');

    const clientStats = await calculateClientSideStats('hybrid-mode');

    return {
      totalNFTs: serverStats.blockchainNFTs + clientStats.localNFTs,
      blockchainNFTs: serverStats.blockchainNFTs || 0,
      localNFTs: clientStats.localNFTs || 0, // FORCE côté client
      nftsForSale: serverStats.nftsForSale || 0,
      totalUsers: serverStats.totalUsers || 0,
      totalVolume: serverStats.totalVolume || '0 ETH',
      contractAddress: serverStats.contractAddress,
      lastUpdated: serverStats.lastUpdated,
      source: 'hybrid' // Serveur + Client
    };

  } catch (error) {
    console.error('❌ Erreur récupération stats serveur:', error);
    console.log('🔄 Fallback: calcul des stats côté client...');

    // Fallback : calculer les stats côté client
    return await calculateClientSideStats(error.message);
  }
};

/**
 * Récupère les statistiques avec cache et rafraîchissement automatique
 * @param {number} cacheTime Durée de cache en ms (défaut: 30 secondes)
 * @returns {Promise<Object>} Statistiques du marketplace
 */
export const getCachedMarketplaceStats = (() => {
  let cache = null;
  let lastFetch = 0;

  return async (cacheTime = 30000) => { // 30 secondes par défaut
    const now = Date.now();

    // Si on a des données en cache et qu'elles sont récentes
    if (cache && (now - lastFetch) < cacheTime) {
      console.log('📋 Utilisation du cache stats');
      return cache;
    }

    // Sinon, récupérer de nouvelles données
    console.log('🔄 Rafraîchissement des stats');
    cache = await getMarketplaceStats();
    lastFetch = now;

    return cache;
  };
})();

/**
 * Force le rafraîchissement du cache des statistiques
 * @returns {Promise<Object>} Nouvelles statistiques
 */
export const refreshMarketplaceStats = async () => {
  console.log('🔄 Rafraîchissement forcé des stats');
  return await getMarketplaceStats();
};