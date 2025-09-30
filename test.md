# Tests NFT Marketplace

## Tests de sélection de catégorie

### Test 1: Vérification de la catégorie par défaut
1. Aller sur `/submit`
2. Observer la catégorie sélectionnée par défaut
3. **Résultat attendu**: La catégorie "Digital Art" doit être sélectionnée
4. **Statut**: ✅ CORRIGÉ - La catégorie par défaut est maintenant synchronisée avec la première option disponible

### Test 2: Changement de catégorie
1. Aller sur `/submit`
2. Ouvrir le menu déroulant des catégories
3. Sélectionner "Gaming"
4. Remplir le formulaire et soumettre
5. **Résultat attendu**: Le NFT doit être créé avec la catégorie "Gaming"
6. **Statut**: ✅ À TESTER

### Test 3: Sauvegarde de la catégorie sélectionnée
1. Suivre les étapes du Test 2
2. Vérifier dans localStorage ou les détails du NFT
3. **Résultat attendu**: La catégorie "Gaming" doit être sauvegardée
4. **Statut**: ✅ À TESTER

### Test 4: Toutes les catégories disponibles
1. Aller sur `/submit`
2. Ouvrir le menu déroulant des catégories
3. Vérifier que toutes les catégories sont présentes sauf "Tous"
4. **Résultat attendu**: Categories disponibles:
   - Digital Art
   - Gaming
   - Abstract
   - Nature
   - Retro
   - Photography
   - 3D Art
5. **Statut**: ✅ À TESTER

## Tests du système de stats

### Test 5: Compteur de vues avec timer
1. Aller sur `/nft/1`
2. Attendre 10 secondes
3. Rafraîchir la page
4. **Résultat attendu**: Le compteur de vues doit s'incrémenter de 1
5. **Statut**: ✅ À TESTER

### Test 6: Système de likes
1. Aller sur `/nft/1`
2. Cliquer sur le bouton like
3. **Résultat attendu**: Le nombre de likes doit s'incrémenter
4. Cliquer à nouveau
5. **Résultat attendu**: Le nombre de likes doit se décrémenter
6. **Statut**: ✅ À TESTER

## Tests du portfolio (après suppression des contrôles)

### Test 7: Affichage sans contrôles
1. Aller sur `/portfolio`
2. Vérifier l'interface
3. **Résultat attendu**:
   - Pas d'onglets de navigation (Tous, Créés, En vente, Locaux)
   - Pas de contrôles d'affichage (masquer/afficher valeurs, vue grille/liste)
   - Affichage direct des NFTs
4. **Statut**: ✅ FAIT

### Test 8: Fonctionnalité des NFTs sans contrôles
1. Aller sur `/portfolio`
2. Cliquer sur un NFT
3. **Résultat attendu**: Navigation vers la page de détail du NFT
4. **Statut**: ✅ À TESTER

## Tests du serveur backend

### Test 9: API des stats
1. Tester `GET /api/nft/1/stats`
2. **Résultat attendu**: Retour des stats (views, likes, likedBy)
3. **Statut**: ✅ À TESTER

### Test 10: API recommandations
1. Tester `GET /api/recommendations`
2. **Résultat attendu**: Retour des NFTs recommandés pour la page d'accueil
3. **Statut**: ✅ À TESTER

## Comment tester

### Démarrage des services
```bash
# Terminal 1: Blockchain locale
npx hardhat node

# Terminal 2: Frontend + Serveur
npm run dev

# Ou séparément:
# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Serveur stats
npm run dev:server
```

### Vérifications
1. Frontend accessible sur http://localhost:5173
2. Serveur stats sur http://localhost:3000
3. Blockchain locale sur http://localhost:8545

### Tests manuels recommandés
1. **Test de bout en bout**: Créer un NFT avec catégorie "Gaming", vérifier qu'il apparaît avec la bonne catégorie
2. **Test des stats**: Visiter plusieurs NFTs, liker/disliker, vérifier la persistence
3. **Test du portfolio**: Naviguer dans le portfolio sans les contrôles supprimés
4. **Test du serveur**: Vérifier les logs du serveur pour les appels API

### Logs à surveiller
- Console du navigateur pour les erreurs frontend
- Terminal du serveur pour les requêtes API
- Terminal hardhat pour les transactions blockchain

## Tests du système de nettoyage automatique (NOUVEAU)

### Test 11: Nettoyage automatique lors du redéploiement
1. Démarrer le serveur stats: `npm run dev:server`
2. Exécuter le script de test: `node scripts/testContractReset.js`
3. **Résultat attendu**:
   - Stats créées puis nettoyées automatiquement
   - Nouvelle adresse de contrat enregistrée
   - Aucune donnée obsolète ne subsiste
4. **Statut**: ✅ À TESTER

### Test 12: Déploiement réel avec nettoyage
1. Ajouter quelques likes/vues à des NFTs existants
2. Redéployer le contrat: `npx hardhat run scripts/deploy.js --network localhost`
3. **Résultat attendu**:
   - Message de nettoyage affiché
   - Stats réinitialisées automatiquement
   - Nouvelle adresse sauvegardée
4. **Statut**: ✅ À TESTER

### Test 13: Détection côté frontend
1. Redéployer le contrat
2. Rafraîchir la page frontend
3. **Résultat attendu**:
   - Service de contrat détecte le changement
   - localStorage nettoyé automatiquement
   - Notification utilisateur (optionnelle)
4. **Statut**: ✅ À TESTER

---

**Date des tests**: $(date)
**Version**: Après correction du bug de catégorie, suppression des portfolio-controls, et ajout du système de nettoyage automatique