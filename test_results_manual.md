# 🧪 Résultats des tests marketplace - Guide de vérification manuelle

## ✅ Tests automatisés réussis

**État actuel du marketplace** :
- ✅ **3 NFTs créés** par le Seller (Compte A: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`)
- ✅ **2 NFTs achetés** par le Buyer (Compte B: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`)
- ✅ **1 NFT encore en vente**

## 📊 État détaillé

| Token ID | Nom | Prix | Statut | Vendeur | Propriétaire actuel |
|----------|-----|------|--------|---------|-------------------|
| 1 | Art #1 | 1.0 ETH | **VENDU** | Seller | **Buyer** |
| 2 | Art #2 | 2.5 ETH | **VENDU** | Seller | **Buyer** |
| 3 | Art #3 | 0.5 ETH | **EN VENTE** | Seller | Contrat |

## 🔍 Tests manuels à effectuer

### 1. **Test avec le compte Seller** (`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`)

**Dans MetaMask** :
1. Connectez-vous avec ce compte
2. Assurez-vous d'être sur le réseau Hardhat (localhost:8545)

**Page Explore** :
- ✅ **Filtre "Tous"** → Doit afficher **3 NFTs** (Art #1, Art #2, Art #3)
- ✅ **Filtre "En vente"** → Doit afficher **1 NFT** (Art #3 uniquement)
- ✅ **Filtre "Vendus"** → Doit afficher **2 NFTs** (Art #1, Art #2)

**Propriétaire affiché** :
- Art #1 : Doit afficher **Buyer** comme propriétaire
- Art #2 : Doit afficher **Buyer** comme propriétaire
- Art #3 : Doit afficher **Seller** comme propriétaire

**Boutons d'action** :
- Art #1 : **PAS de bouton "Mettre en vente"** (appartient au Buyer)
- Art #2 : **PAS de bouton "Mettre en vente"** (appartient au Buyer)
- Art #3 : **Bouton "Retirer de la vente"** (toujours en vente)

### 2. **Test avec le compte Buyer** (`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`)

**Dans MetaMask** :
1. Connectez-vous avec ce compte
2. Assurez-vous d'être sur le réseau Hardhat (localhost:8545)

**Page Explore** :
- ✅ **Filtre "Tous"** → Doit afficher **3 NFTs** (Art #1, Art #2, Art #3)
- ✅ **Filtre "En vente"** → Doit afficher **1 NFT** (Art #3 uniquement)
- ✅ **Filtre "Vendus"** → Doit afficher **2 NFTs** (Art #1, Art #2)

**Propriétaire affiché** :
- Art #1 : Doit afficher **Buyer** comme propriétaire
- Art #2 : Doit afficher **Buyer** comme propriétaire
- Art #3 : Doit afficher **Seller** comme propriétaire

**Boutons d'action** :
- Art #1 : **Bouton "Mettre en vente"** (Buyer est propriétaire)
- Art #2 : **Bouton "Mettre en vente"** (Buyer est propriétaire)
- Art #3 : **Bouton "Acheter"** (appartient au Seller)

### 3. **Test Portfolio**

**Avec le compte Seller** :
- Portfolio → Doit être **vide** (tous les NFTs vendus sauf celui en vente)

**Avec le compte Buyer** :
- Portfolio → Doit afficher **2 NFTs** (Art #1, Art #2)

## 🎯 Résultats attendus

### ✅ Comportements corrects
1. **Explore montre TOUS les NFTs** qui ont existé (pas seulement ceux en vente)
2. **Filtres fonctionnent** correctement (Tous/En vente/Vendus)
3. **Propriétaire affiché** est le VRAI propriétaire (pas l'adresse du contrat)
4. **Boutons d'action** apparaissent seulement pour le propriétaire réel
5. **NFTs vendus restent visibles** dans Explore avec l'historique

### ❌ Problèmes à signaler
- Si des NFTs vendus n'apparaissent pas dans Explore
- Si les filtres ne fonctionnent pas correctement
- Si l'adresse du contrat apparaît comme propriétaire
- Si des boutons d'action apparaissent pour le mauvais utilisateur

## 🚀 Test supplémentaire

**Remettre un NFT acheté en vente** :
1. Avec le compte Buyer, aller sur Art #1 ou Art #2
2. Cliquer "Mettre en vente"
3. Définir un nouveau prix
4. Vérifier que le NFT réapparaît dans le filtre "En vente"

---

**IMPORTANT** : Ces tests valident que le marketplace fonctionne comme un véritable **historique public** où tous les NFTs créés restent visibles, mais seuls les propriétaires réels peuvent les gérer.