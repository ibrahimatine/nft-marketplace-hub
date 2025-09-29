const fs = require('fs-extra');
const path = require('path');

/**
 * Script pour installer les Git hooks automatiquement
 */

const HOOKS_SOURCE_DIR = path.join(__dirname, '..', '.githooks');
const HOOKS_TARGET_DIR = path.join(__dirname, '..', '.git', 'hooks');

async function installGitHooks() {
  try {
    console.log('🪝 Installation des Git hooks...');

    // Vérifier que nous sommes dans un repo Git
    if (!await fs.pathExists(HOOKS_TARGET_DIR)) {
      throw new Error('Répertoire .git/hooks non trouvé. Assurez-vous d\'être dans un repository Git.');
    }

    // Vérifier que le dossier source existe
    if (!await fs.pathExists(HOOKS_SOURCE_DIR)) {
      throw new Error('Répertoire .githooks non trouvé.');
    }

    // Lister les hooks à installer
    const hookFiles = await fs.readdir(HOOKS_SOURCE_DIR);

    for (const hookFile of hookFiles) {
      const sourcePath = path.join(HOOKS_SOURCE_DIR, hookFile);
      const targetPath = path.join(HOOKS_TARGET_DIR, hookFile);

      // Copier le hook
      await fs.copy(sourcePath, targetPath);

      // Rendre exécutable (Unix/Linux/Mac)
      try {
        await fs.chmod(targetPath, '755');
        console.log(`✅ Hook installé: ${hookFile}`);
      } catch (chmodError) {
        console.log(`✅ Hook installé: ${hookFile} (chmod non supporté sur Windows)`);
      }
    }

    console.log('🎉 Git hooks installés avec succès !');
    console.log('💡 Les statistiques du README seront mises à jour automatiquement avant chaque commit.');

  } catch (error) {
    console.error('❌ Erreur installation hooks:', error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  installGitHooks();
}

module.exports = { installGitHooks };