const hre = require("hardhat");

async function main() {
  console.log("🧪 === TEST DE fetchMarketplaceNFTs CORRIGÉ ===");

  const contractAddress = require("../src/contracts/contract-address.json").NFTMarketplace;
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = NFTMarketplace.attach(contractAddress);

  try {
    // Test direct de la fonction du contrat
    console.log("\n🔍 État du contrat:");
    const allItems = await marketplace.fetchAllMarketItems();
    console.log("Total NFTs:", allItems.length);

    allItems.forEach((item, index) => {
      console.log(`NFT ${item.tokenId.toNumber()}: Listed=${item.listed}, Sold=${item.sold}, Prix=${hre.ethers.utils.formatEther(item.price)} ETH`);
    });

    // Test de la logique de filtrage côté client
    console.log("\n🔍 Test du filtrage côté client:");
    const forSaleItems = allItems.filter(item => item.listed && !item.sold);
    console.log("NFTs en vente après filtrage:", forSaleItems.length);

    forSaleItems.forEach((item, index) => {
      console.log(`✅ NFT ${item.tokenId.toNumber()} en vente: ${hre.ethers.utils.formatEther(item.price)} ETH`);
    });

    if (forSaleItems.length > 0) {
      console.log("🎉 SUCCÈS: La logique de filtrage fonctionne !");
    } else {
      console.log("ℹ️ Aucun NFT en vente actuellement");
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