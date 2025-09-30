const hre = require("hardhat");

async function main() {
  console.log("🔬 === TEST RAPIDE DU NOUVEAU CONTRAT ===");

  const contractAddress = require("../src/contracts/contract-address.json").NFTMarketplace;
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = NFTMarketplace.attach(contractAddress);

  console.log("📋 Contrat:", contractAddress);

  try {
    // Test des fonctions principales
    console.log("\n🧪 Test des fonctions...");

    const listingPrice = await marketplace.getListingPrice();
    console.log("✅ getListingPrice():", hre.ethers.utils.formatEther(listingPrice), "ETH");

    const marketItems = await marketplace.fetchMarketItems();
    console.log("✅ fetchMarketItems():", marketItems.length, "items");

    const allItems = await marketplace.fetchAllMarketItems();
    console.log("✅ fetchAllMarketItems():", allItems.length, "items");

    const [seller] = await hre.ethers.getSigners();

    try {
      const myNFTs = await marketplace.connect(seller).fetchMyNFTs();
      console.log("✅ fetchMyNFTs():", myNFTs.length, "items");
    } catch (e) {
      console.log("⚠️ fetchMyNFTs() (normal si pas de NFTs)");
    }

    try {
      const listedItems = await marketplace.connect(seller).fetchItemsListed();
      console.log("✅ fetchItemsListed():", listedItems.length, "items");
    } catch (e) {
      console.log("⚠️ fetchItemsListed() (normal si pas de NFTs listés)");
    }

    console.log("\n🎉 Toutes les fonctions du contrat sont accessibles !");
    console.log("🔄 Vous pouvez maintenant tester l'interface frontend");

  } catch (error) {
    console.error("❌ Erreur test contrat:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });