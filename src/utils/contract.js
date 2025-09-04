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
    "event MarketItemCreated(uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold)"
    
];

// Obtenir le contrat avec signer
export const getContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        return { contract, provider, signer };
    }
    throw new Error('MetaMask non détecté');
};

// Obtenir les NFTs possédés par l'utilisateur connecté
export const fetchUserNFTs = async (userAddress) => {
    try {
        const { contract } = await getContract();
        const data = await contract.fetchMyNFTs();
        
        const items = await Promise.all(data.map(async (item) => {
            try {
                const tokenUri = await contract.tokenURI(item.tokenId);
                
                // Si tokenUri est une URL IPFS, récupérer les métadonnées
                let metadata = {};
                if (tokenUri.startsWith('http')) {
                    const response = await fetch(tokenUri);
                    metadata = await response.json();
                } else {
                    // Métadonnées par défaut si pas d'URI valide
                    metadata = {
                        name: `NFT #${item.tokenId}`,
                        description: "NFT créé sur votre marketplace",
                        image: `https://picsum.photos/400/400?random=${item.tokenId}`
                    };
                }
                
                return {
                    id: item.tokenId.toNumber(),
                    tokenId: item.tokenId.toNumber(),
                    name: metadata.name || `NFT #${item.tokenId}`,
                    description: metadata.description || "",
                    image: metadata.image || `https://picsum.photos/400/400?random=${item.tokenId}`,
                    price: parseFloat(ethers.utils.formatEther(item.price)),
                    owner: item.owner,
                    seller: item.seller,
                    sold: item.sold,
                    forSale: item.listed,
                    category: metadata.category || "Digital Art",
                    likes: Math.floor(Math.random() * 100), // Simulé pour l'instant
                    views: Math.floor(Math.random() * 1000), // Simulé pour l'instant
                    createdAt: new Date().toISOString().split('T')[0]
                };
            } catch (error) {
                console.error(`Erreur pour le token ${item.tokenId}:`, error);
                return null;
            }
        }));
        
        return items.filter(item => item !== null);
    } catch (error) {
        console.error('Erreur fetchUserNFTs:', error);
        return [];
    }
};

// Obtenir les NFTs listés par l'utilisateur
export const fetchUserListedNFTs = async () => {
    try {
        const { contract } = await getContract();
        const data = await contract.fetchItemsListed();
        
        const items = await Promise.all(data.map(async (item) => {
            try {
                const tokenUri = await contract.tokenURI(item.tokenId);
                
                let metadata = {};
                if (tokenUri.startsWith('http')) {
                    const response = await fetch(tokenUri);
                    metadata = await response.json();
                } else {
                    metadata = {
                        name: `NFT #${item.tokenId}`,
                        description: "NFT créé sur votre marketplace",
                        image: `https://picsum.photos/400/400?random=${item.tokenId}`
                    };
                }
                
                return {
                    id: item.tokenId.toNumber(),
                    tokenId: item.tokenId.toNumber(),
                    name: metadata.name || `NFT #${item.tokenId}`,
                    description: metadata.description || "",
                    image: metadata.image || `https://picsum.photos/400/400?random=${item.tokenId}`,
                    price: parseFloat(ethers.utils.formatEther(item.price)),
                    owner: item.owner,
                    seller: item.seller,
                    sold: item.sold,
                    forSale: item.listed,
                    category: metadata.category || "Digital Art",
                    likes: Math.floor(Math.random() * 100),
                    views: Math.floor(Math.random() * 1000),
                    createdAt: new Date().toISOString().split('T')[0]
                };
            } catch (error) {
                console.error(`Erreur pour le token listé ${item.tokenId}:`, error);
                return null;
            }
        }));
        
        return items.filter(item => item !== null);
    } catch (error) {
        console.error('Erreur fetchUserListedNFTs:', error);
        return [];
    }
};

// Obtenir tous les NFTs du marketplace
export const fetchMarketplaceNFTs = async () => {
    try {
        const { contract } = await getContract();
        const data = await contract.fetchMarketItems();
        
        const items = await Promise.all(data.map(async (item) => {
            try {
                const tokenUri = await contract.tokenURI(item.tokenId);
                
                let metadata = {};
                if (tokenUri.startsWith('http')) {
                    const response = await fetch(tokenUri);
                    metadata = await response.json();
                } else {
                    metadata = {
                        name: `NFT #${item.tokenId}`,
                        description: "NFT créé sur votre marketplace",
                        image: `https://picsum.photos/400/400?random=${item.tokenId}`
                    };
                }
                
                return {
                    id: item.tokenId.toNumber(),
                    tokenId: item.tokenId.toNumber(),
                    name: metadata.name || `NFT #${item.tokenId}`,
                    description: metadata.description || "",
                    image: metadata.image || `https://picsum.photos/400/400?random=${item.tokenId}`,
                    price: parseFloat(ethers.utils.formatEther(item.price)),
                    owner: item.owner,
                    seller: item.seller,
                    sold: item.sold,
                    forSale: item.listed,
                    category: metadata.category || "Digital Art",
                    likes: Math.floor(Math.random() * 100),
                    views: Math.floor(Math.random() * 1000),
                    createdAt: new Date().toISOString().split('T')[0]
                };
            } catch (error) {
                console.error(`Erreur pour le token marketplace ${item.tokenId}:`, error);
                return null;
            }
        }));
        
        return items.filter(item => item !== null);
    } catch (error) {
        console.error('Erreur fetchMarketplaceNFTs:', error);
        return [];
    }
};

// Acheter un NFT
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

export const getNFTDetails = async (tokenId) => {
  try {
    const { contract } = await getContract();
    
    // Récupérer les données du contrat
    const marketItem = await contract.getMarketItem(tokenId);
    const tokenURI = await contract.tokenURI(tokenId);
    const creator = await contract.getTokenCreator(tokenId);
    
    // Parser les métadonnées
    let metadata = {};
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.replace('data:application/json;base64,', '');
      metadata = JSON.parse(atob(base64Data));
    }
    
    return {
      id: tokenId,
      tokenId: parseInt(tokenId),
      name: metadata.name || `NFT #${tokenId}`,
      description: metadata.description || "",
      image: metadata.image || `https://picsum.photos/400/400?random=${tokenId}`,
      price: parseFloat(ethers.utils.formatEther(marketItem.price)),
      owner: marketItem.owner,
      seller: marketItem.seller,
      creator: creator, // Vraie adresse du créateur
      sold: marketItem.sold,
      forSale: marketItem.listed,
      category: metadata.category || "Digital Art",
      attributes: metadata.attributes || [],
      // Pour l'instant, simuler likes/views (vous pourrez les stocker plus tard)
      likes: Math.floor(Math.random() * 100),
      views: Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString().split('T')[0],
      // Ajouter l'historique des transactions
      transfers: [
        {
          from: "0x0000000000000000000000000000000000000000",
          to: creator,
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