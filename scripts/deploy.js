const hre = require("hardhat");

async function main() {
  console.log("Déploiement du NFTMarketplace...");

  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();

  await nftMarketplace.deployed();

  console.log("NFTMarketplace déployé à l'adresse:", nftMarketplace.address);

  // Créer les dossiers pour sauvegarder l'adresse et l'ABI
  const fs = require("fs");
  const axios = require("axios");
  const contractsDir = "./src/contracts";

  if (!fs.existsSync("./src")) {
    fs.mkdirSync("./src");
  }
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Vérifier s'il y a une ancienne adresse de contrat
  const contractAddressPath = contractsDir + "/contract-address.json";
  let oldAddress = null;

  if (fs.existsSync(contractAddressPath)) {
    try {
      const oldContractData = JSON.parse(fs.readFileSync(contractAddressPath, 'utf8'));
      oldAddress = oldContractData.NFTMarketplace;
      console.log("Ancienne adresse de contrat détectée:", oldAddress);
    } catch (error) {
      console.log("Impossible de lire l'ancienne adresse de contrat");
    }
  }

  // Sauvegarder la nouvelle adresse du contrat
  const contractData = {
    NFTMarketplace: nftMarketplace.address,
    deployedAt: new Date().toISOString(),
    previousAddress: oldAddress
  };

  fs.writeFileSync(
    contractAddressPath,
    JSON.stringify(contractData, undefined, 2)
  );

  console.log("Adresse du contrat sauvegardée dans src/contracts/");

  // Si nouvelle adresse différente, nettoyer les stats du serveur
  if (oldAddress && oldAddress !== nftMarketplace.address) {
    console.log("🧹 Nouveau contrat détecté, nettoyage des stats...");

    try {
      // Tenter de nettoyer les stats via l'API du serveur
      const response = await axios.delete('http://localhost:3000/api/stats/reset', {
        timeout: 5000,
        data: {
          contractAddress: nftMarketplace.address
        }
      });

      if (response.data.success) {
        console.log("✅ Stats nettoyées avec succès");
      } else {
        console.log("⚠️ Erreur lors du nettoyage des stats:", response.data);
      }
    } catch (error) {
      console.log("⚠️ Impossible de nettoyer les stats automatiquement:", error.message);
      console.log("💡 Vous pouvez nettoyer manuellement en appelant: DELETE http://localhost:3000/api/stats/reset");

      // Fallback: nettoyer directement le fichier local si le serveur n'est pas accessible
      const statsPath = "./server/nft-stats.json";
      if (fs.existsSync(statsPath)) {
        try {
          const cleanStats = {
            nfts: {},
            lastUpdated: new Date().toISOString(),
            contractAddress: nftMarketplace.address
          };
          fs.writeFileSync(statsPath, JSON.stringify(cleanStats, null, 2));
          console.log("✅ Fichier stats nettoyé directement");
        } catch (fileError) {
          console.log("❌ Erreur lors du nettoyage direct du fichier stats:", fileError.message);
        }
      }
    }
  } else if (oldAddress === nftMarketplace.address) {
    console.log("ℹ️ Même adresse de contrat, conservation des stats existantes");
  } else {
    console.log("ℹ️ Premier déploiement, aucun nettoyage nécessaire");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});