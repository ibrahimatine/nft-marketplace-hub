// Service pour gérer les statistiques des NFTs (vues et likes)

const API_BASE_URL = 'http://localhost:3000/api';

// Récupérer les stats d'un NFT
export const getNFTStats = async (nftId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/nft/${nftId}/stats`);
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur getNFTStats:', error);
        return { views: 0, likes: 0, likedBy: [] };
    }
};

// Incrémenter les vues d'un NFT
export const incrementNFTViews = async (nftId, userAddress = null) => {
    try {
        const response = await fetch(`${API_BASE_URL}/nft/${nftId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userAddress })
        });

        if (!response.ok) {
            throw new Error('Erreur réseau');
        }

        const result = await response.json();


        return result;
    } catch (error) {
        console.error('Erreur incrementNFTViews:', error);
        return { success: false, views: 0 };
    }
};

// Toggle like d'un NFT
export const toggleNFTLike = async (nftId, userAddress) => {
    try {
        if (!userAddress) {
            throw new Error('Adresse utilisateur requise pour liker');
        }

        const response = await fetch(`${API_BASE_URL}/nft/${nftId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userAddress })
        });

        if (!response.ok) {
            throw new Error('Erreur réseau');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur toggleNFTLike:', error);
        return { success: false, likes: 0, isLiked: false };
    }
};

// Récupérer toutes les stats
export const getAllStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur getAllStats:', error);
        return { nfts: {} };
    }
};

// Enregistrer une vente récente
export const recordSale = async (nftId, price, buyer, seller) => {
    try {
        const response = await fetch(`${API_BASE_URL}/nft/${nftId}/sale`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ price, buyer, seller }),
        });

        if (!response.ok) {
            throw new Error('Erreur réseau');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur recordSale:', error);
        return { success: false };
    }
};

// Obtenir les recommandations NFT pour la page d'accueil
export const getRecommendations = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations`);

        if (!response.ok) {
            throw new Error('Erreur réseau');
        }

        const data = await response.json();
        return data.recommendations || [];
    } catch (error) {
        console.error('Erreur getRecommendations:', error);
        return [];
    }
};

// Reset toutes les stats
export const resetAllStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/stats/reset`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erreur réseau');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur resetAllStats:', error);
        return { success: false };
    }
};

// Hook personnalisé pour React
export const useNFTStats = (nftId) => {
    const [stats, setStats] = React.useState({ views: 0, likes: 0, likedBy: [] });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            const nftStats = await getNFTStats(nftId);
            setStats(nftStats);
            setLoading(false);
        };

        if (nftId) {
            loadStats();
        }
    }, [nftId]);

    const refreshStats = async () => {
        const nftStats = await getNFTStats(nftId);
        setStats(nftStats);
    };

    return { stats, loading, refreshStats };
};