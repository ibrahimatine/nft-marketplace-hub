const hre = require("hardhat");

async function main() {
  console.log("🧪 === TEST COMPLET DU MARKETPLACE ===");

  // Obtenir les comptes de test
  const [deployer, seller, buyer] = await hre.ethers.getSigners();

  console.log("\n👥 Comptes de test:");
  console.log("Deployer:", deployer.address);
  console.log("Seller (Compte A):", seller.address);
  console.log("Buyer (Compte B):", buyer.address);

  // Obtenir le contrat déployé
  const contractAddress = require("../src/contracts/contract-address.json").NFTMarketplace;
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = NFTMarketplace.attach(contractAddress);

  console.log("\n📋 Contrat marketplace:", contractAddress);

  try {
    // TEST 1: Créer des NFTs avec le compte Seller
    console.log("\n🎨 === TEST 1: CRÉATION DE NFTs (Compte A) ===");

    const listingPrice = await marketplace.getListingPrice();
    console.log("Prix de listing:", hre.ethers.utils.formatEther(listingPrice), "ETH");

    // Créer 3 NFTs avec le compte seller (métadonnées simplifiées)
    const nfts = [
      {
        name: "Art #1",
        description: "Test NFT 1",
        price: "1.0"
      },
      {
        name: "Art #2",
        description: "Test NFT 2",
        price: "2.5"
      },
      {
        name: "Art #3",
        description: "Test NFT 3",
        price: "0.5"
      }
    ];

    const createdTokens = [];

    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i];

      // Créer les métadonnées JSON simplifiées
      const metadata = {
        name: nft.name,
        description: nft.description,
        image: `data:image/svg+xml;base64,${Buffer.from(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#667eea"/><text x="50" y="50" text-anchor="middle" fill="white">${nft.name}</text></svg>`).toString('base64')}`,
        category: "Digital Art"
      };

      const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
      const price = hre.ethers.utils.parseEther(nft.price);

      console.log(`\n📝 Création NFT ${i + 1}: ${nft.name} - ${nft.price} ETH`);

      // Créer et lister le NFT directement
      const tx = await marketplace.connect(seller).createToken(tokenURI, price, {
        value: listingPrice,
        gasLimit: 2000000
      });

      const receipt = await tx.wait();

      // Extraire le token ID
      const transferLog = receipt.logs.find(log =>
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );

      if (transferLog) {
        const tokenId = hre.ethers.BigNumber.from(transferLog.topics[3]).toString();
        createdTokens.push({
          tokenId,
          name: nft.name,
          price: nft.price
        });
        console.log(`✅ NFT créé avec Token ID: ${tokenId}`);
      }
    }

    console.log(`\n🎉 ${createdTokens.length} NFTs créés et mis en vente !`);

    // TEST 2: Vérifier les NFTs en vente
    console.log("\n🛒 === TEST 2: VÉRIFICATION MARKETPLACE ===");

    const marketItems = await marketplace.fetchMarketItems();
    console.log(`📊 NFTs en vente sur le marketplace: ${marketItems.length}`);

    marketItems.forEach((item, index) => {
      console.log(`  ${index + 1}. Token ID: ${item.tokenId.toString()}, Prix: ${hre.ethers.utils.formatEther(item.price)} ETH`);
    });

    // TEST 3: Acheter des NFTs avec le compte Buyer
    console.log("\n💰 === TEST 3: ACHAT DE NFTs (Compte B) ===");

    // Acheter les 2 premiers NFTs
    for (let i = 0; i < Math.min(2, createdTokens.length); i++) {
      const token = createdTokens[i];
      const price = hre.ethers.utils.parseEther(token.price);

      console.log(`\n🛍️ Achat ${token.name} (Token ID: ${token.tokenId}) - ${token.price} ETH`);

      const buyTx = await marketplace.connect(buyer).createMarketSale(token.tokenId, {
        value: price,
        gasLimit: 300000
      });

      await buyTx.wait();
      console.log(`✅ Achat réussi !`);
    }

    // TEST 4: Vérifier l'état final
    console.log("\n📊 === TEST 4: ÉTAT FINAL DU MARKETPLACE ===");

    // Tous les NFTs (nouvelle fonction)
    const allItems = await marketplace.fetchAllMarketItems();
    console.log(`\n🎯 Total NFTs créés: ${allItems.length}`);

    allItems.forEach((item, index) => {
      const status = item.sold ? "VENDU" : (item.listed ? "EN VENTE" : "POSSÉDÉ");
      console.log(`  ${index + 1}. Token ID: ${item.tokenId.toString()}, Prix: ${hre.ethers.utils.formatEther(item.price)} ETH, Statut: ${status}`);
      console.log(`     Vendeur: ${item.seller}, Propriétaire: ${item.owner}`);
    });

    // NFTs encore en vente
    const stillForSale = await marketplace.fetchMarketItems();
    console.log(`\n🏪 NFTs encore en vente: ${stillForSale.length}`);

    // NFTs possédés par le buyer
    const buyerNFTs = await marketplace.connect(buyer).fetchMyNFTs();
    console.log(`\n🎒 NFTs possédés par Buyer: ${buyerNFTs.length}`);

    // NFTs possédés par le seller
    const sellerNFTs = await marketplace.connect(seller).fetchMyNFTs();
    console.log(`\n🎨 NFTs possédés par Seller: ${sellerNFTs.length}`);

    console.log("\n🎉 === TESTS TERMINÉS AVEC SUCCÈS ===");
    console.log("\n📋 Résumé:");
    console.log(`- ${createdTokens.length} NFTs créés`);
    console.log(`- 2 NFTs achetés`);
    console.log(`- ${stillForSale.length} NFT(s) encore en vente`);
    console.log(`- Buyer possède ${buyerNFTs.length} NFT(s)`);
    console.log(`- Seller possède ${sellerNFTs.length} NFT(s)`);

    console.log("\n🔄 MAINTENANT:");
    console.log("1. Connectez-vous avec le compte Seller sur l'interface");
    console.log("2. Allez sur Explore → Vous devriez voir tous les NFTs");
    console.log("3. Testez les filtres: Tous/En vente/Vendus");
    console.log("4. Connectez-vous avec le compte Buyer");
    console.log("5. Vérifiez que seul Buyer voit les boutons de mise en vente pour SES NFTs");

  } catch (error) {
    console.error("❌ Erreur durant les tests:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });