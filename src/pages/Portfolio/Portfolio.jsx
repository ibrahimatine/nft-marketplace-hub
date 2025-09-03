import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import './Portfolio.css';
import NFTCard from '../../components/NFTCard/NFTCard';
import { Wallet, Package, DollarSign, TrendingUp, Grid, List, Tag, Eye, EyeOff, ShoppingBag, Brush } from 'lucide-react';
import { useAppContext } from '../../App';

const Portfolio = () => {
  const navigate = useNavigate();
  const { walletAddress, isWalletConnected, setSelectedNFT } = useAppContext();
  const { nfts: allNFTs } = useNFTs();
  const { balance } = useBalance(walletAddress);

  const [activeTab, setActiveTab] = useState('owned');
  const [viewMode, setViewMode] = useState('grid');
  const [showValues, setShowValues] = useState(true);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [createdNFTs, setCreatedNFTs] = useState([]);
  const [onSaleNFTs, setOnSaleNFTs] = useState([]);

  useEffect(() => {
    if (!isWalletConnected) return;

    const owned = allNFTs.filter(nft => nft.owner === walletAddress);
    const created = allNFTs.filter(nft => nft.creator === walletAddress);
    const onSale = allNFTs.filter(nft => nft.forSale && nft.owner === walletAddress);

    setOwnedNFTs(owned);
    setCreatedNFTs(created);
    setOnSaleNFTs(onSale);
  }, [allNFTs, walletAddress, isWalletConnected]);

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
    navigate(`/nft/${nft.id}`);
  };

  const getCurrentNFTs = () => {
    switch(activeTab) {
      case 'owned': return ownedNFTs;
      case 'created': return createdNFTs;
      case 'onsale': return onSaleNFTs;
      default: return ownedNFTs;
    }
  };

  const EmptyState = ({ type }) => {
    const messages = {
      owned: { icon: <Package size={48} />, title: "Aucun NFT possédé", description: "Explorez le marketplace pour commencer votre collection" },
      created: { icon: <Brush size={48} />, title: "Aucun NFT créé", description: "Soumettez votre premier NFT" },
      onsale: { icon: <Tag size={48} />, title: "Aucun NFT en vente", description: "Mettez vos NFTs en vente pour les voir ici" }
    };
    const message = messages[type] || messages.owned;
    return (
      <div className="empty-state">
        <div className="empty-icon">{message.icon}</div>
        <h3>{message.title}</h3>
        <p>{message.description}</p>
        <button className="btn btn-primary" onClick={() => navigate(type === 'created' ? '/submit' : '/explore')}>
          {type === 'created' ? 'Créer un NFT' : 'Explorer le marketplace'}
        </button>
      </div>
    );
  };

  if (!isWalletConnected) return <Navigate to="/" replace />;

  const currentNFTs = getCurrentNFTs();

  return (
    <div className="portfolio">
      <div className="container">
        <div className="portfolio-header">
          <div className="header-content">
            <h1>Mon Portfolio</h1>
            <div className="wallet-address">
              <Wallet size={20} />
              <span>{walletAddress}</span>
            </div>
            <div className="wallet-balance">
              <DollarSign size={18} /> {balance?.formatted || '0.0'} {balance?.symbol || 'ETH'}
            </div>
          </div>
        </div>

        <div className="portfolio-controls">
          <div className="tabs">
            <button className={`tab ${activeTab === 'owned' ? 'active' : ''}`} onClick={() => setActiveTab('owned')}>
              <Package size={18} /> Possédés ({ownedNFTs.length})
            </button>
            <button className={`tab ${activeTab === 'created' ? 'active' : ''}`} onClick={() => setActiveTab('created')}>
              <Brush size={18} /> Créés ({createdNFTs.length})
            </button>
            <button className={`tab ${activeTab === 'onsale' ? 'active' : ''}`} onClick={() => setActiveTab('onsale')}>
              <Tag size={18} /> En vente ({onSaleNFTs.length})
            </button>
          </div>

          <div className="view-controls">
            <button className="toggle-values" onClick={() => setShowValues(!showValues)}>
              {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
              {showValues ? 'Masquer' : 'Afficher'} valeurs
            </button>

            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                <Grid size={18} />
              </button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="portfolio-content">
          {currentNFTs.length > 0 ? (
            <div className={`nfts-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
              {currentNFTs.map(nft => (
                <div key={nft.id} className="portfolio-nft-wrapper">
                  <NFTCard nft={nft} onClick={() => handleNFTClick(nft)} />
                  {activeTab === 'owned' && !nft.forSale && (
                    <button className="quick-action-btn" onClick={(e) => { e.stopPropagation(); handleNFTClick(nft); }}>
                      <Tag size={16} /> Mettre en vente
                    </button>
                  )}
                  {activeTab === 'onsale' && (
                    <div className="sale-info">
                      <span className="sale-price">Prix: {showValues ? `${nft.price} ETH` : '•••'}</span>
                      <button className="cancel-sale-btn" onClick={(e) => { e.stopPropagation(); console.log('Retirer de la vente:', nft.id); }}>
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

        <div className="portfolio-actions">
          <div className="action-card">
            <h3>Actions rapides</h3>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => navigate('/explore')}>
                <ShoppingBag /> <span>Acheter des NFTs</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/submit')}>
                <Brush /> <span>Créer un NFT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
