# Test du workflow IPFS - Images stockées sur IPFS

## ✅ Configuration actuelle

### Services IPFS
- **Service principal** : `src/services/ipfsService.js` avec Pinata
- **Helpers** : `src/utils/ipfsHelpers.js` pour l'affichage
- **Configuration** : Clés API Pinata déjà configurées

### Workflow SubmitNFT
1. **Upload image vers IPFS** : `uploadImageToIPFS(file)`
2. **Création métadonnées** : avec URL IPFS de l'image
3. **Upload métadonnées vers IPFS** : `uploadMetadataToIPFS(metadata)`
4. **Stockage local** : Image locale + URI IPFS pour référence

### Workflow Migration (NFTDetail)
- ✅ **Nouveau** : Vérifie `nft.ipfsTokenURI` existant
- ✅ **Fallback** : Génère base64 si pas d'IPFS

### Affichage (NFTCard)
- ✅ **Helper** : `getNFTImageUrl(nft)` gère les URLs IPFS
- ✅ **Priorité** : Image locale → IPFS → placeholder

## 🧪 Tests à effectuer

### 1. Création NFT local
```
1. Aller sur /submit
2. Uploader une image
3. Remplir les données
4. Soumettre SANS "Mettre en vente"
5. Vérifier : NFT sauvé avec ipfsTokenURI
```

### 2. Création NFT direct blockchain
```
1. Aller sur /submit
2. Uploader une image
3. Cocher "Mettre en vente"
4. Soumettre
5. Vérifier : NFT créé avec URI IPFS
```

### 3. Migration NFT local → blockchain
```
1. Créer NFT local (test 1)
2. Aller sur /nft/local-{id}
3. Cliquer "Migrer vers blockchain"
4. Vérifier : Utilise URI IPFS existant
```

### 4. Affichage images
```
1. Portfolio : vérifier images des NFTs IPFS
2. Explore : vérifier images marketplace
3. NFTDetail : vérifier image dans détails
```

## 🎯 Avantages IPFS

- ✅ **Gas réduit** : TokenURI compact vs base64 volumineux
- ✅ **Décentralisé** : Images stockées sur IPFS
- ✅ **Performance** : Passerelle Pinata rapide
- ✅ **Standard** : URI `ipfs://hash` compatible ERC721

## 🔧 URLs IPFS utilisées

- **Passerelle** : `https://gateway.pinata.cloud/ipfs/{hash}`
- **Format** : `ipfs://{hash}` dans les contrats
- **Backup** : Image locale pour affichage immédiat