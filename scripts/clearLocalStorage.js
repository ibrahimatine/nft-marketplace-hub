const fs = require('fs');
const path = require('path');

// Simuler le clear du localStorage en supprimant le fichier de storage local s'il existe
const localStorageFile = path.join(__dirname, '..', 'src', 'utils', 'localStorageData.json');

if (fs.existsSync(localStorageFile)) {
    fs.unlinkSync(localStorageFile);
    console.log('✅ NFTs locaux supprimés');
} else {
    console.log('ℹ️ Aucun NFT local trouvé');
}

console.log('🧹 Clear des NFTs locaux terminé');