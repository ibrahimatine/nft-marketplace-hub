const hre = require("hardhat");

async function main() {
  console.log("🧪 === TEST DE REMISE EN VENTE ===");

  const contractAddress = require("../src/contracts/contract-address.json").NFTMarketplace;
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = NFTMarketplace.attach(contractAddress);

  const [accountA, accountB] = await hre.ethers.getSigners();
  console.log("Account A:", accountA.address);
  console.log("Account B:", accountB.address);

  try {
    // Vérifier l'état initial
    console.log("\n🔍 État initial:");
    const allItems = await marketplace.fetchAllMarketItems();
    allItems.forEach((item, index) => {
      console.log(`NFT ${item.tokenId.toNumber()}: Propriétaire=${item.owner}, Vendu=${item.sold}, EnVente=${item.listed}`);
    });

    // Account B (propriétaire du NFT #1) le remet en vente
    console.log("\n🔄 Account B remet NFT #1 en vente...");
    const listingPrice = await marketplace.getListingPrice();
    const resalePrice = hre.ethers.utils.parseEther("0.8"); // Prix plus élevé

    const resaleTx = await marketplace.connect(accountB).resellToken(1, resalePrice, {
      value: listingPrice,
      gasLimit: 3000000
    });
    await resaleTx.wait();
    console.log("✅ NFT #1 remis en vente pour 0.8 ETH");

    // Vérifier l'état après remise en vente
    console.log("\n🔍 État après remise en vente:");
    const allItemsAfter = await marketplace.fetchAllMarketItems();
    const marketItemsAfter = await marketplace.fetchMarketItems();

    allItemsAfter.forEach((item, index) => {
      console.log(`NFT ${item.tokenId.toNumber()}: Propriétaire=${item.owner}, Vendu=${item.sold}, EnVente=${item.listed}, Prix=${hre.ethers.utils.formatEther(item.price)} ETH`);
    });

    console.log(`\n✅ NFTs en vente: ${marketItemsAfter.length} (attendu: 2)`);

    if (marketItemsAfter.length === 2) {
      console.log("🎉 TEST RÉUSSI : Le NFT acheté peut être remis en vente !");
    } else {
      console.log("❌ ERREUR : La remise en vente ne fonctionne pas correctement");
    }

  } catch (error) {
    console.error("❌ ERREUR:", error.message);
    // Si resellToken n'existe pas, tester avec la fonction normale
    console.log("\n🔄 Test avec createMarketItem...");
    try {
      const listingPrice = await marketplace.getListingPrice();
      const resalePrice = hre.ethers.utils.parseEther("0.8");

      // Approuver le contrat pour le token
      const tx1 = await marketplace.connect(accountB).approve(contractAddress, 1);
      await tx1.wait();

      const tx2 = await marketplace.connect(accountB).createMarketItem(1, resalePrice, {
        value: listingPrice
      });
      await tx2.wait();
      console.log("✅ NFT #1 remis en vente via createMarketItem");
    } catch (error2) {
      console.error("❌ ERREUR ALTERNATIVE:", error2.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });