import React, { useState } from 'react';
import './NFTCard.css';
import { TrendingUp, Clock, Heart, Eye } from 'lucide-react';

const NFTCard = ({ nft, badge, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const renderBadge = () => {
    if (!badge) return null;
    
    let icon;
    let className = 'nft-card-badge';
    
    switch(badge.type) {
      case 'trending':
        icon = <TrendingUp size={14} />;
        className += ' badge-trending';
        break;
      case 'new':
        icon = <Clock size={14} />;
        className += ' badge-new';
        break;
      default:
        icon = null;
    }
    
    return (
      <div className={className}>
        {icon}
        <span>{badge.text}</span>
      </div>
    );
  };

  return (
    <div 
      className={`nft-card ${isHovered ? 'nft-card-hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(nft)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="nft-card-image-container">
        <img src={nft.image} alt={nft.name} className="nft-card-image" />
        {renderBadge()}
        
        <div className="nft-card-overlay">
          <button className="nft-card-action" onClick={handleLike}>
            <Heart size={20} fill={isLiked ? '#EF4444' : 'none'} color={isLiked ? '#EF4444' : '#fff'} />
            <span>{nft.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button className="nft-card-action">
            <Eye size={20} />
            <span>{nft.views}</span>
          </button>
        </div>
      </div>
      
      <div className="nft-card-info">
        <div className="nft-card-header">
          <h3 className="nft-card-name">{nft.name}</h3>
          {nft.forSale && <span className="nft-card-sale-badge">En vente</span>}
        </div>
        
        <div className="nft-card-token">
          <span className="token-label">Token ID:</span>
          <span className="token-value">#{nft.tokenId || nft.id || 'N/A'}</span>
        </div>
        
        <div className="nft-card-footer">
          <div className="nft-card-price">
            <span className="nft-card-price-label">Prix actuel</span>
            <span className="nft-card-price-value">{nft.price} ETH</span>
          </div>
          {nft.category && (
            <span className="nft-card-category">{nft.category}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTCard;