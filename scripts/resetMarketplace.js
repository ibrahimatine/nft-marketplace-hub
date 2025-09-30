// scripts/resetMarketplace.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔄 Reset complet du marketplace NFT...");
  
  // 1. Déployer un nouveau contrat
  console.log("📦 Déploiement d'un nouveau contrat...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();
  
  console.log("✅ Nouveau contrat déployé à:", nftMarketplace.address);
  
  // 2. Sauvegarder la nouvelle adresse
  const contractsDir = "./src/contracts";
  if (!fs.existsSync("./src")) {
    fs.mkdirSync("./src");
  }
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ NFTMarketplace: nftMarketplace.address }, undefined, 2)
  );

  console.log("💾 Nouvelle adresse sauvegardée");
  
  // 3. Vérifier que le contrat est vierge
  try {
    const marketItems = await nftMarketplace.fetchMarketItems();
    console.log("📊 NFTs dans le nouveau contrat:", marketItems.length);
    
    const listingPrice = await nftMarketplace.getListingPrice();
    console.log("💰 Prix de listing:", hre.ethers.utils.formatEther(listingPrice), "ETH");
    
  } catch (error) {
    console.error("❌ Erreur vérification contrat:", error);
  }
  
  console.log("\n🎉 Reset terminé ! Votre marketplace est maintenant vierge.");
  console.log("📋 Actions recommandées :");
  console.log("   1. Rechargez votre application web (F5)");
  console.log("   2. Vérifiez que MetaMask est connecté au bon réseau");
  console.log("   3. Créez de nouveaux NFTs pour tester");
}

main().catch((error) => {
  console.error("❌ Erreur lors du reset:", error);
  process.exitCode = 1;
});