const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Chemin vers le fichier de données
const DATA_FILE = path.join(__dirname, 'nft-stats.json');

// Cache en mémoire pour les timers de vues (10 secondes par utilisateur/NFT)
const viewTimers = new Map(); // key: "nftId-userAddress", value: timestamp

// Cache pour les ventes récentes (dernières 24h)
const recentSales = new Map(); // key: nftId, value: { price, timestamp, buyer, seller }

// Initialiser le fichier de données s'il n'existe pas
const initializeDataFile = async () => {
    try {
        if (!await fs.pathExists(DATA_FILE)) {
            await fs.writeJson(DATA_FILE, {
                nfts: {},
                lastUpdated: new Date().toISOString(),
                contractAddress: null
            });
            console.log('📄 Fichier de données initialisé');
        } else {
            // Vérifier et ajouter le champ contractAddress s'il manque
            const data = await fs.readJson(DATA_FILE);
            if (!data.hasOwnProperty('contractAddress')) {
                data.contractAddress = null;
                await fs.writeJson(DATA_FILE, data, { spaces: 2 });
                console.log('📄 Champ contractAddress ajouté au fichier existant');
            }
        }
    } catch (error) {
        console.error('Erreur initialisation fichier:', error);
    }
};

// Lire les données
const readData = async () => {
    try {
        return await fs.readJson(DATA_FILE);
    } catch (error) {
        console.error('Erreur lecture données:', error);
        return { nfts: {}, lastUpdated: new Date().toISOString() };
    }
};

// Écrire les données
const writeData = async (data) => {
    try {
        data.lastUpdated = new Date().toISOString();
        await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    } catch (error) {
        console.error('Erreur écriture données:', error);
    }
};

// Routes API

// GET - Récupérer les stats d'un NFT
app.get('/api/nft/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readData();

        const nftStats = data.nfts[id] || {
            views: 0,
            likes: 0,
            likedBy: []
        };

        res.json(nftStats);
    } catch (error) {
        console.error('Erreur GET stats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST - Incrémenter les vues avec timer de 10 secondes
app.post('/api/nft/:id/view', async (req, res) => {
    try {
        const { id } = req.params;
        const { userAddress } = req.body;

        // Créer une clé unique pour cet utilisateur et ce NFT
        const timerKey = `${id}-${userAddress}`;
        const now = Date.now();
        const lastView = viewTimers.get(timerKey) || 0;
        const timeDiff = now - lastView;

        // Vérifier si 10 secondes se sont écoulées (10000ms)
        if (timeDiff < 10000) {
            const remainingTime = Math.ceil((10000 - timeDiff) / 1000);
            console.log(`⏰ Vue bloquée pour NFT ${id} par ${userAddress} - ${remainingTime}s restantes`);

            return res.json({
                success: false,
                message: `Attendez ${remainingTime} secondes avant de voir ce NFT à nouveau`,
                views: 0,
                cooldown: remainingTime
            });
        }

        const data = await readData();

        if (!data.nfts[id]) {
            data.nfts[id] = {
                views: 0,
                likes: 0,
                likedBy: []
            };
        }

        // Incrémenter les vues et mettre à jour le timer
        data.nfts[id].views += 1;
        viewTimers.set(timerKey, now);

        await writeData(data);

        console.log(`👁️ Vue ajoutée pour NFT ${id} par ${userAddress} (total: ${data.nfts[id].views})`);

        res.json({
            success: true,
            views: data.nfts[id].views
        });
    } catch (error) {
        console.error('Erreur POST view:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST - Toggle like
app.post('/api/nft/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const { userAddress } = req.body;

        if (!userAddress) {
            return res.status(400).json({ error: 'Adresse utilisateur requise' });
        }

        const data = await readData();

        if (!data.nfts[id]) {
            data.nfts[id] = {
                views: 0,
                likes: 0,
                likedBy: []
            };
        }

        const nft = data.nfts[id];
        const userIndex = nft.likedBy.indexOf(userAddress);
        let isLiked = false;

        if (userIndex === -1) {
            // Ajouter le like
            nft.likedBy.push(userAddress);
            nft.likes += 1;
            isLiked = true;
            console.log(`❤️ Like ajouté par ${userAddress} pour NFT ${id}`);
        } else {
            // Retirer le like
            nft.likedBy.splice(userIndex, 1);
            nft.likes -= 1;
            isLiked = false;
            console.log(`💔 Like retiré par ${userAddress} pour NFT ${id}`);
        }

        await writeData(data);

        res.json({
            success: true,
            likes: nft.likes,
            isLiked: isLiked
        });
    } catch (error) {
        console.error('Erreur POST like:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - Récupérer toutes les stats
app.get('/api/stats', async (req, res) => {
    try {
        const data = await readData();
        res.json(data);
    } catch (error) {
        console.error('Erreur GET all stats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST - Enregistrer une vente récente
app.post('/api/nft/:id/sale', async (req, res) => {
    try {
        const { id } = req.params;
        const { price, buyer, seller } = req.body;

        if (!price || !buyer || !seller) {
            return res.status(400).json({ error: 'Prix, acheteur et vendeur requis' });
        }

        const saleData = {
            price: parseFloat(price),
            timestamp: Date.now(),
            buyer,
            seller
        };

        recentSales.set(id, saleData);
        console.log(`💰 Vente enregistrée: NFT ${id} vendu ${price} ETH de ${seller} à ${buyer}`);

        res.json({ success: true, sale: saleData });
    } catch (error) {
        console.error('Erreur POST sale:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - Obtenir les NFTs recommandés pour la page d'accueil
app.get('/api/recommendations', async (req, res) => {
    try {
        const data = await readData();
        const recommendations = [];

        // 1. NFT vendu le plus cher dans les dernières 24h
        let highestSale = null;
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        for (const [nftId, sale] of recentSales.entries()) {
            if (sale.timestamp > oneDayAgo) {
                if (!highestSale || sale.price > highestSale.price) {
                    highestSale = { nftId, ...sale };
                }
            }
        }

        if (highestSale) {
            recommendations.push({
                nftId: highestSale.nftId,
                reason: 'highest_sale_24h',
                price: highestSale.price,
                priority: 1
            });
        }

        // 2. NFT le plus liké
        let mostLiked = null;
        for (const [nftId, stats] of Object.entries(data.nfts)) {
            if (stats.likes > 0) {
                if (!mostLiked || stats.likes > mostLiked.likes) {
                    mostLiked = { nftId, likes: stats.likes };
                }
            }
        }

        // 3. Si le NFT le plus liké est le même que le plus vendu, prendre le 2e plus liké
        if (mostLiked) {
            const isAlreadyAdded = recommendations.some(r => r.nftId === mostLiked.nftId);

            if (isAlreadyAdded) {
                // Chercher le 2e plus liké
                let secondMostLiked = null;
                for (const [nftId, stats] of Object.entries(data.nfts)) {
                    if (nftId !== mostLiked.nftId && stats.likes > 0) {
                        if (!secondMostLiked || stats.likes > secondMostLiked.likes) {
                            secondMostLiked = { nftId, likes: stats.likes };
                        }
                    }
                }

                if (secondMostLiked) {
                    recommendations.push({
                        nftId: secondMostLiked.nftId,
                        reason: 'second_most_liked',
                        likes: secondMostLiked.likes,
                        priority: 2
                    });
                }
            } else {
                recommendations.push({
                    nftId: mostLiked.nftId,
                    reason: 'most_liked',
                    likes: mostLiked.likes,
                    priority: 2
                });
            }
        }

        console.log(`🎯 Recommandations générées: ${recommendations.length} NFTs`);
        res.json({ recommendations });

    } catch (error) {
        console.error('Erreur GET recommendations:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE - Reset toutes les stats
app.delete('/api/stats/reset', async (req, res) => {
    try {
        const { contractAddress } = req.body || {};

        const data = {
            nfts: {},
            lastUpdated: new Date().toISOString(),
            contractAddress: contractAddress || null
        };
        await writeData(data);
        recentSales.clear(); // Reset aussi les ventes récentes

        const message = contractAddress
            ? `Stats réinitialisées pour le nouveau contrat ${contractAddress}`
            : 'Stats réinitialisées';

        console.log('🧹', message);
        res.json({ success: true, message });
    } catch (error) {
        console.error('Erreur DELETE reset:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Ajouter des données de test pour les ventes récentes
const addTestSales = () => {
    const now = Date.now();
    const oneHourAgo = now - (1 * 60 * 60 * 1000); // Il y a 1 heure
    const twoHoursAgo = now - (2 * 60 * 60 * 1000); // Il y a 2 heures

    // Vente fictive : NFT #2 vendu pour 2.5 ETH il y a 1 heure
    recentSales.set('2', {
        price: 2.5,
        timestamp: oneHourAgo,
        buyer: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        seller: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
    });

    // Vente fictive : NFT #1 vendu pour 1.8 ETH il y a 2 heures
    recentSales.set('1', {
        price: 1.8,
        timestamp: twoHoursAgo,
        buyer: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        seller: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
    });

    console.log('📦 Données de test ajoutées: 2 ventes récentes');
    console.log('💰 NFT #2: 2.5 ETH (il y a 1h)');
    console.log('💰 NFT #1: 1.8 ETH (il y a 2h)');
};

// Démarrer le serveur
const startServer = async () => {
    await initializeDataFile();
    addTestSales(); // Ajouter des données de test
    app.listen(PORT, () => {
        console.log(`🚀 Serveur NFT Stats démarré sur le port ${PORT}`);
        console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    });
};

startServer();