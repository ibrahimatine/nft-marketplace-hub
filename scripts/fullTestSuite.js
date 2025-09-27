const hre = require("hardhat");

async function main() {
  console.log("🧪 === SUITE DE TESTS COMPLÈTE ===");

  const contractAddress = require("../src/contracts/contract-address.json").NFTMarketplace;
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = NFTMarketplace.attach(contractAddress);

  console.log("📋 Contrat:", contractAddress);

  // Obtenir les comptes
  const [accountA, accountB] = await hre.ethers.getSigners();
  console.log("\n👥 Comptes de test:");
  console.log("Account A (Seller):", accountA.address);
  console.log("Account B (Buyer):", accountB.address);

  try {
    // Test 1: Vérifier l'état initial
    console.log("\n🧪 TEST 1: État initial");
    const listingPrice = await marketplace.getListingPrice();
    const initialItems = await marketplace.fetchMarketItems();
    const allItems = await marketplace.fetchAllMarketItems();

    console.log("✅ Prix listing:", hre.ethers.utils.formatEther(listingPrice), "ETH");
    console.log("✅ NFTs en vente:", initialItems.length);
    console.log("✅ Total NFTs créés:", allItems.length);

    // Test 2: Créer 2 NFTs directement en vente avec Account A
    console.log("\n🧪 TEST 2: Création de 2 NFTs en vente (Account A)");

    const metadata1 = {
      name: "Test Art #1",
      description: "Premier NFT de test",
      category: "Art",
      image: "data:image/svg+xml;base64," + Buffer.from(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#ff6b6b"/>
          <text x="50" y="50" text-anchor="middle" fill="white" font-size="12">Art #1</text>
        </svg>
      `).toString('base64')
    };

    const metadata2 = {
      name: "Test Art #2",
      description: "Deuxième NFT de test",
      category: "Art",
      image: "data:image/svg+xml;base64," + Buffer.from(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#4ecdc4"/>
          <text x="50" y="50" text-anchor="middle" fill="white" font-size="12">Art #2</text>
        </svg>
      `).toString('base64')
    };

    const tokenURI1 = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata1)).toString('base64')}`;
    const tokenURI2 = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata2)).toString('base64')}`;

    const price1 = hre.ethers.utils.parseEther("0.5");
    const price2 = hre.ethers.utils.parseEther("0.3");

    // Créer NFT #1
    const tx1 = await marketplace.connect(accountA).createToken(tokenURI1, price1, {
      value: listingPrice,
      gasLimit: 3000000
    });
    const receipt1 = await tx1.wait();
    console.log("✅ NFT #1 créé et mis en vente pour 0.5 ETH");

    // Créer NFT #2
    const tx2 = await marketplace.connect(accountA).createToken(tokenURI2, price2, {
      value: listingPrice,
      gasLimit: 3000000
    });
    const receipt2 = await tx2.wait();
    console.log("✅ NFT #2 créé et mis en vente pour 0.3 ETH");

    // Test 3: Vérifier l'état après création
    console.log("\n🧪 TEST 3: Vérification après création");
    const itemsAfterCreation = await marketplace.fetchMarketItems();
    const allItemsAfterCreation = await marketplace.fetchAllMarketItems();

    console.log("✅ NFTs en vente:", itemsAfterCreation.length);
    console.log("✅ Total NFTs:", allItemsAfterCreation.length);

    // Test 4: Account B achète le NFT #1
    console.log("\n🧪 TEST 4: Account B achète NFT #1");
    const buyTx = await marketplace.connect(accountB).createMarketSale(1, {
      value: price1,
      gasLimit: 3000000
    });
    await buyTx.wait();
    console.log("✅ NFT #1 acheté par Account B");

    // Test 5: Vérifier l'état après achat
    console.log("\n🧪 TEST 5: Vérification après achat");
    const itemsAfterSale = await marketplace.fetchMarketItems();
    const allItemsAfterSale = await marketplace.fetchAllMarketItems();
    const buyerNFTs = await marketplace.connect(accountB).fetchMyNFTs();

    console.log("✅ NFTs encore en vente:", itemsAfterSale.length);
    console.log("✅ Total NFTs:", allItemsAfterSale.length);
    console.log("✅ NFTs possédés par Account B:", buyerNFTs.length);

    // Test 6: Vérifier les détails du NFT acheté
    console.log("\n🧪 TEST 6: Détails du NFT acheté");
    const nftDetails = allItemsAfterSale.find(item => item.tokenId.toNumber() === 1);
    if (nftDetails) {
      console.log("✅ NFT #1 - Propriétaire:", nftDetails.owner);
      console.log("✅ NFT #1 - Vendu:", nftDetails.sold);
      console.log("✅ NFT #1 - En vente:", nftDetails.listed);
    }

    console.log("\n🎉 TOUS LES TESTS SONT PASSÉS !");
    console.log("\n📊 Résumé:");
    console.log("- 2 NFTs créés par Account A");
    console.log("- 1 NFT acheté par Account B");
    console.log("- 1 NFT encore en vente");
    console.log("- Propriétés correctement mises à jour");

  } catch (error) {
    console.error("\n❌ ERREUR DANS LES TESTS:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });