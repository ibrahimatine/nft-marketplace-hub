import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import './NFTDetail.css';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ExternalLink, 
  Clock,
  TrendingUp,
  User,
  Calendar,
  Tag,
  Eye,
  AlertCircle,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { useAppContext } from '../../App';
import { mockNFTs } from '../../data/mockData';

const NFTDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedNFT, isWalletConnected, walletAddress } = useAppContext();
  
  const [nft, setNft] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [listingPrice, setListingPrice] = useState('');
  const [showListingModal, setShowListingModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Récupérer le NFT par ID
  useEffect(() => {
    const nftId = parseInt(id);
    // Essayer d'abord le selectedNFT du contexte, sinon chercher dans mockNFTs
    const foundNFT = selectedNFT?.id === nftId ? selectedNFT : mockNFTs.find(n => n.id === nftId);
    setNft(foundNFT || null);
  }, [id, selectedNFT]);

  // Loading state
  if (!nft) {
    return (
      <div className="nft-detail">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  // Si NFT non trouvé après tentative de récupération, rediriger
  if (nft === null) {
    return <Navigate to="/explore" replace />;
  }

  const isOwner = isWalletConnected && walletAddress === nft.owner;

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
    // Copier le lien dans le presse-papier
    navigator.clipboard.writeText(window.location.href);
  };

  const handleBack = () => {
    navigate('/explore');
  };

  const handleListForSale = () => {
    if (!isWalletConnected) {
      alert('Veuillez connecter votre wallet pour lister ce NFT');
      return;
    }
    setShowListingModal(true);
  };

  const confirmListing = () => {
    console.log(`NFT listé pour ${listingPrice} ETH`);
    setShowListingModal(false);
    setListingPrice('');
    // Ici, vous appelleriez votre smart contract pour lister le NFT
  };

  const handleBuy = () => {
    if (!isWalletConnected) {
      alert('Veuillez connecter votre wallet pour acheter ce NFT');
      return;
    }
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    console.log(`Achat du NFT pour ${nft.price} ETH`);
    setShowPurchaseModal(false);
    // Ici, vous appelleriez votre smart contract pour acheter le NFT
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `${price} ETH`;
  };

  return (
    <div className="nft-detail">
      <div className="container">
        {/* Header avec bouton retour */}
        <div className="detail-header">
          <button 
            className="back-button"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          
          <div className="detail-actions">
            <button 
              className={`action-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{nft.likes + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button className="action-btn" onClick={handleShare}>
              <Share2 size={20} />
              {showShareMenu && (
                <span className="share-tooltip">Lien copié!</span>
              )}
            </button>
            
            <button className="action-btn">
              <ExternalLink size={20} />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="detail-content">
          {/* Section image */}
          <div className="detail-image-section">
            <div className="image-container">
              <img src={nft.image} alt={nft.name} className="nft-image" />
              {nft.forSale && !isOwner && (
                <div className="sale-badge">
                  <ShoppingCart size={16} />
                  En vente
                </div>
              )}
            </div>
            
            <div className="image-stats">
              <div className="stat">
                <Eye size={16} />
                <span>{nft.views} vues</span>
              </div>
              <div className="stat">
                <Heart size={16} />
                <span>{nft.likes} likes</span>
              </div>
              <div className="stat">
                <Calendar size={16} />
                <span>Créé le {formatDate(nft.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Section informations */}
          <div className="detail-info-section">
            <div className="info-header">
              <div className="category-tag">{nft.category}</div>
              <h1 className="nft-title">{nft.name}</h1>
              
              <div className="ownership-info">
                <div className="owner-item">
                  <span className="label">Créateur</span>
                  <div className="address-link">
                    <User size={16} />
                    <span>{nft.creator}</span>
                  </div>
                </div>
                <div className="owner-item">
                  <span className="label">Propriétaire actuel</span>
                  <div className="address-link">
                    <User size={16} />
                    <span>{nft.owner}</span>
                    {isOwner && <span className="you-badge">Vous</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Prix et actions */}
            <div className="price-section">
              <div className="price-info">
                <span className="price-label">Prix actuel</span>
                <div className="price-value">
                  <DollarSign size={24} />
                  <span className="price-amount">{nft.price}</span>
                  <span className="price-currency">ETH</span>
                </div>
                <span className="price-usd">≈ ${(nft.price * 3000).toFixed(2)} USD</span>
              </div>

              <div className="action-buttons">
                {isOwner ? (
                  <>
                    {!nft.forSale && (
                      <button 
                        className="btn btn-primary btn-large"
                        onClick={handleListForSale}
                      >
                        <Tag size={20} />
                        Mettre en vente
                      </button>
                    )}
                    {nft.forSale && (
                      <button className="btn btn-secondary btn-large">
                        Retirer de la vente
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {nft.forSale && (
                      <button 
                        className="btn btn-primary btn-large"
                        onClick={handleBuy}
                      >
                        <ShoppingCart size={20} />
                        Acheter maintenant
                      </button>
                    )}
                    <button className="btn btn-secondary btn-large">
                      <TrendingUp size={20} />
                      Faire une offre
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              <div className="tab-buttons">
                <button 
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Détails
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  Historique
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'attributes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('attributes')}
                >
                  Attributs
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'details' && (
                  <div className="details-content">
                    <div className="description">
                      <h3>Description</h3>
                      <p>{nft.description}</p>
                    </div>
                    
                    <div className="contract-info">
                      <h3>Informations du contrat</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Adresse du contrat</span>
                          <span className="value mono">{nft.contractAddress}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Token ID</span>
                          <span className="value mono">{nft.tokenId}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Standard</span>
                          <span className="value">ERC-721</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Blockchain</span>
                          <span className="value">Ethereum</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="history-content">
                    <h3>Historique des transactions</h3>
                    <div className="history-list">
                      {nft.transfers && nft.transfers.map((transfer, index) => (
                        <div key={index} className="history-item">
                          <div className="history-icon">
                            {transfer.price ? <ShoppingCart size={20} /> : <Clock size={20} />}
                          </div>
                          <div className="history-details">
                            <div className="history-type">
                              {transfer.price ? 'Vente' : 'Mint'}
                            </div>
                            <div className="history-info">
                              De: <span className="mono">{transfer.from}</span>
                            </div>
                            <div className="history-info">
                              À: <span className="mono">{transfer.to}</span>
                            </div>
                            <div className="history-date">
                              {formatDate(transfer.date)}
                            </div>
                          </div>
                          {transfer.price && (
                            <div className="history-price">
                              {formatPrice(transfer.price)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'attributes' && (
                  <div className="attributes-content">
                    <h3>Propriétés</h3>
                    <div className="attributes-grid">
                      <div className="attribute-card">
                        <span className="attr-label">Catégorie</span>
                        <span className="attr-value">{nft.category}</span>
                        <span className="attr-rarity">15% ont cet attribut</span>
                      </div>
                      <div className="attribute-card">
                        <span className="attr-label">Collection</span>
                        <span className="attr-value">Genesis</span>
                        <span className="attr-rarity">5% ont cet attribut</span>
                      </div>
                      <div className="attribute-card">
                        <span className="attr-label">Rareté</span>
                        <span className="attr-value">Rare</span>
                        <span className="attr-rarity">10% ont cet attribut</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de mise en vente */}
        {showListingModal && (
          <div className="modal-overlay" onClick={() => setShowListingModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Mettre en vente ce NFT</h2>
              <div className="modal-content">
                <label>Prix de vente (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Ex: 2.5"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                />
                <div className="info-message">
                  <AlertCircle size={16} />
                  <span>Des frais de 2.5% seront appliqués lors de la vente</span>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowListingModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={confirmListing}
                  disabled={!listingPrice || parseFloat(listingPrice) <= 0}
                >
                  Confirmer la mise en vente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'achat */}
        {showPurchaseModal && (
          <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Confirmer l'achat</h2>
              <div className="modal-content">
                <div className="purchase-summary">
                  <img src={nft.image} alt={nft.name} className="purchase-image" />
                  <div className="purchase-details">
                    <h3>{nft.name}</h3>
                    <div className="price-breakdown">
                      <div className="price-line">
                        <span>Prix</span>
                        <span>{nft.price} ETH</span>
                      </div>
                      <div className="price-line">
                        <span>Frais de service</span>
                        <span>{(nft.price * 0.025).toFixed(4)} ETH</span>
                      </div>
                      <div className="price-line total">
                        <span>Total</span>
                        <span>{(nft.price * 1.025).toFixed(4)} ETH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowPurchaseModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={confirmPurchase}
                >
                  Confirmer l'achat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTDetail;