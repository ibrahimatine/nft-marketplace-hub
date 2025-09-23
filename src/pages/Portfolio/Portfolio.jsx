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
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { useAppContext } from '../../App';
import { fetchUserNFTs, fetchUserListedNFTs, withdrawNFT } from '../../utils/contract';
import { getSubmittedNFTs, removeSubmittedNFT } from '../../utils/storage';

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
    createdCount: 0,
    submittedCount: 0
  });
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [onSaleNFTs, setOnSaleNFTs] = useState([]);
  const [submittedNFTs, setSubmittedNFTs] = useState([]);
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

      // 1. Charger les NFTs de localStorage
      const localNFTs = getSubmittedNFTs();
      setSubmittedNFTs(localNFTs);

      // 2. Charger les NFTs de la blockchain - RÉACTIVÉ
      const [ownedData, listedData] = await Promise.all([
        fetchUserNFTs(walletAddress).catch(err => {
          console.warn('Erreur blockchain NFTs possédés:', err);
          return [];
        }),
        fetchUserListedNFTs().catch(err => {
          console.warn('Erreur blockchain NFTs listés:', err);
          return [];
        })
      ]);

      console.log('NFTs possédés (blockchain):', ownedData);
      console.log('NFTs listés (blockchain):', listedData);
      console.log('NFTs soumis (localStorage):', localNFTs);

      setOwnedNFTs(ownedData);
      setOnSaleNFTs(listedData);

      // 3. Calculer les statistiques (éviter les doublons)
      // Filtrer les NFTs locaux actifs (non migrés)
      const activeLocalNFTs = localNFTs.filter(nft =>
        nft.blockchainStatus !== 'minted' && nft.status === 'submitted'
      );

      const totalValue = ownedData.reduce((sum, nft) => sum + nft.price, 0);
      const submittedValue = activeLocalNFTs.reduce((sum, nft) => sum + (nft.price || 0), 0);

      setPortfolioStats({
        totalValue: (totalValue + submittedValue).toFixed(4),
        totalNFTs: ownedData.length + activeLocalNFTs.length,
        onSaleCount: listedData.length + activeLocalNFTs.filter(nft => nft.forSale).length,
        createdCount: ownedData.filter(nft => nft.seller === walletAddress).length + activeLocalNFTs.length,
        submittedCount: activeLocalNFTs.length
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

    console.log('=== DEBUG NAVIGATION PORTFOLIO ===');
    console.log('NFT cliqué:', nft);
    console.log('status:', nft.status);
    console.log('blockchainStatus:', nft.blockchainStatus);
    console.log('source:', nft.source);

    // Logique simplifiée : NFT local = status 'submitted' ET PAS encore sur blockchain
    if (nft.status === 'submitted' && nft.blockchainStatus !== 'minted') {
      // NFT vraiment local - pas encore migré
      console.log('Navigation locale vers:', `/nft/local-${nft.id}`);
      navigate(`/nft/local-${nft.id}`);
    } else {
      // NFT blockchain (ou migré) - utiliser tokenId si disponible
      const targetId = nft.tokenId || nft.id;
      console.log('Navigation blockchain vers:', `/nft/${targetId}`);
      navigate(`/nft/${targetId}`);
    }
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

  const handleDeleteSubmittedNFT = (nftId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce NFT de votre collection locale ?')) {
      removeSubmittedNFT(nftId);
      loadPortfolioData(); // Recharger pour mettre à jour l'affichage
    }
  };

  const getCurrentNFTs = () => {
    // Filtrer les NFTs locaux qui ont été migrés (éviter les doublons)
    const activeLocalNFTs = submittedNFTs.filter(nft =>
      nft.blockchainStatus !== 'minted' && nft.status === 'submitted'
    );

    switch(activeTab) {
      case 'owned':
        // Combiner NFTs blockchain + locaux non migrés
        return [...ownedNFTs, ...activeLocalNFTs];
      case 'created':
        // NFTs créés = blockchain créés + tous les soumis locaux non migrés
        const blockchainCreated = ownedNFTs.filter(nft => nft.seller === walletAddress);
        return [...blockchainCreated, ...activeLocalNFTs];
      case 'onsale':
        // NFTs en vente = blockchain listés + locaux marqués forSale non migrés
        const localForSale = activeLocalNFTs.filter(nft => nft.forSale);
        return [...onSaleNFTs, ...localForSale];
      case 'submitted':
        // Nouveaux onglet pour les NFTs locaux uniquement (non migrés)
        return activeLocalNFTs;
      default:
        return [...ownedNFTs, ...activeLocalNFTs];
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
      },
      submitted: {
        icon: <Clock size={48} />,
        title: "Aucun NFT soumis",
        description: "Vos NFTs créés localement apparaîtront ici"
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
          onClick={() => navigate(type === 'created' || type === 'submitted' ? '/submit' : '/explore')}
        >
          {type === 'created' || type === 'submitted' ? 'Créer un NFT' : 'Explorer le marketplace'}
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

            <div className="stat-card">
              <div className="stat-icon">
                <Clock />
              </div>
              <div className="stat-content">
                <div className="stat-value">{portfolioStats.submittedCount}</div>
                <div className="stat-label">Soumis</div>
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
              Tous ({portfolioStats.totalNFTs})
            </button>
            <button 
              className={`tab ${activeTab === 'created' ? 'active' : ''}`}
              onClick={() => setActiveTab('created')}
            >
              <Brush size={18} />
              Créés ({portfolioStats.createdCount + portfolioStats.submittedCount})
            </button>
            <button 
              className={`tab ${activeTab === 'onsale' ? 'active' : ''}`}
              onClick={() => setActiveTab('onsale')}
            >
              <Tag size={18} />
              En vente ({portfolioStats.onSaleCount})
            </button>
            <button 
              className={`tab ${activeTab === 'submitted' ? 'active' : ''}`}
              onClick={() => setActiveTab('submitted')}
            >
              <Clock size={18} />
              Locaux ({portfolioStats.submittedCount})
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
                <div key={`${nft.status || 'blockchain'}-${nft.id}`} className="portfolio-nft-wrapper">
                  <NFTCard 
                    nft={nft}
                    onClick={handleNFTClick}
                  />
                  
                  {/* Badge pour indiquer le statut */}
                  {nft.status === 'submitted' && (
                    <div className="nft-status-badge">
                      {nft.blockchainStatus === 'pending' && (
                        <span className="status-pending">
                          <Clock size={14} />
                          Local
                        </span>
                      )}
                      {nft.blockchainStatus === 'minted' && (
                        <span className="status-minted">
                          <CheckCircle size={14} />
                          Blockchain
                        </span>
                      )}
                      {nft.blockchainStatus === 'failed' && (
                        <span className="status-failed">
                          <AlertTriangle size={14} />
                          Erreur
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Actions pour NFTs possédés non en vente */}
                  {activeTab === 'owned' && !nft.forSale && nft.status !== 'submitted' && (
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
                  
                  {/* Actions pour NFTs en vente blockchain */}
                  {activeTab === 'onsale' && nft.status !== 'submitted' && (
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
                  
                  {/* Actions pour NFTs soumis localement */}
                  {nft.status === 'submitted' && (
                    <div className="local-nft-actions">
                      <button 
                        className="quick-action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNFTClick(nft);
                        }}
                      >
                        <Eye size={16} />
                        Voir
                      </button>
                      <button 
                        className="quick-action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubmittedNFT(nft.id);
                        }}
                      >
                        <X size={16} />
                        Supprimer
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
                  const availableNFTs = [...ownedNFTs, ...submittedNFTs].filter(nft => !nft.forSale);
                  if (availableNFTs.length > 0) {
                    handleNFTClick(availableNFTs[0]);
                  }
                }}
                disabled={[...ownedNFTs, ...submittedNFTs].filter(nft => !nft.forSale).length === 0}
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
          
          {/* Informations sur le stockage local */}
          {submittedNFTs.length > 0 && (
            <div className="storage-info">
              <h4>Stockage local</h4>
              <p>
                Vous avez {submittedNFTs.length} NFT(s) sauvegardé(s) localement. 
                Ces NFTs sont visibles uniquement sur cet appareil.
              </p>
              <div className="storage-stats">
                <span>Mintés: {submittedNFTs.filter(nft => nft.blockchainStatus === 'minted').length}</span>
                <span>En attente: {submittedNFTs.filter(nft => nft.blockchainStatus === 'pending').length}</span>
                <span>Échec: {submittedNFTs.filter(nft => nft.blockchainStatus === 'failed').length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;