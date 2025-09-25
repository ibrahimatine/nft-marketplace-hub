import axios from 'axios';

// Configuration Pinata depuis les variables d'environnement
const PINATA_API_KEY = import.meta.env?.VITE_PINATA_API_KEY || "9785864ad2eb0d9cbcdf";
const PINATA_SECRET_API_KEY = import.meta.env?.VITE_PINATA_SECRET_KEY || "64c6f4bbeae62c5744b39c24d15f9bcd9a2a1b75b85fb508518a8983cbf63a36";
const PINATA_BASE_URL = 'https://api.pinata.cloud';

// Headers pour les requêtes Pinata
const pinataHeaders = {
  'Content-Type': 'application/json',
  'pinata_api_key': PINATA_API_KEY,
  'pinata_secret_api_key': PINATA_SECRET_API_KEY
};

/**
 * Upload un fichier image vers IPFS via Pinata
 * @param {File} file - Fichier image à uploader
 * @returns {Promise<string>} - Hash IPFS du fichier uploadé
 */
export const uploadImageToIPFS = async (file) => {
  try {
    // Vérifier que les clés API sont configurées
    if (PINATA_API_KEY === "VOTRE_PINATA_API_KEY") {
      throw new Error("Veuillez configurer vos clés API Pinata dans src/services/ipfsService.js");
    }

    const formData = new FormData();
    formData.append('file', file);

    // Options pour nommer le fichier
    const pinataOptions = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', pinataOptions);

    // Métadonnées pour organiser les fichiers
    const pinataMetadata = JSON.stringify({
      name: `NFT-Image-${Date.now()}`
    });
    formData.append('pinataMetadata', pinataMetadata);

    const response = await axios.post(
      `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY
        }
      }
    );

    console.log('Image uploadée sur IPFS:', response.data);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Erreur upload image IPFS:', error);
    throw new Error(`Échec de l'upload de l'image: ${error.message}`);
  }
};

/**
 * Upload les métadonnées JSON vers IPFS via Pinata
 * @param {Object} metadata - Métadonnées du NFT
 * @returns {Promise<string>} - Hash IPFS des métadonnées
 */
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    // Vérifier que les clés API sont configurées
    if (PINATA_API_KEY === "VOTRE_PINATA_API_KEY") {
      throw new Error("Veuillez configurer vos clés API Pinata dans src/services/ipfsService.js");
    }

    const response = await axios.post(
      `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
      metadata,
      {
        headers: {
          ...pinataHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Métadonnées uploadées sur IPFS:', response.data);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Erreur upload métadonnées IPFS:', error);
    throw new Error(`Échec de l'upload des métadonnées: ${error.message}`);
  }
};

/**
 * Génère l'URL de passerelle IPFS pour un hash donné
 * @param {string} hash - Hash IPFS
 * @returns {string} - URL complète de l'image
 */
export const getIPFSUrl = (hash) => {
  // Utilisation de la passerelle Pinata (plus rapide)
  return `https://gateway.pinata.cloud/ipfs/${hash}`;

  // Alternative avec passerelle publique IPFS
  // return `https://ipfs.io/ipfs/${hash}`;
};

/**
 * Crée les métadonnées complètes du NFT selon le standard ERC721
 * @param {Object} nftData - Données du NFT
 * @returns {Object} - Métadonnées formatées
 */
export const createNFTMetadata = (nftData) => {
  const { name, description, imageHash, attributes = [] } = nftData;

  return {
    name,
    description,
    image: getIPFSUrl(imageHash),
    external_url: "", // URL externe optionnelle
    attributes: attributes.map(attr => ({
      trait_type: attr.trait_type,
      value: attr.value
    }))
  };
};

/**
 * Processus complet d'upload d'un NFT
 * @param {Object} nftData - Données complètes du NFT
 * @returns {Promise<string>} - URI final du token (ipfs://hash)
 */
export const uploadCompleteNFT = async (nftData) => {
  try {
    const { file, name, description, attributes } = nftData;

    console.log('Début upload NFT vers IPFS...');

    // 1. Upload de l'image
    console.log('Upload image...');
    const imageHash = await uploadImageToIPFS(file);

    // 2. Création des métadonnées avec l'hash de l'image
    const metadata = createNFTMetadata({
      name,
      description,
      imageHash,
      attributes
    });

    // 3. Upload des métadonnées
    console.log('Upload métadonnées...');
    const metadataHash = await uploadMetadataToIPFS(metadata);

    // 4. Retourner l'URI du token au format standard
    const tokenURI = `ipfs://${metadataHash}`;

    console.log('NFT uploadé avec succès!');
    console.log('Image IPFS:', getIPFSUrl(imageHash));
    console.log('Métadonnées IPFS:', getIPFSUrl(metadataHash));
    console.log('Token URI:', tokenURI);

    return tokenURI;
  } catch (error) {
    console.error('Erreur upload complet NFT:', error);
    throw error;
  }
};