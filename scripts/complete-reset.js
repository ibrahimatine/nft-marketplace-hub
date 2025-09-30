const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function completeReset() {
  console.log('🔄 RESET COMPLET DU SYSTÈME');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Arrêter tous les processus Node.js qui utilisent le port 8545
  console.log('\n1️⃣ Arrêt des processus Hardhat...');
  try {
    if (process.platform === 'win32') {
      exec('netstat -ano | findstr :8545', (error, stdout, stderr) => {
        if (stdout) {
          const lines = stdout.split('\n');
          lines.forEach(line => {
            const match = line.match(/\s+(\d+)$/);
            if (match) {
              const pid = match[1];
              exec(`taskkill /PID ${pid} /F`, () => {
                console.log(`   ✅ Processus ${pid} arrêté`);
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.log('   ⚠️ Nettoyage des processus terminé');
  }

  // Attendre un peu
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n2️⃣ Instructions OBLIGATOIRES MetaMask:');
  console.log('   🦊 Ouvrez MetaMask');
  console.log('   ⚙️  Paramètres → Avancé → "Réinitialiser le compte"');
  console.log('   ✅ Confirmez la réinitialisation');
  console.log('   🔄 Fermez complètement le navigateur');
  console.log('   🌐 Relancez le navigateur');

  console.log('\n3️⃣ Redémarrage automatique Hardhat dans 5 secondes...');
  console.log('   (Appuyez Ctrl+C pour annuler)');

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n4️⃣ Démarrage Hardhat node...');

  const hardhatProcess = exec('npx hardhat node', (error, stdout, stderr) => {
    if (error) {
      console.error('Erreur Hardhat:', error);
      return;
    }
  });

  // Attendre que Hardhat démarre
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n5️⃣ Déploiement du contrat...');
  exec('npx hardhat run scripts/resetMarketplace.js --network localhost', (error, stdout, stderr) => {
    if (error) {
      console.error('Erreur déploiement:', error);
      return;
    }
    console.log(stdout);

    console.log('\n🎉 RESET TERMINÉ !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 PROCHAINES ÉTAPES:');
    console.log('1. Vérifiez que MetaMask est bien réinitialisé');
    console.log('2. Rechargez votre application (F5)');
    console.log('3. Reconnectez votre wallet');
    console.log('4. Testez la création/migration d\'un NFT');
    console.log('');
    console.log('✨ Gas limit augmenté à 8M pour éviter les erreurs');
  });
}

completeReset().catch(console.error);