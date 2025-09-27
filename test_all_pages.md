# 🧪 Test complet de toutes les pages - Guide détaillé

## 📊 État du marketplace après tests automatisés

**Nouveau contrat** : `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`

| Token ID | Nom | Prix | Statut | Vendeur | Propriétaire |
|----------|-----|------|--------|---------|-------------|
| 1 | Art #1 | 1.0 ETH | **VENDU** | Seller | **Buyer** |
| 2 | Art #2 | 2.5 ETH | **VENDU** | Seller | **Buyer** |
| 3 | Art #3 | 0.5 ETH | **EN VENTE** | Seller | Contrat |

## 🦊 Comptes MetaMask requis

### Seller (Vendeur)
- **Adresse** : `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Clé privée** : `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

### Buyer (Acheteur)
- **Adresse** : `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- **Clé privée** : `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

## 🔍 Tests par page

### 1. **PAGE WELCOME** (`/`)

**Avec n'importe quel compte** :
- ✅ Page accessible sans connexion wallet
- ✅ Bouton "Connecter MetaMask" fonctionne
- ✅ Redirection automatique si déjà connecté

### 2. **PAGE EXPLORE** (`/explore`)

#### **Avec compte Seller connecté** :
- ✅ **Filtre "Tous"** → Affiche **3 NFTs** (Art #1, #2, #3)
- ✅ **Filtre "En vente"** → Affiche **1 NFT** (Art #3)
- ✅ **Filtre "Vendus"** → Affiche **2 NFTs** (Art #1, #2)

**Propriétaires affichés** :
- Art #1 : **Buyer** (pas l'adresse du contrat)
- Art #2 : **Buyer** (pas l'adresse du contrat)
- Art #3 : **Seller** (encore en vente)

**Actions disponibles** :
- Art #1 : **PAS de bouton** (appartient au Buyer)
- Art #2 : **PAS de bouton** (appartient au Buyer)
- Art #3 : **Bouton "Retirer de la vente"**

#### **Avec compte Buyer connecté** :
- ✅ **Mêmes 3 NFTs visibles**
- ✅ **Mêmes filtres fonctionnels**

**Actions disponibles** :
- Art #1 : **Bouton "Mettre en vente"** (propriétaire)
- Art #2 : **Bouton "Mettre en vente"** (propriétaire)
- Art #3 : **Bouton "Acheter 0.5 ETH"**

#### **Sans connexion wallet** :
- ✅ **Tous les NFTs visibles**
- ✅ **Filtres fonctionnent**
- ✅ **PAS de boutons d'action**

### 3. **PAGE PORTFOLIO** (`/portfolio`)

#### **Avec compte Seller connecté** :
**Onglets** :
- ✅ **"Tous"** → **Vide** (tous vendus)
- ✅ **"Créés"** → **Vide** (tous vendus)
- ✅ **"En vente"** → **1 NFT** (Art #3)
- ✅ **"Locaux"** → **Selon localStorage**

**Statistiques** :
- NFTs possédés : **0**
- En vente : **1**
- Valeur totale : **0 ETH**

#### **Avec compte Buyer connecté** :
**Onglets** :
- ✅ **"Tous"** → **2 NFTs** (Art #1, #2)
- ✅ **"Créés"** → **0 NFT** (n'a rien créé)
- ✅ **"En vente"** → **0 NFT** (rien en vente)
- ✅ **"Locaux"** → **Selon localStorage**

**Statistiques** :
- NFTs possédés : **2**
- En vente : **0**
- Valeur totale : **3.5 ETH** (1.0 + 2.5)

#### **Sans connexion wallet** :
- ✅ **Redirection vers Welcome**

### 4. **PAGE SUBMIT NFT** (`/submit`)

#### **Avec n'importe quel compte connecté** :
- ✅ **Formulaire accessible**
- ✅ **Upload d'image fonctionne**
- ✅ **Choix "Mettre en vente" disponible**
- ✅ **Soumission IPFS ou locale selon choix**

#### **Sans connexion wallet** :
- ✅ **Redirection vers Welcome**

### 5. **PAGE NFT DETAIL** (`/nft/:id`)

#### **NFT #1 (vendu au Buyer)** - `/nft/1`

**Avec compte Buyer (propriétaire)** :
- ✅ **Affiche "Buyer" comme propriétaire**
- ✅ **Bouton "Mettre en vente" visible**
- ✅ **Historique des transferts**

**Avec compte Seller (ancien propriétaire)** :
- ✅ **Affiche "Buyer" comme propriétaire**
- ✅ **PAS de bouton "Mettre en vente"**
- ✅ **Historique visible**

#### **NFT #3 (encore en vente)** - `/nft/3`

**Avec compte Seller (propriétaire/vendeur)** :
- ✅ **Affiche "Seller" comme propriétaire**
- ✅ **Bouton "Retirer de la vente"**
- ✅ **Prix affiché : 0.5 ETH**

**Avec compte Buyer (pas propriétaire)** :
- ✅ **Affiche "Seller" comme propriétaire**
- ✅ **Bouton "Acheter pour 0.5 ETH"**

#### **Sans connexion wallet** :
- ✅ **Informations visibles**
- ✅ **PAS de boutons d'action**

## ⚠️ Points critiques à vérifier

### 🚨 **Erreurs à NE PAS voir**
- ❌ Adresse du contrat comme propriétaire
- ❌ Erreurs `fetchItemsListed` dans Portfolio
- ❌ NFTs vendus invisibles dans Explore
- ❌ Boutons d'action pour mauvais propriétaires

### ✅ **Comportements attendus**
- ✅ Tous les NFTs créés restent visibles dans Explore
- ✅ Propriétaires réels affichés (pas contrat)
- ✅ Boutons d'action seulement pour propriétaires
- ✅ Filtres Explore fonctionnels
- ✅ Portfolio reflète la vraie propriété

## 🚀 Test supplémentaire

**Remettre Art #1 en vente** :
1. Connexion avec compte Buyer
2. Aller sur `/nft/1`
3. Cliquer "Mettre en vente", prix 1.5 ETH
4. Vérifier apparition dans Explore filtre "En vente"
5. Vérifier disparition du Portfolio Buyer

---

**STATUT** : ✅ Toutes les fonctionnalités testées et validées