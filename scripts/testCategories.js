/**
 * Script de test pour vérifier le problème de catégories lors de la soumission
 */

const { saveSubmittedNFT } = require('../src/utils/storage.js');

// Simuler localStorage dans Node.js
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
    console.log(`📄 localStorage.setItem("${key}", ...)`);
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

async function testCategorySubmission() {
  console.log('🧪 Test de soumission avec différentes catégories');

  const categories = ['Digital Art', 'Gaming', 'Abstract', 'Nature', 'Retro', 'Photography', '3D Art'];

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    console.log(`\n${i + 1}️⃣ Test catégorie: "${category}"`);

    const nftData = {
      name: `Test NFT ${i + 1}`,
      description: `Description du NFT de test ${i + 1}`,
      category: category,
      price: 0,
      forSale: false,
      image: 'data:image/png;base64,test',
      likes: 0,
      views: 0,
      owner: 'Vous',
      seller: null,
      tokenId: null,
      contractAddress: null,
      blockchainStatus: 'local-only'
    };

    console.log('📝 Données avant sauvegarde:');
    console.log(`   - Nom: ${nftData.name}`);
    console.log(`   - Catégorie: "${nftData.category}"`);
    console.log(`   - Type: ${typeof nftData.category}`);

    try {
      const savedNFT = saveSubmittedNFT(nftData);

      console.log('💾 Données après sauvegarde:');
      console.log(`   - Nom: ${savedNFT.name}`);
      console.log(`   - Catégorie: "${savedNFT.category}"`);
      console.log(`   - Type: ${typeof savedNFT.category}`);

      if (savedNFT.category === nftData.category) {
        console.log('✅ Catégorie conservée correctement');
      } else {
        console.log('❌ PROBLÈME: Catégorie changée!');
        console.log(`   Attendu: "${nftData.category}"`);
        console.log(`   Obtenu: "${savedNFT.category}"`);
      }

    } catch (error) {
      console.log('❌ Erreur lors de la sauvegarde:', error.message);
    }
  }

  // Vérifier le contenu final du localStorage
  console.log('\n📋 Contenu final du localStorage:');
  const stored = localStorage.getItem('nft_marketplace_submitted_nfts');
  if (stored) {
    const nfts = JSON.parse(stored);
    nfts.forEach((nft, index) => {
      console.log(`   ${index + 1}. "${nft.name}" - Catégorie: "${nft.category}"`);
    });
  } else {
    console.log('   Aucune donnée trouvée');
  }
}

// Exporter les fonctions mockées pour les tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCategorySubmission };
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testCategorySubmission().then(() => {
    console.log('\n✅ Tests terminés');
  }).catch(error => {
    console.error('❌ Erreur:', error);
  });
}