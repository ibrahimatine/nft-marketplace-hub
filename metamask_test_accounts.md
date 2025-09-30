# 🦊 Configuration des comptes de test MetaMask

## 📋 Comptes de test Hardhat

Les tests ont créé des NFTs avec ces comptes Hardhat :

### 🎨 **Compte A - Seller (Vendeur)**
- **Adresse** : `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Clé privée** : `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Rôle** : A créé 3 NFTs, en a vendu 2

### 🛒 **Compte B - Buyer (Acheteur)**
- **Adresse** : `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- **Clé privée** : `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
- **Rôle** : A acheté 2 NFTs (Art #1, Art #2)

## 🔧 Import dans MetaMask

### 1. Ajouter le réseau Hardhat
```
Nom du réseau : Hardhat Local
RPC URL : http://127.0.0.1:8545
Chain ID : 1337
Symbole : ETH
```

### 2. Importer les comptes
1. **MetaMask** → **Importer un compte**
2. **Coller la clé privée** du compte souhaité
3. **Renommer** : "Test Seller" ou "Test Buyer"

## 🧪 Tests manuels

### Avec le compte Seller
- ✅ Voir 3 NFTs dans Explore (Tous)
- ✅ Voir 1 NFT dans Explore (En vente)
- ✅ Voir 2 NFTs dans Explore (Vendus)
- ✅ Portfolio vide ou avec NFT #3

### Avec le compte Buyer
- ✅ Voir 3 NFTs dans Explore (Tous)
- ✅ Boutons "Mettre en vente" sur Art #1 et #2
- ✅ Portfolio avec 2 NFTs

## ⚠️ Sécurité

**ATTENTION** : Ces clés privées sont publiques (Hardhat par défaut).
**NE JAMAIS** les utiliser sur un réseau principal !
**UNIQUEMENT** pour les tests locaux.