const hre = require("hardhat");

async function main() {
  console.log("🧪 === TEST DES FONCTIONS contract.js ===");

  // Simuler l'import des fonctions
  const contractPath = "../src/utils/contract.js";

  try {
    // Test les fonctions principales utilisées par l'interface
    console.log("\n🔄 Test de fetchAllMarketplaceNFTs...");

    const contractAddress = require("../src/contracts/contract-address.json").NFTMarketplace;
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    const marketplace = NFTMarketplace.attach(contractAddress);

    // Simuler fetchAllMarketplaceNFTs
    const allItems = await marketplace.fetchAllMarketItems();
    console.log("✅ Tous les NFTs:", allItems.length);

    allItems.forEach((item, index) => {
      console.log(`📦 NFT ${item.tokenId.toNumber()}:`);
      console.log(`   Propriétaire: ${item.owner}`);
      console.log(`   Vendu: ${item.sold}`);
      console.log(`   En vente: ${item.listed}`);
      console.log(`   Prix: ${hre.ethers.utils.formatEther(item.price)} ETH`);
    });

    // Simuler fetchMarketplaceNFTs (seulement ceux en vente)
    console.log("\n🔄 Test de fetchMarketplaceNFTs...");
    const marketItems = await marketplace.fetchMarketItems();
    console.log("✅ NFTs en vente:", marketItems.length);

    console.log("\n🎯 VALIDATION DE LA LOGIQUE :");

    // Vérifier qu'il y a bien un NFT vendu et un en vente
    const soldNFTs = allItems.filter(item => item.sold);
    const forSaleNFTs = allItems.filter(item => item.listed && !item.sold);

    console.log(`✅ NFTs vendus: ${soldNFTs.length} (attendu: 1)`);
    console.log(`✅ NFTs en vente: ${forSaleNFTs.length} (attendu: 1)`);

    if (soldNFTs.length === 1 && forSaleNFTs.length === 1) {
      console.log("🎉 LOGIQUE CORRECTE : 1 vendu + 1 en vente = 2 total");
    } else {
      console.log("❌ ERREUR LOGIQUE");
    }

  } catch (error) {
    console.error("❌ ERREUR:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });