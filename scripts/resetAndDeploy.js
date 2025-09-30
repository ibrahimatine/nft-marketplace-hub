const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔄 Réinitialisation complète du marketplace...\n");

  // 1. Déployer le contrat
  console.log("📋 Déploiement du contrat NFTMarketplace...");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();
  await marketplace.deployed();

  console.log("✅ NFTMarketplace déployé à l'adresse:", marketplace.address);

  // 2. Sauvegarder l'adresse
  const contractAddresses = {
    NFTMarketplace: marketplace.address
  };

  const addressPath = path.join(__dirname, '../src/contracts/contract-address.json');
  fs.writeFileSync(addressPath, JSON.stringify(contractAddresses, null, 2));
  console.log("✅ Adresse sauvegardée dans", addressPath);

  // 3. Vérifier le contrat
  const listingPrice = await marketplace.getListingPrice();
  console.log("✅ Prix de listing:", ethers.utils.formatEther(listingPrice), "ETH");

  // 4. Créer quelques NFTs de test
  console.log("\n🎨 Création de NFTs de test...");

  const testNFTs = [
    {
      name: "Cosmic Cat",
      description: "Un chat cosmique naviguant dans l'espace",
      image: "https://via.placeholder.com/400x400/9B59B6/FFFFFF?text=🐱",
      price: "0.1"
    },
    {
      name: "Digital Sunrise",
      description: "Lever de soleil dans un monde numérique",
      image: "https://via.placeholder.com/400x400/E67E22/FFFFFF?text=🌅",
      price: "0.5"
    },
    {
      name: "Neon City",
      description: "Ville futuriste aux couleurs néon",
      image: "https://via.placeholder.com/400x400/1ABC9C/FFFFFF?text=🏙️",
      price: "1.0"
    }
  ];

  for (let i = 0; i < testNFTs.length; i++) {
    const nft = testNFTs[i];

    const metadata = {
      name: nft.name,
      description: nft.description,
      image: nft.image,
      category: "Digital Art"
    };

    const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
    const price = ethers.utils.parseEther(nft.price);

    try {
      const tx = await marketplace.createToken(tokenURI, price, {
        value: listingPrice,
        gasLimit: 1000000
      });

      const receipt = await tx.wait();

      // Extraire token ID
      const transferLog = receipt.logs.find(log =>
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );

      const tokenId = transferLog ? ethers.BigNumber.from(transferLog.topics[3]).toString() : 'inconnu';

      console.log(`✅ ${nft.name} créé (Token ID: ${tokenId}) - Prix: ${nft.price} ETH`);

    } catch (error) {
      console.error(`❌ Erreur création ${nft.name}:`, error.message);
    }
  }

  console.log("\n🎉 Réinitialisation terminée !");
  console.log("\n📋 Instructions pour MetaMask :");
  console.log("1. Ouvrez MetaMask");
  console.log("2. Paramètres → Avancé → Réinitialiser le compte");
  console.log("3. Actualisez la page web");
  console.log("\nLe marketplace est maintenant prêt à être utilisé ! 🚀");

  // Afficher un résumé
  const balance = await ethers.provider.getBalance(await marketplace.signer.getAddress());
  console.log("\n📊 Résumé :");
  console.log("- Contrat :", marketplace.address);
  console.log("- Solde deployer :", ethers.utils.formatEther(balance), "ETH");
  console.log("- NFTs créés :", testNFTs.length);
  console.log("- Total value :", testNFTs.reduce((sum, nft) => sum + parseFloat(nft.price), 0), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });