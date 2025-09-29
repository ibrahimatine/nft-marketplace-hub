const fs = require('fs-extra');
const path = require('path');
const https = require('https');

/**
 * Script pour mettre à jour automatiquement les statistiques dans le README.md
 */

const README_PATH = path.join(__dirname, '..', 'README.md');
const API_URL = 'http://localhost:3000/api/marketplace-stats';

/**
 * Récupère les statistiques depuis l'API
 */
async function fetchStats() {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET'
    };

    const req = require('http').request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const stats = JSON.parse(data);
          resolve(stats);
        } catch (error) {
          reject(new Error(`Erreur parsing JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Erreur requête API: ${error.message}`));
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout de la requête API'));
    });

    req.end();
  });
}

/**
 * Formate la date en français
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'GMT'
  };

  return date.toLocaleString('fr-FR', options).replace(',', ' à');
}

/**
 * Génère le contenu des statistiques (seulement NFTs en vente)
 */
function generateStatsContent(stats) {
  const formattedDate = formatDate(stats.lastUpdated);

  return `<!-- MARKETPLACE_STATS_START -->
- **NFTs en Vente**: ${stats.nftsForSale}
- **Dernière Mise à Jour**: ${formattedDate}
<!-- MARKETPLACE_STATS_END -->`;
}

/**
 * Met à jour le README avec les nouvelles statistiques
 */
async function updateReadme(stats) {
  try {
    // Lire le contenu actuel du README
    const readmeContent = await fs.readFile(README_PATH, 'utf-8');

    // Générer le nouveau contenu des stats
    const newStatsContent = generateStatsContent(stats);

    // Remplacer la section des statistiques
    const statsRegex = /<!-- MARKETPLACE_STATS_START -->[\s\S]*?<!-- MARKETPLACE_STATS_END -->/;

    if (!statsRegex.test(readmeContent)) {
      throw new Error('Section des statistiques non trouvée dans le README');
    }

    const updatedContent = readmeContent.replace(statsRegex, newStatsContent);

    // Mettre à jour aussi la date de mise à jour en bas
    const footerDateRegex = /\*Dernière mise à jour automatique : .*?\*/;
    const updatedContentWithFooter = updatedContent.replace(
      footerDateRegex,
      `*Dernière mise à jour automatique : ${formatDate(stats.lastUpdated)}*`
    );

    // Écrire le nouveau contenu
    await fs.writeFile(README_PATH, updatedContentWithFooter, 'utf-8');

    console.log('✅ README.md mis à jour avec succès !');
    console.log(`📊 Statistiques actualisées :
    - NFTs en Vente: ${stats.nftsForSale}
    - Dernière Mise à Jour: ${formatDate(stats.lastUpdated)}`);

  } catch (error) {
    throw new Error(`Erreur mise à jour README: ${error.message}`);
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Début de la mise à jour du README...');

  try {
    // Vérifier que le serveur est accessible
    console.log('📡 Récupération des statistiques...');
    const stats = await fetchStats();

    console.log('✅ Statistiques récupérées :', {
      totalNFTs: stats.totalNFTs,
      nftsForSale: stats.nftsForSale,
      lastUpdated: stats.lastUpdated
    });

    // Mettre à jour le README
    console.log('📝 Mise à jour du README...');
    await updateReadme(stats);

    console.log('🎉 Mise à jour terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour :', error.message);
    console.error('\n💡 Assurez-vous que :');
    console.error('   - Le serveur est démarré (npm run dev)');
    console.error('   - Le serveur écoute sur localhost:3000');
    console.error('   - La blockchain Hardhat est active');
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}

module.exports = { main, fetchStats, updateReadme };