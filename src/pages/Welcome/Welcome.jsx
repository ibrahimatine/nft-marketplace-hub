import React, { useState, useEffect } from 'react';
import './Welcome.css';
import NFTCard from '../../components/NFTCard/NFTCard.jsx';
import { Search, ArrowRight, Users, Package, TrendingUp } from 'lucide-react';
import { getHighestSaleNFT, getAvailableNFTs, marketStats } from '../../data/mockData.js';

const Welcome = ({ onNavigate }) => {
  const [highestSaleNFT, setHighestSaleNFT] = useState(null);
  const [featuredNFT, setFeaturedNFT] = useState(null);

  useEffect(() => {
    // Obtenir le NFT avec la plus haute vente
    const highest = getHighestSaleNFT();
    setHighestSaleNFT(highest);
    
    // Obtenir un NFT disponible (différent du highest)
    const available = getAvailableNFTs().find(nft => nft.id !== highest.id);
    setFeaturedNFT(available);
  }, []);

  const handleNFTClick = (nft) => {
    onNavigate('nft-detail', nft);
  };

  return (
    <div className="welcome">
      {/* Hero Section */}
      <section className="welcome-hero">
        <div className="container">
          <h1 className="welcome-title gradient-accent">
            Découvrez, Collectionnez et Échangez des NFTs Uniques
          </h1>
          <p className="welcome-subtitle">
            La marketplace dédiée aux œuvres d'art numériques et aux objets de collection rares
          </p>

          {/* Stats */}
          <div className="welcome-stats">
            <div className="stat-card">
              <Package className="stat-icon" />
              <div className="stat-content">
                <div className="stat-number">{(marketStats.totalNFTs / 1000).toFixed(1)}K+</div>
                <div className="stat-label">NFTs Listés</div>
              </div>
            </div>
            <div className="stat-card">
              <Users className="stat-icon" />
              <div className="stat-content">
                <div className="stat-number">{(marketStats.totalUsers / 1000).toFixed(1)}K+</div>
                <div className="stat-label">Utilisateurs</div>
              </div>
            </div>
            <div className="stat-card">
              <TrendingUp className="stat-icon" />
              <div className="stat-content">
                <div className="stat-number">{(marketStats.totalVolume / 1000).toFixed(1)}K</div>
                <div className="stat-label">Volume (ETH)</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="welcome-cta">
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('explore')}
            >
              <Search size={20} />
              Explorer la collection
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => onNavigate('submit')}
            >
              Soumettre un NFT
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Featured NFTs Section */}
      <section className="welcome-featured">
        <div className="container">
          <h2 className="section-title">NFTs en Vedette</h2>
          <p className="section-subtitle">
            Découvrez les pièces les plus populaires de notre collection
          </p>
          
          <div className="featured-grid">
            {highestSaleNFT && (
              <div className="featured-item">
                <NFTCard 
                  nft={highestSaleNFT} 
                  badge={{ type: 'trending', text: 'Top vente 24h' }}
                  onClick={handleNFTClick}
                />
              </div>
            )}
            {featuredNFT && (
              <div className="featured-item">
                <NFTCard 
                  nft={featuredNFT} 
                  badge={{ type: 'new', text: 'Disponible maintenant' }}
                  onClick={handleNFTClick}
                />
              </div>
            )}
          </div>
          
          <div className="featured-footer">
            <button 
              className="btn btn-outline"
              onClick={() => onNavigate('explore')}
            >
              Voir tous les NFTs
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="welcome-how">
        <div className="container">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-number">1</div>
              <h3>Connectez votre wallet</h3>
              <p>Connectez votre wallet MetaMask ou WalletConnect pour commencer</p>
            </div>
            <div className="how-card">
              <div className="how-number">2</div>
              <h3>Explorez les NFTs</h3>
              <p>Parcourez notre collection unique d'œuvres d'art numériques</p>
            </div>
            <div className="how-card">
              <div className="how-number">3</div>
              <h3>Achetez ou vendez</h3>
              <p>Échangez des NFTs en toute sécurité sur la blockchain</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;