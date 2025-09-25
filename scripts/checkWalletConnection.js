const hre = require("hardhat");

async function main() {
    console.log("🔍 Vérification des comptes Hardhat...");

    // Get signers
    const signers = await hre.ethers.getSigners();

    console.log("📊 Comptes disponibles:");
    for (let i = 0; i < Math.min(signers.length, 5); i++) {
        const signer = signers[i];
        const balance = await signer.getBalance();
        const balanceEth = hre.ethers.utils.formatEther(balance);

        console.log(`${i + 1}. ${signer.address}`);
        console.log(`   Solde: ${balanceEth} ETH`);
        console.log(`   Private Key: ${signer._signingKey ? signer._signingKey.privateKey : 'N/A'}`);
        console.log("");
    }

    console.log("💡 Instructions pour connecter MetaMask:");
    console.log("1. Ouvrir MetaMask");
    console.log("2. Ajouter un réseau personnalisé:");
    console.log("   - Nom: Hardhat Local");
    console.log("   - RPC URL: http://127.0.0.1:8545");
    console.log("   - Chain ID: 1337 (0x539)");
    console.log("   - Symbole: ETH");
    console.log("3. Importer un compte avec l'une des clés privées ci-dessus");
    console.log("4. Aller sur http://localhost:5175");
    console.log("5. Connecter le wallet");
    console.log("6. Naviguer vers /submit");

    console.log("\n🎯 Compte recommandé pour les tests:");
    if (signers.length > 0) {
        const testAccount = signers[0];
        console.log(`Adresse: ${testAccount.address}`);
        console.log(`Clé privée: ${testAccount._signingKey ? testAccount._signingKey.privateKey : 'N/A'}`);

        const balance = await testAccount.getBalance();
        console.log(`Solde: ${hre.ethers.utils.formatEther(balance)} ETH`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erreur:", error);
        process.exit(1);
    });