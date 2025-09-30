/**
 * Utilitaires pour gérer les URLs IPFS dans l'affichage
 */

/**
 * Convertit une URL IPFS en URL de passerelle utilisable
 * @param {string} ipfsUrl - URL au format ipfs://hash ou hash direct
 * @returns {string} - URL de passerelle complète
 */
export const getIPFSGatewayUrl = (ipfsUrl) => {
  if (!ipfsUrl) return null;

  // Si c'est déjà une URL HTTP complète, la retourner telle quelle
  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl;
  }

  // Si c'est une URL ipfs://
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  // Si c'est juste un hash
  if (ipfsUrl.length === 46 && ipfsUrl.startsWith('Qm')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
  }

  // Pour les autres cas, essayer de construire l'URL
  return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
};

/**
 * Récupère l'image depuis les métadonnées d'un NFT
 * @param {Object} nft - Objet NFT avec possibles sources d'image
 * @returns {string|null} - URL de l'image ou null
 */
export const getNFTImageUrl = (nft) => {
  // Priority 1: Image locale base64 ou HTTP complète
  if (nft.image && (nft.image.startsWith('data:') || nft.image.startsWith('http'))) {
    return nft.image;
  }

  // Priority 2: Image IPFS directe
  if (nft.image && nft.image.startsWith('ipfs://')) {
    return getIPFSGatewayUrl(nft.image);
  }

  // Priority 3: Image directe IPFS (hash seul)
  if (nft.image && (nft.image.startsWith('Qm') || nft.image.length === 46)) {
    return getIPFSGatewayUrl(nft.image);
  }

  // Priority 4: Fallback pour autres formats
  if (nft.image) {
    return getIPFSGatewayUrl(nft.image);
  }

  return null;
};

/**
 * Charge les métadonnées depuis une URI IPFS
 * @param {string} tokenURI - URI du token (ipfs://hash)
 * @returns {Promise<Object|null>} - Métadonnées parsées ou null
 */
export const fetchIPFSMetadata = async (tokenURI) => {
  try {
    if (!tokenURI) return null;

    let metadataUrl;

    // Si c'est une data URI (base64)
    if (tokenURI.startsWith('data:')) {
      const base64Data = tokenURI.split(',')[1];
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    }

    // Si c'est une URI IPFS
    if (tokenURI.startsWith('ipfs://')) {
      metadataUrl = getIPFSGatewayUrl(tokenURI);
    } else {
      metadataUrl = tokenURI;
    }

    console.log('Récupération métadonnées IPFS:', metadataUrl);

    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const metadata = await response.json();
    console.log('Métadonnées IPFS récupérées:', metadata);

    return metadata;
  } catch (error) {
    console.error('Erreur récupération métadonnées IPFS:', error);
    return null;
  }
};

/**
 * Enrichit un NFT avec ses métadonnées IPFS si nécessaire
 * @param {Object} nft - NFT à enrichir
 * @returns {Promise<Object>} - NFT enrichi avec les métadonnées IPFS
 */
export const enrichNFTWithIPFS = async (nft) => {
  // Si on a déjà une image locale ou pas d'URI IPFS, retourner tel quel
  if (!nft.ipfsTokenURI || (nft.image && nft.image.startsWith('data:'))) {
    return nft;
  }

  try {
    const metadata = await fetchIPFSMetadata(nft.ipfsTokenURI);
    if (metadata) {
      return {
        ...nft,
        ipfsMetadata: metadata,
        // Utiliser l'image IPFS si pas d'image locale
        image: nft.image || getIPFSGatewayUrl(metadata.image) || nft.image
      };
    }
  } catch (error) {
    console.warn('Impossible d\'enrichir le NFT avec IPFS:', error);
  }

  return nft;
};