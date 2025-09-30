const axios = require("axios");
const fs = require("fs");

/**
 * Script de test pour vérifier le système de nettoyage automatique
 * des stats lors du redéploiement de contrat
 */

async function testContractReset() {
  console.log("🧪 Test du système de nettoyage automatique des stats");

  const SERVER_URL = 'http://localhost:3000';
  const STATS_FILE = './server/nft-stats.json';
  const CONTRACT_FILE = './src/contracts/contract-address.json';

  try {
    // 1. Vérifier que le serveur est accessible
    console.log("1️⃣ Vérification du serveur...");

    try {
      const healthCheck = await axios.get(`${SERVER_URL}/api/stats`);
      console.log("✅ Serveur accessible");
    } catch (error) {
      console.log("❌ Serveur non accessible. Démarrez-le avec: npm run dev:server");
      return;
    }

    // 2. Ajouter quelques stats de test
    console.log("2️⃣ Ajout de stats de test...");

    const testStats = [
      { nftId: 'test-1', userAddress: '0x123...abc' },
      { nftId: 'test-2', userAddress: '0x456...def' },
      { nftId: 'test-3', userAddress: '0x789...ghi' }
    ];

    for (const stat of testStats) {
      try {
        await axios.post(`${SERVER_URL}/api/nft/${stat.nftId}/view`, {
          userAddress: stat.userAddress
        });
        await axios.post(`${SERVER_URL}/api/nft/${stat.nftId}/like`, {
          userAddress: stat.userAddress
        });
        console.log(`✅ Stats ajoutées pour NFT ${stat.nftId}`);
      } catch (error) {
        console.log(`⚠️ Erreur pour NFT ${stat.nftId}:`, error.message);
      }
    }

    // 3. Vérifier les stats ajoutées
    console.log("3️⃣ Vérification des stats...");
    const statsResponse = await axios.get(`${SERVER_URL}/api/stats`);
    const currentStats = statsResponse.data;
    const nftCount = Object.keys(currentStats.nfts || {}).length;
    console.log(`📊 Stats actuelles: ${nftCount} NFTs avec données`);

    if (nftCount === 0) {
      console.log("⚠️ Aucune stat trouvée, création manuelle...");

      // Créer des stats manuellement dans le fichier
      const manualStats = {
        nfts: {
          "test-1": { views: 5, likes: 2, likedBy: ["0x123...abc", "0x456...def"] },
          "test-2": { views: 3, likes: 1, likedBy: ["0x789...ghi"] },
          "test-3": { views: 8, likes: 0, likedBy: [] }
        },
        lastUpdated: new Date().toISOString(),
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      };

      fs.writeFileSync(STATS_FILE, JSON.stringify(manualStats, null, 2));
      console.log("✅ Stats créées manuellement");
    }

    // 4. Sauvegarder l'état avant nettoyage
    console.log("4️⃣ Sauvegarde de l'état avant nettoyage...");
    const beforeStats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    console.log(`📋 Avant: ${Object.keys(beforeStats.nfts || {}).length} NFTs`);

    // 5. Simuler un changement d'adresse de contrat
    console.log("5️⃣ Simulation du changement d'adresse de contrat...");

    let contractData;
    if (fs.existsSync(CONTRACT_FILE)) {
      contractData = JSON.parse(fs.readFileSync(CONTRACT_FILE, 'utf8'));
    } else {
      contractData = {};
    }

    const oldAddress = contractData.NFTMarketplace || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const newAddress = "0x" + Math.random().toString(16).slice(2, 42).padStart(40, '0');

    contractData.NFTMarketplace = newAddress;
    contractData.deployedAt = new Date().toISOString();
    contractData.previousAddress = oldAddress;

    fs.writeFileSync(CONTRACT_FILE, JSON.stringify(contractData, null, 2));
    console.log(`📝 Contrat simulé: ${oldAddress} → ${newAddress}`);

    // 6. Tester l'API de nettoyage
    console.log("6️⃣ Test de l'API de nettoyage...");

    const resetResponse = await axios.delete(`${SERVER_URL}/api/stats/reset`, {
      data: {
        contractAddress: newAddress
      }
    });

    if (resetResponse.data.success) {
      console.log("✅ API de nettoyage: OK");
    } else {
      console.log("❌ API de nettoyage: ÉCHEC");
    }

    // 7. Vérifier que les stats ont été nettoyées
    console.log("7️⃣ Vérification du nettoyage...");

    const afterStatsResponse = await axios.get(`${SERVER_URL}/api/stats`);
    const afterStats = afterStatsResponse.data;
    const afterCount = Object.keys(afterStats.nfts || {}).length;

    console.log(`📊 Après nettoyage: ${afterCount} NFTs`);

    if (afterCount === 0) {
      console.log("✅ SUCCÈS: Toutes les stats ont été nettoyées");
    } else {
      console.log("❌ ÉCHEC: Des stats subsistent après nettoyage");
    }

    // 8. Vérifier que l'adresse du contrat est mise à jour
    if (afterStats.contractAddress === newAddress) {
      console.log("✅ SUCCÈS: Adresse du contrat mise à jour dans les stats");
    } else {
      console.log("⚠️ ATTENTION: Adresse du contrat non mise à jour dans les stats");
    }

    // 9. Restaurer l'état initial pour les tests suivants
    console.log("9️⃣ Restauration de l'état initial...");

    contractData.NFTMarketplace = oldAddress;
    delete contractData.deployedAt;
    delete contractData.previousAddress;
    fs.writeFileSync(CONTRACT_FILE, JSON.stringify(contractData, null, 2));

    console.log("✅ État initial restauré");

    console.log("\n🎉 TEST TERMINÉ");
    console.log("📋 Résumé:");
    console.log(`   - Stats avant: ${Object.keys(beforeStats.nfts || {}).length} NFTs`);
    console.log(`   - Stats après: ${afterCount} NFTs`);
    console.log(`   - Nettoyage: ${afterCount === 0 ? 'RÉUSSI' : 'ÉCHEC'}`);

  } catch (error) {
    console.error("❌ Erreur durant le test:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testContractReset().then(() => {
    console.log("✅ Script de test terminé");
    process.exit(0);
  }).catch(error => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
}

module.exports = { testContractReset };