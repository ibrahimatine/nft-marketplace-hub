const { ethers } = require("hardhat");

async function main() {
  // Récupérer l'adresse du contrat
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Récupérer le contrat déployé
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = NFTMarketplace.attach(contractAddress);

  console.log("Création de NFTs de test...");

  // Obtenir le prix de listing
  const listingPrice = await marketplace.getListingPrice();
  console.log("Prix de listing:", ethers.utils.formatEther(listingPrice), "ETH");

  // Créer plusieurs NFTs de test
  const testNFTs = [
    {
      name: "Test NFT 1",
      description: "Premier NFT de test visible dans tous les navigateurs",
      image: "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=NFT+1",
      price: "0.5"
    },
    {
      name: "Test NFT 2",
      description: "Deuxième NFT de test pour tester la visibilité",
      image: "https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=NFT+2",
      price: "1.0"
    },
    {
      name: "Test NFT 3",
      description: "Troisième NFT de test avec prix différent",
      image: "https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=NFT+3",
      price: "2.5"
    }
  ];

  for (let i = 0; i < testNFTs.length; i++) {
    const nft = testNFTs[i];

    // Créer les métadonnées JSON
    const metadata = {
      name: nft.name,
      description: nft.description,
      image: nft.image,
      category: "Test"
    };

    // Encoder en base64
    const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
    const price = ethers.utils.parseEther(nft.price);

    console.log(`\nCréation de ${nft.name}...`);
    console.log("Prix:", nft.price, "ETH");
    console.log("TokenURI length:", tokenURI.length);

    try {
      const transaction = await marketplace.createToken(tokenURI, price, {
        value: listingPrice,
        gasLimit: 1000000
      });

      const receipt = await transaction.wait();
      console.log(`✅ ${nft.name} créé ! Hash: ${transaction.hash}`);

      // Extraire le token ID depuis les logs
      const transferLog = receipt.logs.find(log =>
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );

      if (transferLog) {
        const tokenId = ethers.BigNumber.from(transferLog.topics[3]).toString();
        console.log(`   Token ID: ${tokenId}`);
      }

    } catch (error) {
      console.error(`❌ Erreur création ${nft.name}:`, error.message);
    }
  }

  console.log("\n🎉 Création des NFTs de test terminée !");
  console.log("Ces NFTs devraient maintenant être visibles dans tous les navigateurs.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur:", error);
    process.exit(1);
  });