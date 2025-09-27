import { ethers } from 'ethers';

// Adresse de votre contrat déployé
import contractAddresses from '../contracts/contract-address.json';
const CONTRACT_ADDRESS = contractAddresses.NFTMarketplace;

// ABI minimal pour les fonctions nécessaires
const CONTRACT_ABI = [
    "function fetchMarketItems() public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed)[])",
    "function fetchAllMarketItems() public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed)[])",
    "function fetchMyNFTs() public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed)[])",
    "function fetchItemsListed() public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed)[])",
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "function createToken(string memory tokenURI, uint256 price) public payable returns (uint)",
    "function createMarketItem(uint256 tokenId, uint256 price) public payable",
    "function createMarketSale(uint256 tokenId) public payable",
    "function getListingPrice() public view returns (uint256)",
    "function withdrawListingItem(uint256 tokenId) public",
    "function getTokenCreator(uint256 tokenId) public view returns (address)",
    "function getMarketItem(uint256 tokenId) public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed))",
    "function totalSupply() public view returns (uint256)",
    "event MarketItemCreated(uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event MarketItemSold(uint256 indexed tokenId, address seller, address buyer, uint256 price)"
];

// Obtenir le contrat avec signer (pour les transactions)
export const getContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        return { contract, provider, signer };
    }
    throw new Error('MetaMask non détecté');
};

// Obtenir le contrat en lecture seule (sans wallet connecté)
export const getContractReadOnly = async () => {
    try {
        // Utiliser directement le provider RPC local
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        return { contract, provider };
    } catch (error) {
        console.error('Erreur getContractReadOnly:', error);
        throw new Error('Impossible de se connecter au réseau blockchain');
    }
};

// Fonction helper pour traiter un item de marché
const processMarketItem = async (contract, item) => {
    try {
        const tokenId = item.tokenId.toNumber();

        // Vérifier que le tokenId est valide (> 0)
        if (!tokenId || tokenId === 0) {
            console.warn('Token ID invalide:', tokenId);
            return null;
        }

        // Vérifier si on a des métadonnées locales (optionnel, pour améliorer l'affichage)
        let localNFT = null;
        try {
            const { getSubmittedNFTs } = await import('../utils/storage');
            const localNFTs = getSubmittedNFTs();
            localNFT = localNFTs.find(nft => nft.tokenId === tokenId.toString() && nft.blockchainStatus === 'minted');
            if (localNFT) {
                console.log(`Métadonnées locales trouvées pour token ${tokenId}`);
            }
        } catch (error) {
            console.log(`Pas de métadonnées locales pour token ${tokenId}`);
        }

        // Essayer de récupérer l'URI du token
        let tokenUri;
        try {
            tokenUri = await contract.tokenURI(tokenId);
        } catch (error) {
            console.warn(`Token URI inaccessible pour token ${tokenId}:`, error.message);
            // Ne pas retourner null, continuer avec des métadonnées par défaut
            tokenUri = null;
        }

        // Parser les métadonnées AVEC gestion d'erreur améliorée
        let metadata = {
            name: `NFT #${tokenId}`,
            description: "NFT disponible sur le marketplace",
            image: null
        };

        if (tokenUri) {
            try {
                if (tokenUri.startsWith('data:application/json;base64,')) {
                    const base64Data = tokenUri.replace('data:application/json;base64,', '');
                    metadata = JSON.parse(atob(base64Data));
                } else if (tokenUri.startsWith('ipfs://')) {
                    // Utilisation du proxy Vite pour éviter les CORS
                    const hash = tokenUri.replace('ipfs://', '');
                    const proxyUrl = `/ipfs-proxy/${hash}`;

                    try {
                        console.log(`📡 Fetch IPFS via proxy pour token ${tokenId}: ${proxyUrl}`);

                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000);

                        const response = await fetch(proxyUrl, {
                            signal: controller.signal,
                            headers: { 'Accept': 'application/json' }
                        });
                        clearTimeout(timeoutId);

                        if (response.ok) {
                            metadata = await response.json();
                            console.log(`✅ IPFS proxy réussi pour token ${tokenId}`);
                        } else {
                            console.warn(`❌ IPFS proxy échoué (${response.status}) pour token ${tokenId}`);
                        }
                    } catch (fetchError) {
                        console.warn(`❌ IPFS proxy erreur pour token ${tokenId}:`, fetchError.message);
                    }
                } else if (tokenUri.startsWith('http')) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000);

                        const response = await fetch(tokenUri, { signal: controller.signal });
                        clearTimeout(timeoutId);

                        if (response.ok) {
                            metadata = await response.json();
                        } else {
                            throw new Error(`HTTP ${response.status}`);
                        }
                    } catch (fetchError) {
                        console.warn(`HTTP fetch échoué pour ${tokenId}:`, fetchError.message);
                        // Garder les métadonnées par défaut
                    }
                }
            } catch (error) {
                console.warn(`Erreur parsing métadonnées pour token ${tokenId}:`, error.message);
                // Les métadonnées par défaut sont déjà définies
            }
        }
        
        // Utiliser les métadonnées locales si disponibles, sinon blockchain
        return {
            id: tokenId,
            tokenId: tokenId,
            name: localNFT ? localNFT.name : (metadata.name || `NFT #${tokenId}`),
            description: localNFT ? localNFT.description : (metadata.description || "NFT disponible sur le marketplace"),
            image: localNFT ? localNFT.image : metadata.image,
            price: parseFloat(ethers.utils.formatEther(item.price || 0)),
            // Logique d'affichage du propriétaire :
            // - Si en vente ET pas vendu : afficher le vendeur (celui qui a mis en vente)
            // - Sinon : afficher le vrai propriétaire
            owner: (item.listed && !item.sold) ? (item.seller || 'Inconnu') : (item.owner || 'Inconnu'),
            seller: item.seller || 'Inconnu',
            sold: item.sold || false,
            forSale: item.listed || false,
            category: localNFT ? localNFT.category : (metadata.category || "Digital Art"),
            likes: localNFT ? (localNFT.likes || 0) : 0,
            views: localNFT ? (localNFT.views || 0) : 0,
            createdAt: new Date().toISOString().split('T')[0],
            // IMPORTANT: Toujours marquer comme NFT blockchain
            isLocal: false,
            source: 'blockchain',
            blockchainStatus: 'minted'
        };
    } catch (error) {
        console.error(`Erreur traitement token ${item.tokenId}:`, error);
        return null;
    }
};

// Obtenir tous les NFTs en vente sur le marketplace (LECTURE SEULE)
export const fetchMarketplaceNFTs = async () => {
    try {
        const { contract } = await getContractReadOnly();

        // Test de connectivité simple
        try {
            await contract.getListingPrice();
            console.log('Contrat accessible');
        } catch (connectError) {
            console.warn('Contrat non accessible:', connectError.message);
            return [];
        }

        // Utiliser fetchAllMarketItems et filtrer côté client
        const data = await contract.fetchAllMarketItems();
        // Filtrer seulement les NFTs en vente (listed = true ET sold = false)
        const forSaleItems = data.filter(item => item.listed && !item.sold);
        console.log('Données brutes fetchAllMarketItems:', data);
        console.log('NFTs en vente filtrés:', forSaleItems);

        // Filtrer STRICTEMENT les items valides EN VENTE
        const validItems = forSaleItems.filter(item => {
            const tokenId = item.tokenId ? item.tokenId.toNumber() : 0;
            const isListed = item.listed === true;
            const isNotSold = item.sold === false;
            const hasValidId = tokenId > 0;

            console.log(`Token ${tokenId}: valid=${hasValidId}, listed=${isListed}, notSold=${isNotSold}`);

            return hasValidId && isListed && isNotSold;
        });

        console.log(`NFTs en vente trouvés: ${validItems.length}`);

        if (validItems.length === 0) {
            console.log('Aucun NFT en vente trouvé');
            return [];
        }

        const items = await Promise.all(
            validItems.map(item => processMarketItem(contract, item))
        );

        const finalItems = items.filter(item => item !== null);
        console.log(`NFTs en vente traités: ${finalItems.length}`);

        return finalItems;
    } catch (error) {
        console.error('Erreur fetchMarketplaceNFTs:', error);
        return [];
    }
};

// Obtenir TOUS les NFTs qui ont existé dans le marketplace (LECTURE SEULE)
export const fetchAllMarketplaceNFTs = async () => {
    try {
        const { contract } = await getContractReadOnly();

        // Test de connectivité simple
        try {
            await contract.getListingPrice();
            console.log('Contrat accessible pour fetchAllMarketItems');
        } catch (connectError) {
            console.warn('Contrat non accessible:', connectError.message);
            return [];
        }

        const data = await contract.fetchAllMarketItems();
        console.log('Données brutes fetchAllMarketItems (historique complet):', data);

        // Filtrer seulement les items avec des token IDs valides
        const validItems = data.filter(item => {
            const tokenId = item.tokenId ? item.tokenId.toNumber() : 0;
            const hasValidId = tokenId > 0;

            console.log(`Token ${tokenId}: valid=${hasValidId}, listed=${item.listed}, sold=${item.sold}`);

            return hasValidId;
        });

        console.log(`Total NFTs marketplace trouvés: ${validItems.length}`);

        if (validItems.length === 0) {
            console.log('Aucun NFT marketplace trouvé');
            return [];
        }

        const items = await Promise.all(
            validItems.map(item => processMarketItem(contract, item))
        );

        const finalItems = items.filter(item => item !== null);
        console.log(`Total NFTs marketplace traités: ${finalItems.length}`);

        return finalItems;
    } catch (error) {
        console.error('Erreur fetchAllMarketplaceNFTs:', error);
        return [];
    }
};

// Obtenir les NFTs possédés par l'utilisateur connecté (NÉCESSITE WALLET)
export const fetchUserNFTs = async (userAddress) => {
    try {
        const { contract } = await getContract();
        const data = await contract.fetchMyNFTs();
        
        console.log('Données fetchMyNFTs:', data);
        
        // Filtrer les items valides avant traitement
        const validItems = data.filter(item => {
            const tokenId = item.tokenId ? item.tokenId.toNumber() : 0;
            return tokenId > 0;
        });
        
        if (validItems.length === 0) {
            console.log('Aucun NFT valide trouvé pour cet utilisateur');
            return [];
        }
        
        const items = await Promise.all(
            validItems.map(item => processMarketItem(contract, item))
        );
        
        return items.filter(item => item !== null);
    } catch (error) {
        console.error('Erreur fetchUserNFTs:', error);
        return [];
    }
};

// Obtenir les NFTs listés par l'utilisateur (NÉCESSITE WALLET)
export const fetchUserListedNFTs = async () => {
    try {
        const { contract } = await getContract();

        // Vérifier d'abord que le contrat a la fonction
        if (!contract.fetchItemsListed) {
            console.warn('fetchItemsListed non disponible sur le contrat');
            return [];
        }

        const data = await contract.fetchItemsListed();

        console.log('Données fetchItemsListed:', data);

        // Si pas de données, retourner un tableau vide
        if (!data || data.length === 0) {
            console.log('Aucun NFT listé trouvé');
            return [];
        }

        // Filtrer STRICTEMENT les items valides ET encore en vente
        const validItems = data.filter(item => {
            const tokenId = item.tokenId ? item.tokenId.toNumber() : 0;
            const isListed = item.listed === true;
            const isNotSold = item.sold === false;

            console.log(`Token ${tokenId}: valid=${tokenId > 0}, listed=${isListed}, notSold=${isNotSold}`);

            return tokenId > 0 && isListed && isNotSold;
        });

        if (validItems.length === 0) {
            console.log('Aucun NFT listé valide trouvé');
            return [];
        }

        const items = await Promise.all(
            validItems.map(item => processMarketItem(contract, item))
        );

        return items.filter(item => item !== null);
    } catch (error) {
        console.error('Erreur fetchUserListedNFTs:', error);

        // Si c'est une erreur de revert, c'est probablement normal (pas de NFTs listés)
        if (error.code === 'CALL_EXCEPTION') {
            console.log('Aucun NFT listé par cet utilisateur (contrat revert normal)');
            return [];
        }

        // Pour les autres erreurs, les logger mais retourner un tableau vide
        return [];
    }
};

// Mettre un NFT en vente
export const listNFTForSale = async (tokenId, price) => {
    try {
        const { contract } = await getContract();
        
        // Obtenir le prix de listing
        const listingPrice = await contract.getListingPrice();
        
        // Convertir le prix en Wei
        const priceInWei = ethers.utils.parseEther(price.toString());
        
        const transaction = await contract.createMarketItem(tokenId, priceInWei, {
            value: listingPrice
        });
        
        await transaction.wait();
        return transaction;
    } catch (error) {
        console.error('Erreur mise en vente NFT:', error);
        throw error;
    }
};
export const buyNFT = async (tokenId, price) => {
    try {
        const { contract, provider, signer } = await getContract();

        // 1. Vérifier le solde de l'acheteur
        const buyerAddress = await signer.getAddress();
        const balance = await signer.getBalance();
        const priceInWei = ethers.utils.parseEther(price.toString());

        console.log('=== VÉRIFICATION ACHAT ===');
        console.log('Acheteur:', buyerAddress);
        console.log('Solde:', ethers.utils.formatEther(balance), 'ETH');
        console.log('Prix requis:', price, 'ETH');

        // Vérifier si l'acheteur a assez d'ETH (avec marge pour le gas)
        const gasEstimate = ethers.utils.parseEther('0.01'); // Estimation conservative du gas
        const totalRequired = priceInWei.add(gasEstimate);

        if (balance.lt(totalRequired)) {
            throw new Error(`Solde insuffisant. Vous avez ${ethers.utils.formatEther(balance)} ETH, mais ${ethers.utils.formatEther(totalRequired)} ETH sont requis (prix + gas estimé).`);
        }

        // 2. Récupérer les infos du NFT avant l'achat pour le suivi
        const marketItem = await contract.getMarketItem(tokenId);
        const seller = marketItem.seller;

        console.log('NFT Info avant achat:');
        console.log('Vendeur:', seller);
        console.log('Prix:', ethers.utils.formatEther(marketItem.price), 'ETH');

        // 3. Effectuer la transaction d'achat
        console.log('🛒 Lancement de l\'achat...');
        const transaction = await contract.createMarketSale(tokenId, {
            value: priceInWei,
            gasLimit: 500000 // Gas limit conservateur
        });

        console.log('Transaction d\'achat envoyée:', transaction.hash);
        const receipt = await transaction.wait();
        console.log('✅ Achat confirmé !');

        // 4. Enregistrer la transaction dans l'historique
        const transactionRecord = {
            id: `tx-${Date.now()}`,
            type: 'purchase',
            tokenId: tokenId,
            nftName: `NFT #${tokenId}`, // Sera mis à jour avec le vrai nom si disponible
            buyer: buyerAddress,
            seller: seller,
            price: parseFloat(price),
            priceETH: `${price} ETH`,
            transactionHash: transaction.hash,
            date: new Date().toISOString(),
            timestamp: Date.now(),
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };

        // Sauvegarder dans localStorage
        const existingHistory = JSON.parse(localStorage.getItem('nft-transactions') || '[]');
        existingHistory.unshift(transactionRecord); // Ajouter au début

        // Garder seulement les 100 dernières transactions
        if (existingHistory.length > 100) {
            existingHistory.splice(100);
        }

        localStorage.setItem('nft-transactions', JSON.stringify(existingHistory));

        console.log('📝 Transaction enregistrée dans l\'historique:', transactionRecord);

        return {
            transaction,
            receipt,
            transactionRecord
        };

    } catch (error) {
        console.error('Erreur achat NFT:', error);
        throw error;
    }
};

// Obtenir l'historique des transactions
export const getTransactionHistory = () => {
    try {
        const history = JSON.parse(localStorage.getItem('nft-transactions') || '[]');
        return history.sort((a, b) => b.timestamp - a.timestamp); // Trier par date décroissante
    } catch (error) {
        console.error('Erreur lecture historique:', error);
        return [];
    }
};

// Effacer l'historique des transactions
export const clearTransactionHistory = () => {
    localStorage.removeItem('nft-transactions');
};

// Obtenir les transactions pour un NFT spécifique
export const getNFTTransactionHistory = (tokenId) => {
    const allTransactions = getTransactionHistory();
    return allTransactions.filter(tx => tx.tokenId.toString() === tokenId.toString());
};

// Retirer un NFT de la vente
export const withdrawNFT = async (tokenId) => {
    try {
        const { contract } = await getContract();
        const transaction = await contract.withdrawListingItem(tokenId);
        await transaction.wait();
        return transaction;
    } catch (error) {
        console.error('Erreur retrait NFT:', error);
        throw error;
    }
};

// Obtenir les détails d'un NFT spécifique (LECTURE SEULE)
export const getNFTDetails = async (tokenId) => {
    try {
        const { contract } = await getContractReadOnly();

        // Vérifier que le tokenId est valide
        if (!tokenId || tokenId === 0) {
            throw new Error('Token ID invalide');
        }

        console.log(`getNFTDetails appelé pour token ID: ${tokenId}`);

        // D'abord, vérifier si on a des métadonnées locales pour ce token ID (pour récupérer la vraie image)
        const { getSubmittedNFTs } = await import('../utils/storage');
        const localNFTs = getSubmittedNFTs();
        const localNFT = localNFTs.find(nft => nft.tokenId === tokenId.toString() && nft.blockchainStatus === 'minted');
        
        // Récupérer les données du contrat
        const [marketItem, tokenURI, creator] = await Promise.all([
            contract.getMarketItem(tokenId).catch(() => null),
            contract.tokenURI(tokenId).catch(() => null),
            contract.getTokenCreator(tokenId).catch(() => null)
        ]);
        
        if (!tokenURI) {
            throw new Error('NFT non trouvé ou inaccessible');
        }
        
        // Parser les métadonnées avec gestion d'erreur robuste
        let metadata = {
            name: `NFT #${tokenId}`,
            description: "NFT créé sur votre marketplace",
            image: null
        };

        try {
            if (tokenURI.startsWith('data:application/json;base64,')) {
                const base64Data = tokenURI.replace('data:application/json;base64,', '');
                metadata = JSON.parse(atob(base64Data));
            } else if (tokenURI.startsWith('ipfs://')) {
                // Utilisation du proxy Vite pour éviter les CORS
                const hash = tokenURI.replace('ipfs://', '');
                const proxyUrl = `/ipfs-proxy/${hash}`;

                try {
                    console.log(`📡 Fetch IPFS details via proxy pour token ${tokenId}: ${proxyUrl}`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const response = await fetch(proxyUrl, {
                        signal: controller.signal,
                        headers: { 'Accept': 'application/json' }
                    });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        metadata = await response.json();
                        console.log(`✅ IPFS details proxy réussi pour token ${tokenId}`);
                    } else {
                        console.warn(`❌ IPFS details proxy échoué (${response.status}) pour token ${tokenId}`);
                    }
                } catch (fetchError) {
                    console.warn(`❌ IPFS details proxy erreur pour token ${tokenId}:`, fetchError.message);
                }
            } else if (tokenURI.startsWith('http')) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const response = await fetch(tokenURI, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        metadata = await response.json();
                    }
                } catch (fetchError) {
                    console.warn(`HTTP fetch échoué pour token ${tokenId}:`, fetchError.message);
                }
            }
        } catch (error) {
            console.warn(`Erreur parsing métadonnées token ${tokenId}:`, error.message);
        }
        
        return {
            id: tokenId,
            tokenId: parseInt(tokenId),
            name: localNFT ? localNFT.name : (metadata.name || `NFT #${tokenId}`),
            description: localNFT ? localNFT.description : (metadata.description || ""),
            image: localNFT ? localNFT.image : metadata.image, // Utiliser la vraie image si disponible
            price: marketItem ? parseFloat(ethers.utils.formatEther(marketItem.price)) : 0,
            // Même logique d'affichage du propriétaire pour les détails
            owner: marketItem && marketItem.listed && !marketItem.sold
                ? marketItem.seller
                : (marketItem ? marketItem.owner : creator),
            seller: marketItem ? marketItem.seller : null,
            creator: creator || 'Inconnu',
            sold: marketItem ? marketItem.sold : false,
            forSale: marketItem ? marketItem.listed : false,
            category: localNFT ? localNFT.category : (metadata.category || "Digital Art"),
            likes: localNFT ? localNFT.likes || 0 : 0,
            views: localNFT ? localNFT.views || 0 : 0,
            createdAt: new Date().toISOString().split('T')[0],
            // IMPORTANT: Marquer explicitement comme NFT blockchain
            isLocal: false,
            source: 'blockchain',
            blockchainStatus: 'minted',
            transfers: [
                {
                    from: "0x0000000000000000000000000000000000000000",
                    to: creator || 'Inconnu',
                    date: new Date().toISOString().split('T')[0],
                    price: null
                }
            ]
        };
    } catch (error) {
        console.error('Erreur getNFTDetails:', error);
        throw error;
    }
};

// Fonction pour récupérer l'historique des transferts d'un NFT
export const getNFTHistory = async (tokenId) => {
    try {
        const { contract, provider } = await getContractReadOnly();

        console.log(`Récupération historique pour NFT ${tokenId}`);

        // Récupérer tous les événements Transfer pour ce token
        const transferFilter = contract.filters.Transfer(null, null, tokenId);
        const transferEvents = await contract.queryFilter(transferFilter, 0, 'latest');

        // Récupérer tous les événements MarketItemCreated pour ce token
        const createdFilter = contract.filters.MarketItemCreated(tokenId);
        const createdEvents = await contract.queryFilter(createdFilter, 0, 'latest');

        // Récupérer tous les événements MarketItemSold pour ce token
        const soldFilter = contract.filters.MarketItemSold(tokenId);
        const soldEvents = await contract.queryFilter(soldFilter, 0, 'latest');

        // Construire l'historique complet
        const history = [];

        // Traiter les événements Transfer
        for (const event of transferEvents) {
            const block = await provider.getBlock(event.blockNumber);
            const transaction = await provider.getTransaction(event.transactionHash);

            let eventType = 'transfer';
            let price = null;

            // Déterminer le type d'événement
            if (event.args.from === '0x0000000000000000000000000000000000000000') {
                eventType = 'mint';
            }

            // Vérifier s'il y a un événement de vente correspondant
            const saleEvent = soldEvents.find(sale =>
                sale.transactionHash === event.transactionHash
            );

            if (saleEvent) {
                eventType = 'sale';
                price = parseFloat(ethers.utils.formatEther(saleEvent.args.price));
            }

            history.push({
                type: eventType,
                from: event.args.from,
                to: event.args.to,
                price: price,
                timestamp: block.timestamp,
                date: new Date(block.timestamp * 1000).toLocaleDateString('fr-FR'),
                time: new Date(block.timestamp * 1000).toLocaleTimeString('fr-FR'),
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        }

        // Traiter les événements MarketItemCreated (mises en vente)
        for (const event of createdEvents) {
            const block = await provider.getBlock(event.blockNumber);

            // Vérifier qu'il n'y a pas déjà un événement pour cette transaction
            const existingEvent = history.find(h => h.transactionHash === event.transactionHash);

            if (!existingEvent) {
                history.push({
                    type: 'listed',
                    from: event.args.seller,
                    to: null,
                    price: parseFloat(ethers.utils.formatEther(event.args.price)),
                    timestamp: block.timestamp,
                    date: new Date(block.timestamp * 1000).toLocaleDateString('fr-FR'),
                    time: new Date(block.timestamp * 1000).toLocaleTimeString('fr-FR'),
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber
                });
            }
        }

        // Trier par timestamp (plus ancien en premier pour avoir l'ordre chronologique)
        history.sort((a, b) => a.timestamp - b.timestamp);

        console.log(`Historique récupéré: ${history.length} événements`);
        return history;

    } catch (error) {
        console.error('Erreur getNFTHistory:', error);
        return [];
    }
};