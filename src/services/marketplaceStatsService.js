// src/services/marketplaceStatsService.js

const API_BASE_URL = 'http://localhost:3000/api';

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

    const stats = await response.json();
    console.log('✅ Stats reçues du serveur:', stats);

    return {
      totalNFTs: stats.totalNFTs || 0,
      blockchainNFTs: stats.blockchainNFTs || 0,
      localNFTs: stats.localNFTs || 0,
      nftsForSale: stats.nftsForSale || 0,
      totalUsers: stats.totalUsers || 0,
      totalVolume: stats.totalVolume || '0 ETH',
      contractAddress: stats.contractAddress,
      lastUpdated: stats.lastUpdated,
      source: 'server' // Indiquer que les données viennent du serveur
    };

  } catch (error) {
    console.error('❌ Erreur récupération stats serveur:', error);

    // Fallback : retourner des stats par défaut
    return {
      totalNFTs: 0,
      blockchainNFTs: 0,
      localNFTs: 0,
      nftsForSale: 0,
      totalUsers: 0,
      totalVolume: '0 ETH',
      contractAddress: null,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      error: error.message
    };
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