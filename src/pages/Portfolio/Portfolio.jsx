import React, { useState, useEffect } from 'react';
import './Portfolio.css';
import NFTCard from '../../components/NFTCard/NFTCard';
import { 
  Wallet, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Grid, 
  List,
  Filter,
  ShoppingBag,
  Brush,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';
import { mockNFTs, userPortfolio } from '../../data/mockData';

const Portfolio = ({ onNavigate, walletAddress, isWalletConnected }) => {
  const [activeTab, setActiveTab] = useState('owned');
  const [viewMode, setViewMode] = useState('grid');
  const [showValues, setShowValues] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalNFTs: 0,
    onSaleCount: 0,
    createdCount: 0
  });
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [createdNFTs, setCreatedNFTs] = useState([]);
  const [onSaleNFTs, setOnSaleNFTs] = useState([]);
  
  useEffect(() => {
    if (!isWalletConnected) {
      // Si pas connecté, rediriger vers Welcome
      onNavigate('welcome');
      return;
    }
    
    // Simuler la récupération des NFTs du portfolio
    const portfolio = userPortfolio[walletAddress] || { owned: [], created: [], onSale: [] };
    
    // Filtrer les NFTs selon les IDs du portfolio
    const owned = mockNFTs.filter(nft => portfolio.owned.includes(nft.id));
    const created = mockNFTs.filter(nft => portfolio.created.includes(nft.id));
    const onSale = mockNFTs.filter(nft => portfolio.onSale.includes(nft.id));
    
    setOwnedNFTs(owned);
    setCreatedNFTs(created);
    setOnSaleNFTs(onSale);
    
    // Calculer les statistiques
    const totalValue = owned.reduce((sum, nft) => sum + nft.price, 0);
    setPortfolioStats({
      totalValue: totalValue.toFixed(2),
      totalNFTs: owned.length,
      onSaleCount: onSale.length,
      createdCount: created.length
    });
  }, [isWalletConnected, walletAddress, onNavigate]);
  
  const handleNFTClick = (nft) => {
    onNavigate('nft-detail', nft);
  };
  
  const getCurrentNFTs = () => {
    switch(activeTab) {
      case 'owned':
      return ownedNFTs;
      case 'created':
      return createdNFTs;
      case 'onsale':
      return onSaleNFTs;
      default:
      return ownedNFTs;
    }
  };
  
  const EmptyState = ({ type }) => {
    const messages = {
      owned: {
        icon: <Package size={48} />,
        title: "Aucun NFT dans votre collection",
        description: "Commencez votre collection en explorant notre marketplace"
      },
      created: {
        icon: <Brush size={48} />,
        title: "Vous n'avez pas encore créé de NFT",
        description: "Soumettez votre première œuvre pour la voir apparaître ici"
      },
      onsale: {
        icon: <Tag size={48} />,
        title: "Aucun NFT en vente",
        description: "Mettez vos NFTs en vente pour les voir apparaître ici"
      }
    };
    
    const message = messages[type] || messages.owned;
    
    return (
      <div className="empty-state">
      <div className="empty-icon">{message.icon}</div>
      <h3>{message.title}</h3>
      <p>{message.description}</p>
      <button 
      className="btn btn-primary"
      onClick={() => onNavigate(type === 'created' ? 'submit' : 'explore')}
      >
      {type === 'created' ? 'Créer un NFT' : 'Explorer le marketplace'}
      </button>
      </div>
    );
  };
  
  if (!isWalletConnected) {
    return (
      <div className="portfolio">
      <div className="container">
      <div className="wallet-required">
      <Wallet size={64} />
      <h2>Connexion requise</h2>
      <p>Connectez votre wallet pour accéder à votre portfolio</p>
      </div>
      </div>
      </div>
    );
  }
  
  const currentNFTs = getCurrentNFTs();
  
  return (
    <div className="portfolio">
    <div className="container">
    {/* Header du Portfolio */}
    <div className="portfolio-header">
    <div className="header-content">
    <h1>Mon Portfolio</h1>
    <div className="wallet-address">
    <Wallet size={20} />
    <span>{walletAddress}</span>
    </div>
    </div>
    
    {/* Stats Cards */}
    <div className="stats-grid">
    <div className="stat-card">
    <div className="stat-icon">
    <DollarSign />
    </div>
    <div className="stat-content">
    <div className="stat-value">
    {showValues ? `${portfolioStats.totalValue} ETH` : '•••'}
    </div>
    <div className="stat-label">Valeur totale</div>
    </div>
    </div>
    
    <div className="stat-card">
    <div className="stat-icon">
    <Package />
    </div>
    <div className="stat-content">
    <div className="stat-value">{portfolioStats.totalNFTs}</div>
    <div className="stat-label">NFTs possédés</div>
    </div>
    </div>
    
    <div className="stat-card">
    <div className="stat-icon">
    <ShoppingBag />
    </div>
    <div className="stat-content">
    <div className="stat-value">{portfolioStats.onSaleCount}</div>
    <div className="stat-label">En vente</div>
    </div>
    </div>
    
    <div className="stat-card">
    <div className="stat-icon">
    <Brush />
    </div>
    <div className="stat-content">
    <div className="stat-value">{portfolioStats.createdCount}</div>
    <div className="stat-label">Créés</div>
    </div>
    </div>
    </div>
    </div>
    
    {/* Tabs et Contrôles */}
    <div className="portfolio-controls">
    <div className="tabs">
    <button 
    className={`tab ${activeTab === 'owned' ? 'active' : ''}`}
    onClick={() => setActiveTab('owned')}
    >
    <Package size={18} />
    Possédés ({ownedNFTs.length})
    </button>
    <button 
    className={`tab ${activeTab === 'created' ? 'active' : ''}`}
    onClick={() => setActiveTab('created')}
    >
    <Brush size={18} />
    Créés ({createdNFTs.length})
    </button>
    <button 
    className={`tab ${activeTab === 'onsale' ? 'active' : ''}`}
    onClick={() => setActiveTab('onsale')}
    >
    <Tag size={18} />
    En vente ({onSaleNFTs.length})
    </button>
    </div>
    
    <div className="view-controls">
    <button 
    className="toggle-values"
    onClick={() => setShowValues(!showValues)}
    >
    {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
    {showValues ? 'Masquer' : 'Afficher'} les valeurs
    </button>
    
    <div className="view-toggle">
    <button 
    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
    onClick={() => setViewMode('grid')}
    >
    <Grid size={18} />
    </button>
    <button 
    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
    onClick={() => setViewMode('list')}
    >
    <List size={18} />
    </button>
    </div>
    </div>
    </div>
    
    {/* Liste des NFTs */}
    <div className="portfolio-content">
    {currentNFTs.length > 0 ? (
      <div className={`nfts-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
      {currentNFTs.map(nft => (
        <div key={nft.id} className="portfolio-nft-wrapper">
        <NFTCard 
        nft={nft}
        onClick={handleNFTClick}
        />
        {activeTab === 'owned' && !nft.forSale && (
          <button 
          className="quick-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleNFTClick(nft);
          }}
          >
          <Tag size={16} />
          Mettre en vente
          </button>
        )}
        {activeTab === 'onsale' && (
          <div className="sale-info">
          <span className="sale-price">
          Prix: {showValues ? `${nft.price} ETH` : '•••'}
          </span>
          <button 
          className="cancel-sale-btn"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Retirer de la vente:', nft.id);
          }}
          >
          Retirer
          </button>
          </div>
        )}
        </div>
      ))}
      </div>
    ) : (
      <EmptyState type={activeTab} />
    )}
    </div>
    
    {/* Actions rapides */}
    <div className="portfolio-actions">
    <div className="action-card">
    <h3>Actions rapides</h3>
    <div className="actions-grid">
    <button 
    className="action-btn"
    onClick={() => onNavigate('explore')}
    >
    <ShoppingBag />
    <span>Acheter des NFTs</span>
    </button>
    <button 
    className="action-btn"
    onClick={() => onNavigate('submit')}
    >
    <Brush />
    <span>Créer un NFT</span>
    </button>
    <button 
    className="action-btn"
    onClick={() => {
      if (ownedNFTs.length > 0 && !ownedNFTs[0].forSale) {
        handleNFTClick(ownedNFTs[0]);
      }
    }}
    disabled={ownedNFTs.length === 0 || ownedNFTs.filter(nft => !nft.forSale).length === 0}
    >
    <Tag />
    <span>Vendre un NFT</span>
    </button>
    <button 
    className="action-btn"
    onClick={() => console.log('Exporter portfolio')}
    >
    <TrendingUp />
    <span>Exporter les stats</span>
    </button>
    </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Portfolio;