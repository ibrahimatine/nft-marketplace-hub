// Test simple du service IPFS
import { uploadImageToIPFS, uploadMetadataToIPFS, getIPFSUrl } from '../services/ipfsService.js';

// Test de base des configurations
export const testIPFSConfig = () => {
  console.log('=== Test Configuration IPFS ===');

  const apiKey = import.meta.env?.VITE_PINATA_API_KEY || "fallback_key";
  const secretKey = import.meta.env?.VITE_PINATA_SECRET_KEY || "fallback_secret";

  console.log('API Key configurée:', apiKey ? apiKey.substring(0, 8) + '...' : 'Non configurée');
  console.log('Secret Key configurée:', secretKey ? secretKey.substring(0, 8) + '...' : 'Non configurée');

  return {
    hasApiKey: !!apiKey && apiKey !== "fallback_key",
    hasSecret: !!secretKey && secretKey !== "fallback_secret"
  };
};

// Test de génération d'URL IPFS
export const testIPFSUrl = () => {
  console.log('=== Test URLs IPFS ===');

  const testHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
  const expectedUrl = "https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
  const generatedUrl = getIPFSUrl(testHash);

  console.log('Hash test:', testHash);
  console.log('URL générée:', generatedUrl);
  console.log('URL attendue:', expectedUrl);
  console.log('✅ URLs IPFS OK:', generatedUrl === expectedUrl);

  return generatedUrl === expectedUrl;
};

// Test de création d'une image test
export const createTestImage = () => {
  return new Promise((resolve) => {
    // Créer un canvas avec une image test
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Dessiner quelque chose de simple
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, 200, 200);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test IPFS', 100, 100);
    ctx.fillText(new Date().toLocaleTimeString(), 100, 130);

    // Convertir en blob
    canvas.toBlob(resolve, 'image/png');
  });
};

// Test complet
export const runIPFSTests = async () => {
  console.log('🚀 Démarrage des tests IPFS...');

  try {
    // Test 1: Configuration
    const config = testIPFSConfig();
    if (!config.hasApiKey || !config.hasSecret) {
      console.warn('⚠️ Clés API non configurées, utilisation des clés par défaut');
    }

    // Test 2: URLs
    const urlTest = testIPFSUrl();
    if (!urlTest) {
      console.error('❌ Test URLs IPFS échoué');
      return false;
    }

    // Test 3: Création d'image test
    console.log('Création d\'une image test...');
    const testImage = await createTestImage();
    console.log('✅ Image test créée:', testImage.size, 'bytes');

    console.log('✅ Tous les tests de base passés !');
    return true;

  } catch (error) {
    console.error('❌ Erreur dans les tests:', error);
    return false;
  }
};