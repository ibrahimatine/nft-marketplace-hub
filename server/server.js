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

// Initialiser le fichier de données s'il n'existe pas
const initializeDataFile = async () => {
    try {
        if (!await fs.pathExists(DATA_FILE)) {
            await fs.writeJson(DATA_FILE, {
                nfts: {},
                lastUpdated: new Date().toISOString()
            });
            console.log('📄 Fichier de données initialisé');
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

// DELETE - Reset toutes les stats
app.delete('/api/stats/reset', async (req, res) => {
    try {
        const data = {
            nfts: {},
            lastUpdated: new Date().toISOString()
        };
        await writeData(data);
        console.log('🧹 Stats réinitialisées');
        res.json({ success: true, message: 'Stats réinitialisées' });
    } catch (error) {
        console.error('Erreur DELETE reset:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Démarrer le serveur
const startServer = async () => {
    await initializeDataFile();
    app.listen(PORT, () => {
        console.log(`🚀 Serveur NFT Stats démarré sur le port ${PORT}`);
        console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    });
};

startServer();