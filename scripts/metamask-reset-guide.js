// Guide de réinitialisation MetaMask pour résoudre les erreurs RPC

console.log('%c🦊 GUIDE RÉINITIALISATION METAMASK', 'font-size: 20px; font-weight: bold; color: #f6851b;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f6851b;');

console.log('\n%c📋 ÉTAPES À SUIVRE DANS L\'ORDRE :', 'font-size: 16px; font-weight: bold; color: #333;');

console.log('\n%c1️⃣ RÉINITIALISER LE COMPTE METAMASK', 'font-size: 14px; font-weight: bold; color: #e74c3c;');
console.log('   📱 Ouvrez MetaMask');
console.log('   ⚙️  Paramètres → Avancé → Réinitialiser le compte');
console.log('   ✅ Confirmez la réinitialisation');
console.log('   ⚠️  IMPORTANT: Cela effacera l\'historique des transactions locales');

console.log('\n%c2️⃣ VÉRIFIER LE RÉSEAU', 'font-size: 14px; font-weight: bold; color: #3498db;');
console.log('   🌐 Vérifiez que vous êtes sur "Localhost 8545"');
console.log('   📡 Chain ID: 1337 (0x539)');
console.log('   🔗 RPC URL: http://127.0.0.1:8545');

console.log('\n%c3️⃣ RECHARGER L\'APPLICATION', 'font-size: 14px; font-weight: bold; color: #27ae60;');
console.log('   🔄 Appuyez sur F5 ou Ctrl+R');
console.log('   🔌 Reconnectez votre wallet');

console.log('\n%c4️⃣ TESTER LA CONNEXION', 'font-size: 14px; font-weight: bold; color: #9b59b6;');
console.log('   ✅ Testez la création/migration d\'un NFT');
console.log('   ✅ Vérifiez que les erreurs RPC ont disparu');

console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f6851b;');

console.log('\n%c🎯 INFORMATIONS TECHNIQUES', 'font-size: 14px; font-weight: bold; color: #2c3e50;');
console.log('📍 Contrat déployé à:', '0x5FbDB2315678afecb367f032d93F642f64180aa3');
console.log('💰 Prix de listing:', '0.025 ETH');
console.log('🆔 Chain ID:', '1337');
console.log('🌐 Network:', 'Hardhat Local');

console.log('\n%c🆘 EN CAS DE PROBLÈME', 'font-size: 14px; font-weight: bold; color: #e67e22;');
console.log('1. Vérifiez que Hardhat node tourne bien (port 8545)');
console.log('2. Redémarrez Hardhat node : npx hardhat node');
console.log('3. Redéployez le contrat : npx hardhat run scripts/resetMarketplace.js --network localhost');
console.log('4. Répétez les étapes MetaMask ci-dessus');

console.log('\n%c✨ Votre blockchain est maintenant synchronisée !', 'font-size: 16px; font-weight: bold; color: #27ae60;');