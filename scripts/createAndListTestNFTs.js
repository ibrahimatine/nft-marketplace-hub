const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Création de NFTs de test et mise en vente...");

    // Get contract address
    const contractAddresses = JSON.parse(
        fs.readFileSync("./src/contracts/contract-address.json", "utf8")
    );
    const nftMarketplaceAddress = contractAddresses.NFTMarketplace;

    console.log("📍 Adresse du contrat:", nftMarketplaceAddress);

    // Get the contract factory
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    const marketplace = await NFTMarketplace.attach(nftMarketplaceAddress);

    // Get signers (test accounts)
    const [deployer, user1, user2] = await hre.ethers.getSigners();

    console.log("👤 Comptes de test:");
    console.log("Deployer:", deployer.address);
    console.log("User1:", user1.address);
    console.log("User2:", user2.address);

    // Get listing price
    const listingPrice = await marketplace.getListingPrice();
    console.log("💰 Prix de listing:", hre.ethers.utils.formatEther(listingPrice), "ETH");

    // Test NFTs data avec images fixes
    const testNFTs = [
        {
            name: "Digital Art Masterpiece",
            description: "Une œuvre d'art numérique exclusive créée spécialement pour cette marketplace",
            category: "Digital Art",
            price: "0.1", // ETH
            image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop&crop=center"
        },
        {
            name: "Abstract Creation #001",
            description: "Art abstrait moderne avec des couleurs vibrantes et des formes géométriques",
            category: "Abstract",
            price: "0.05", // ETH
            image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center"
        },
        {
            name: "Nature Photography",
            description: "Photographie haute résolution capturant la beauté de la nature",
            category: "Photography",
            price: "0.15", // ETH
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center"
        }
    ];

    console.log("🎨 Création de", testNFTs.length, "NFTs de test...");

    for (let i = 0; i < testNFTs.length; i++) {
        const nft = testNFTs[i];
        const signer = i === 0 ? deployer : (i === 1 ? user1 : user2);

        try {
            console.log(`\n--- NFT ${i + 1}: ${nft.name} ---`);
            console.log("👤 Créateur:", signer.address);

            // Create metadata JSON
            const metadata = {
                name: nft.name,
                description: nft.description,
                image: nft.image,
                external_url: "",
                attributes: [
                    {
                        trait_type: "Category",
                        value: nft.category
                    },
                    {
                        trait_type: "Creator",
                        value: `User${i + 1}`
                    },
                    {
                        trait_type: "Rarity",
                        value: i === 0 ? "Legendary" : (i === 1 ? "Rare" : "Common")
                    }
                ]
            };

            // Create base64 encoded token URI
            const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;

            console.log("📝 Métadonnées créées, longueur:", tokenURI.length);

            // Convert price to Wei
            const priceInWei = hre.ethers.utils.parseEther(nft.price);

            // Connect to contract with the specific signer
            const contractWithSigner = marketplace.connect(signer);

            // Create token and list it
            console.log("🔗 Création du token sur la blockchain...");
            const transaction = await contractWithSigner.createToken(tokenURI, priceInWei, {
                value: listingPrice,
                gasLimit: 1000000
            });

            console.log("⏳ Transaction envoyée:", transaction.hash);
            const receipt = await transaction.wait();

            // Extract token ID from events
            let tokenId = null;
            if (receipt.events) {
                const transferEvent = receipt.events.find(event => event.event === 'Transfer');
                if (transferEvent && transferEvent.args) {
                    tokenId = transferEvent.args.tokenId.toNumber();
                }
            }

            // Fallback: find from logs
            if (!tokenId && receipt.logs) {
                const transferLog = receipt.logs.find(log =>
                    log.topics.length >= 4 &&
                    log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
                );
                if (transferLog) {
                    tokenId = hre.ethers.BigNumber.from(transferLog.topics[3]).toNumber();
                }
            }

            console.log(`✅ NFT créé avec succès!`);
            console.log(`🎯 Token ID: ${tokenId || 'N/A'}`);
            console.log(`💰 Prix: ${nft.price} ETH`);
            console.log(`📦 Block: ${receipt.blockNumber}`);
            console.log(`⛽ Gas utilisé: ${receipt.gasUsed.toString()}`);

        } catch (error) {
            console.error(`❌ Erreur création NFT ${i + 1}:`, error.message);
        }
    }

    console.log("\n🎉 Processus terminé!");

    // Display marketplace stats
    try {
        const marketItems = await marketplace.fetchMarketItems();
        console.log(`📊 Total NFTs en vente: ${marketItems.length}`);

        for (let i = 0; i < marketItems.length; i++) {
            const item = marketItems[i];
            console.log(`   - Token #${item.tokenId.toNumber()}: ${hre.ethers.utils.formatEther(item.price)} ETH`);
        }
    } catch (error) {
        console.error("❌ Erreur récupération stats:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erreur script:", error);
        process.exit(1);
    });