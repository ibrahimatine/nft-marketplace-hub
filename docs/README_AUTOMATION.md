# 📋 Documentation Automatique du README

Ce guide explique comment utiliser le système de mise à jour automatique des statistiques dans le README.md.

## 🎯 Fonctionnalités

Le système met à jour automatiquement dans le README :
- **Nombre total de NFTs**
- **NFTs sur la blockchain**
- **NFTs locaux**
- **NFTs en vente** ⭐ **(En temps réel !)**
- **Utilisateurs actifs**
- **Volume total**
- **Date de dernière mise à jour**

## 🔧 Commandes Disponibles

### Mise à jour manuelle
```bash
npm run update-readme-stats
```
Met à jour les statistiques du README une seule fois.

### Mode surveillance
```bash
npm run update-readme-watch
```
Met à jour automatiquement le README à chaque changement dans `server/nft-stats.json`.

### Installation des hooks Git
```bash
npm run install-git-hooks
```
Installe le hook `pre-commit` qui met à jour le README avant chaque commit.

## 🚀 Configuration Automatique

### Installation initiale
Les hooks Git sont installés automatiquement lors de `npm install` grâce au script `postinstall`.

### Hook pre-commit
Le hook `pre-commit` :
1. ✅ Vérifie si le serveur est accessible
2. 📊 Met à jour les statistiques du README
3. ➕ Ajoute automatiquement README.md au commit
4. ✨ Continue le commit normalement

## 📊 Source des Données

Les statistiques proviennent de l'endpoint API :
```
GET http://localhost:3000/api/marketplace-stats
```

### Données récupérées :
```json
{
  "totalNFTs": 7,
  "blockchainNFTs": 3,
  "localNFTs": 4,
  "nftsForSale": 2,
  "totalUsers": 2,
  "totalVolume": "0 ETH",
  "contractAddress": "0x5FbDB...",
  "lastUpdated": "2025-09-29T02:33:49.648Z"
}
```

## 🛠️ Configuration du Serveur

Pour que la mise à jour fonctionne, le serveur doit être démarré :

```bash
npm run dev
```

Le serveur écoute sur `localhost:3000` et se connecte automatiquement à :
- **Blockchain Hardhat** (localhost:8545)
- **Contrat NFTMarketplace** (adresse dans `src/contracts/contract-address.json`)

## 📝 Format du README

Les statistiques sont insérées entre ces commentaires :
```markdown
<!-- MARKETPLACE_STATS_START -->
- **NFTs Totaux**: 7
- **NFTs sur Blockchain**: 3
- **NFTs Locaux**: 4
- **NFTs en Vente**: 2
- **Utilisateurs Actifs**: 2
- **Volume Total**: 0 ETH
- **Dernière Mise à Jour**: 29/09/2025 04:33:49
<!-- MARKETPLACE_STATS_END -->
```

## 🔄 Workflow de Développement

### Développement normal
1. Démarrer le serveur : `npm run dev`
2. Les statistiques sont mises à jour en temps réel
3. Commits automatiques avec stats à jour

### Mode surveillance active
```bash
# Terminal 1 : Serveur principal
npm run dev

# Terminal 2 : Surveillance README
npm run update-readme-watch
```

### Avant un commit important
```bash
# Forcer la mise à jour
npm run update-readme-stats

# Vérifier le README
git diff README.md
```

## 🚨 Résolution de Problèmes

### Erreur "Serveur non accessible"
```bash
# Vérifier que le serveur tourne
curl http://localhost:3000/api/marketplace-stats

# Redémarrer si nécessaire
npm run dev
```

### Erreur "Section statistiques non trouvée"
Vérifiez que le README contient les commentaires :
- `<!-- MARKETPLACE_STATS_START -->`
- `<!-- MARKETPLACE_STATS_END -->`

### Hook pre-commit ne fonctionne pas
```bash
# Réinstaller les hooks
npm run install-git-hooks

# Vérifier l'installation
ls -la .git/hooks/pre-commit
```

### Stats incorrectes
```bash
# Vérifier la blockchain
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Vérifier le contrat
cat src/contracts/contract-address.json
```

## 📈 Métriques Avancées

### Fréquence de mise à jour
- **Manuel** : À la demande
- **Watch** : À chaque changement de stats
- **Pre-commit** : À chaque commit
- **Cache API** : 30 secondes

### Performance
- Temps de récupération : ~100ms
- Temps d'écriture README : ~10ms
- Impact commit : +200ms

## 🎨 Personnalisation

### Modifier le format des statistiques
Éditer `scripts/updateReadmeStats.js` ligne 45 :
```javascript
function generateStatsContent(stats) {
  return `<!-- MARKETPLACE_STATS_START -->
- **Mon Format Custom**: ${stats.totalNFTs}
<!-- MARKETPLACE_STATS_END -->`;
}
```

### Ajouter de nouvelles métriques
1. Modifier l'endpoint `/api/marketplace-stats` dans `server/server.js`
2. Mettre à jour `generateStatsContent()`
3. Tester avec `npm run update-readme-stats`

### Changer la fréquence du cache
Modifier `src/services/marketplaceStatsService.js` ligne 45 :
```javascript
return async (cacheTime = 60000) => { // 60 secondes au lieu de 30
```

## 🔗 Intégration CI/CD

### GitHub Actions
```yaml
- name: Update README Stats
  run: |
    npm install
    npm run update-readme-stats
    git add README.md
    git commit -m "📊 Update marketplace stats" || exit 0
```

### Automatisation locale
```bash
# Crontab pour mise à jour toutes les heures
0 * * * * cd /path/to/project && npm run update-readme-stats
```

---

**💡 Tip :** Pour un README toujours à jour, lancez `npm run update-readme-watch` en arrière-plan pendant le développement !