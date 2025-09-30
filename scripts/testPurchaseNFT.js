const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🛒 Test d'achat de NFT...");

    // Get contract address
    const contractAddresses = JSON.parse(
        fs.readFileSync("./src/contracts/contract-address.json", "utf8")
    );
    const nftMarketplaceAddress = contractAddresses.NFTMarketplace;

    console.log("📍 Adresse du contrat:", nftMarketplaceAddress);

    // Get the contract factory
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    const marketplace = await NFTMarketplace.attach(nftMarketplaceAddress);

    // Get signers
    const [deployer, buyer] = await hre.ethers.getSigners();

    console.log("👤 Comptes:");
    console.log("Deployer:", deployer.address);
    console.log("Buyer:", buyer.address);

    // Get available NFTs
    console.log("\n📊 NFTs disponibles sur le marketplace:");
    const marketItems = await marketplace.fetchMarketItems();

    if (marketItems.length === 0) {
        console.log("❌ Aucun NFT disponible à l'achat");
        return;
    }

    for (let i = 0; i < marketItems.length; i++) {
        const item = marketItems[i];
        const tokenId = item.tokenId.toNumber();
        const price = hre.ethers.utils.formatEther(item.price);
        const seller = item.seller;

        console.log(`   - Token #${tokenId}: ${price} ETH (vendeur: ${seller.substring(0, 8)}...)`);

        // Get token URI to show metadata
        try {
            const tokenURI = await marketplace.tokenURI(tokenId);
            if (tokenURI.startsWith('data:application/json;base64,')) {
                const base64Data = tokenURI.replace('data:application/json;base64,', '');
                const metadata = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf8'));
                console.log(`     📝 "${metadata.name}" - ${metadata.description.substring(0, 50)}...`);
            }
        } catch (error) {
            console.log(`     📝 Métadonnées non accessibles`);
        }
    }

    // Try to buy the cheapest NFT
    const cheapestNFT = marketItems.reduce((prev, current) =>
        prev.price.lt(current.price) ? prev : current
    );

    const tokenId = cheapestNFT.tokenId.toNumber();
    const price = cheapestNFT.price;
    const priceEth = hre.ethers.utils.formatEther(price);

    console.log(`\n🎯 Tentative d'achat du NFT le moins cher:`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Prix: ${priceEth} ETH`);
    console.log(`   Vendeur: ${cheapestNFT.seller.substring(0, 8)}...`);

    // Check buyer's balance
    const buyerBalance = await buyer.getBalance();
    const buyerBalanceEth = hre.ethers.utils.formatEther(buyerBalance);
    console.log(`   Solde acheteur: ${buyerBalanceEth} ETH`);

    if (buyerBalance.lt(price)) {
        console.log("❌ Solde insuffisant pour l'achat");
        return;
    }

    try {
        // Connect with buyer account
        const contractWithBuyer = marketplace.connect(buyer);

        console.log("🔗 Envoi de la transaction d'achat...");
        const transaction = await contractWithBuyer.createMarketSale(tokenId, {
            value: price,
            gasLimit: 500000
        });

        console.log("⏳ Transaction envoyée:", transaction.hash);
        const receipt = await transaction.wait();

        console.log("✅ Achat réussi !");
        console.log(`📦 Block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas utilisé: ${receipt.gasUsed.toString()}`);

        // Check new ownership
        const newOwner = await marketplace.ownerOf(tokenId);
        console.log(`👤 Nouveau propriétaire: ${newOwner}`);
        console.log(`✅ Vérification: ${newOwner.toLowerCase() === buyer.address.toLowerCase() ? 'CORRECT' : 'ERREUR'}`);

        // Check marketplace stats after purchase
        const marketItemsAfter = await marketplace.fetchMarketItems();
        console.log(`📊 NFTs restants en vente: ${marketItemsAfter.length}`);

    } catch (error) {
        console.error("❌ Erreur lors de l'achat:", error.message);

        if (error.message.includes("Please submit the asking price")) {
            console.log("💡 Conseil: Vérifiez que le prix exact est envoyé");
        } else if (error.message.includes("Item not listed")) {
            console.log("💡 Conseil: Le NFT n'est plus en vente");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erreur script:", error);
        process.exit(1);
    });