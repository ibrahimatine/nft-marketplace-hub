// Utilitaire de debug pour IPFS
import { getContractReadOnly } from './contract.js';

export const debugToken = async (tokenId) => {
  try {
    console.log(`🔍 Debug Token ${tokenId}:`);

    const { contract } = await getContractReadOnly();

    // Récupérer l'URI brut
    const tokenURI = await contract.tokenURI(tokenId);
    console.log('🔗 Token URI brut:', tokenURI);
    console.log('📏 Longueur:', tokenURI.length);
    console.log('🏷️ Type:', tokenURI.startsWith('data:') ? 'Base64' : tokenURI.startsWith('ipfs://') ? 'IPFS' : tokenURI.startsWith('http') ? 'HTTP' : 'Autre');

    if (tokenURI.startsWith('data:application/json;base64,')) {
      // Décoder base64
      const base64Data = tokenURI.replace('data:application/json;base64,', '');
      const decoded = JSON.parse(atob(base64Data));
      console.log('📄 Métadonnées décodées:', decoded);

      if (decoded.image && decoded.image.startsWith('ipfs://')) {
        const imageHash = decoded.image.replace('ipfs://', '');
        const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
        console.log('🖼️ URL image IPFS:', imageUrl);

        // Test de l'image
        try {
          const response = await fetch(imageUrl, { method: 'HEAD' });
          console.log('🖼️ Image accessible:', response.ok, response.status);
        } catch (error) {
          console.log('🖼️ Image inaccessible:', error.message);
        }
      }
    } else if (tokenURI.startsWith('ipfs://')) {
      // URI IPFS complète
      const hash = tokenURI.replace('ipfs://', '');
      const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
      console.log('🌐 URL IPFS complète:', url);

      // Test de la métadonnée
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log('📡 Métadonnées accessibles:', response.ok, response.status);

        if (response.ok) {
          const fullResponse = await fetch(url);
          const metadata = await fullResponse.json();
          console.log('📄 Métadonnées IPFS:', metadata);
        }
      } catch (error) {
        console.log('📡 Métadonnées inaccessibles:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erreur debug token:', error);
  }
};

// Fonction à appeler depuis la console
window.debugToken = debugToken;