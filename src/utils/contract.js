import { ethers } from 'ethers';

// Adresse de votre contrat déployé
import contractAddresses from '../contracts/contract-address.json';
const CONTRACT_ADDRESS = contractAddresses.NFTMarketplace;

// ABI minimal pour les fonctions nécessaires
const CONTRACT_ABI = [
    "function fetchMarketItems() public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed)[])",
    "function fetchMyNFTs() public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed)[])",
    "function fetchItemsListed() public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed)[])",
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "function createToken(string memory tokenURI, uint256 price) public payable returns (uint)",
    "function createMarketSale(uint256 tokenId) public payable",
    "function getListingPrice() public view returns (uint256)",
    "function withdrawListingItem(uint256 tokenId) public",
    "function getTokenCreator(uint256 tokenId) public view returns (address)",
    "function getMarketItem(uint256 tokenId) public view returns (tuple(uint256 tokenId, address seller, address owner, uint256 price, bool sold, bool listed))",
    "event MarketItemCreated(uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold)"
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

        // Essayer de récupérer l'URI du token
        let tokenUri;
        try {
            tokenUri = await contract.tokenURI(tokenId);
        } catch (error) {
            console.warn(`Token URI inaccessible pour token ${tokenId}:`, error.message);
            return null;
        }

        // Parser les métadonnées
        let metadata = {};
        try {
            if (tokenUri.startsWith('data:application/json;base64,')) {
                const base64Data = tokenUri.replace('data:application/json;base64,', '');
                metadata = JSON.parse(atob(base64Data));
            } else if (tokenUri.startsWith('http')) {
                const response = await fetch(tokenUri);
                metadata = await response.json();
            } else {
                throw new Error('Format URI non supporté');
            }
        } catch (error) {
            console.warn(`Erreur parsing métadonnées pour token ${tokenId}:`, error);
            metadata = {
                name: `NFT #${tokenId}`,
                description: "NFT créé sur votre marketplace",
                image: `https://picsum.photos/400/400?random=${tokenId}`
            };
        }
        
        return {
            id: tokenId,
            tokenId: tokenId,
            name: metadata.name || `NFT #${tokenId}`,
            description: metadata.description || "",
            image: metadata.image || `https://picsum.photos/400/400?random=${tokenId}`,
            price: parseFloat(ethers.utils.formatEther(item.price || 0)),
            owner: item.owner || 'Inconnu',
            seller: item.seller || 'Inconnu',
            sold: item.sold || false,
            forSale: item.listed || false,
            category: metadata.category || "Digital Art",
            attributes: metadata.attributes || [],
            likes: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 1000),
            createdAt: new Date().toISOString().split('T')[0]
        };
    } catch (error) {
        console.error(`Erreur traitement token ${item.tokenId}:`, error);
        return null;
    }
};

// Obtenir tous les NFTs du marketplace (LECTURE SEULE)
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
        
        const data = await contract.fetchMarketItems();
        console.log('Données brutes fetchMarketItems:', data);
        
        // Filtrer STRICTEMENT les items valides
        const validItems = data.filter(item => {
            const tokenId = item.tokenId ? item.tokenId.toNumber() : 0;
            const isListed = item.listed === true;
            const isNotSold = item.sold === false;
            const hasValidId = tokenId > 0;
            
            console.log(`Token ${tokenId}: valid=${hasValidId}, listed=${isListed}, notSold=${isNotSold}`);
            
            return hasValidId && isListed && isNotSold;
        });
        
        console.log(`Items valides trouvés: ${validItems.length}`);
        
        if (validItems.length === 0) {
            console.log('Aucun NFT de marketplace valide trouvé');
            return [];
        }
        
        const items = await Promise.all(
            validItems.map(item => processMarketItem(contract, item))
        );
        
        const finalItems = items.filter(item => item !== null);
        console.log(`Items finaux traités: ${finalItems.length}`);
        
        return finalItems;
    } catch (error) {
        console.error('Erreur fetchMarketplaceNFTs:', error);
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
        const data = await contract.fetchItemsListed();
        
        console.log('Données fetchItemsListed:', data);
        
        // Filtrer les items valides
        const validItems = data.filter(item => {
            const tokenId = item.tokenId ? item.tokenId.toNumber() : 0;
            const isListed = item.listed === true;
            return tokenId > 0 && isListed;
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
        const { contract } = await getContract();
        const transaction = await contract.createMarketSale(tokenId, {
            value: ethers.utils.parseEther(price.toString())
        });
        await transaction.wait();
        return transaction;
    } catch (error) {
        console.error('Erreur achat NFT:', error);
        throw error;
    }
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
        
        // Récupérer les données du contrat
        const [marketItem, tokenURI, creator] = await Promise.all([
            contract.getMarketItem(tokenId).catch(() => null),
            contract.tokenURI(tokenId).catch(() => null),
            contract.getTokenCreator(tokenId).catch(() => null)
        ]);
        
        if (!tokenURI) {
            throw new Error('NFT non trouvé ou inaccessible');
        }
        
        // Parser les métadonnées
        let metadata = {};
        try {
            if (tokenURI.startsWith('data:application/json;base64,')) {
                const base64Data = tokenURI.replace('data:application/json;base64,', '');
                metadata = JSON.parse(atob(base64Data));
            } else if (tokenURI.startsWith('http')) {
                const response = await fetch(tokenURI);
                metadata = await response.json();
            }
        } catch (error) {
            console.warn('Erreur parsing métadonnées:', error);
            metadata = {
                name: `NFT #${tokenId}`,
                description: "NFT créé sur votre marketplace",
                image: `https://picsum.photos/400/400?random=${tokenId}`
            };
        }
        
        return {
            id: tokenId,
            tokenId: parseInt(tokenId),
            name: metadata.name || `NFT #${tokenId}`,
            description: metadata.description || "",
            image: metadata.image || `https://picsum.photos/400/400?random=${tokenId}`,
            price: marketItem ? parseFloat(ethers.utils.formatEther(marketItem.price)) : 0,
            owner: marketItem ? marketItem.owner : creator,
            seller: marketItem ? marketItem.seller : null,
            creator: creator || 'Inconnu',
            sold: marketItem ? marketItem.sold : false,
            forSale: marketItem ? marketItem.listed : false,
            category: metadata.category || "Digital Art",
            attributes: metadata.attributes || [],
            likes: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 1000),
            createdAt: new Date().toISOString().split('T')[0],
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