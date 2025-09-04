import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useAppContext } from '../../App';
import { fetchUserNFTs, fetchUserListedNFTs, withdrawNFT } from '../../utils/contract';

const Portfolio = () => {
  const navigate = useNavigate();
  const { isWalletConnected, walletAddress, setSelectedNFT } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('owned');
  const [viewMode, setViewMode] = useState('grid');
  const [showValues, setShowValues] = useState(true);
  const [loading, setLoading] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalNFTs: 0,
    onSaleCount: 0,
    createdCount: 0
  });
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [onSaleNFTs, setOnSaleNFTs] = useState([]);
  const [error, setError] = useState('');

  // Charger les données à la connexion
  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      loadPortfolioData();
    }
  }, [isWalletConnected, walletAddress]);

  const loadPortfolioData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Chargement des NFTs pour:', walletAddress);
      
      // Charger les NFTs possédés et listés en parallèle
      const [ownedData, listedData] = await Promise.all([
        fetchUserNFTs(walletAddress),
        fetchUserListedNFTs()
      ]);

      console.log('NFTs possédés:', ownedData);
      console.log('NFTs listés:', listedData);

      setOwnedNFTs(ownedData);
      setOnSaleNFTs(listedData);

      // Calculer les statistiques
      const totalValue = ownedData.reduce((sum, nft) => sum + nft.price, 0);
      setPortfolioStats({
        totalValue: totalValue.toFixed(4),
        totalNFTs: ownedData.length,
        onSaleCount: listedData.length,
        createdCount: ownedData.filter(nft => nft.seller === walletAddress).length
      });

    } catch (error) {
      console.error('Erreur chargement portfolio:', error);
      setError('Erreur lors du chargement du portfolio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
    navigate(`/nft/${nft.id}`);
  };

  const handleWithdrawNFT = async (tokenId) => {
    try {
      setLoading(true);
      await withdrawNFT(tokenId);
      
      // Recharger les données après retrait
      await loadPortfolioData();
      
      alert('NFT retiré de la vente avec succès !');
    } catch (error) {
      console.error('Erreur retrait NFT:', error);
      alert('Erreur lors du retrait: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentNFTs = () => {
    switch(activeTab) {
      case 'owned':
        return ownedNFTs;
      case 'created':
        // Les NFTs créés sont ceux où seller === walletAddress
        return ownedNFTs.filter(nft => nft.seller === walletAddress);
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
          onClick={() => navigate(type === 'created' ? '/submit' : '/explore')}
        >
          {type === 'created' ? 'Créer un NFT' : 'Explorer le marketplace'}
        </button>
      </div>
    );
  };

  if (!isWalletConnected) {
    return <Navigate to="/" replace />;
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
              <button 
                className="refresh-btn"
                onClick={loadPortfolioData}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              </button>
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

        {/* Message d'erreur */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={loadPortfolioData}>Réessayer</button>
          </div>
        )}

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
              Créés ({portfolioStats.createdCount})
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

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <RefreshCw className="spinning" size={48} />
            <p>Chargement de votre portfolio...</p>
          </div>
        )}

        {/* Liste des NFTs */}
        <div className="portfolio-content">
          {!loading && currentNFTs.length > 0 ? (
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
                          handleWithdrawNFT(nft.tokenId);
                        }}
                        disabled={loading}
                      >
                        Retirer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : !loading ? (
            <EmptyState type={activeTab} />
          ) : null}
        </div>

        {/* Actions rapides */}
        <div className="portfolio-actions">
          <div className="action-card">
            <h3>Actions rapides</h3>
            <div className="actions-grid">
              <button 
                className="action-btn"
                onClick={() => navigate('/explore')}
              >
                <ShoppingBag />
                <span>Acheter des NFTs</span>
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate('/submit')}
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
                onClick={loadPortfolioData}
                disabled={loading}
              >
                <RefreshCw className={loading ? 'spinning' : ''} />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;