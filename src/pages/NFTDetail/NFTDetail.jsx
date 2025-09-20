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
import { getNFTDetails, withdrawNFT, listNFTForSale } from '../../utils/contract';
import { getSubmittedNFTs, updateSubmittedNFT } from '../../utils/storage';
import { ethers } from 'ethers';

const NFTDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedNFT, isWalletConnected, walletAddress } = useAppContext();
  
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingPrice, setListingPrice] = useState('');

  // Charger le NFT
  useEffect(() => {
    loadNFTDetails();
  }, [id, selectedNFT]);

  const loadNFTDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Vérifier si c'est un NFT local
      if (id.startsWith('local-')) {
        const localId = parseInt(id.replace('local-', ''));
        const localNFTs = getSubmittedNFTs();
        const localNFT = localNFTs.find(nft => nft.id === localId);
        
        if (localNFT) {
          setNft({
            ...localNFT,
            isLocal: true,
            source: 'local'
          });
        } else {
          setError('NFT local non trouvé');
        }
        setLoading(false);
        return;
      }
      
      // NFT blockchain
      const nftId = parseInt(id);
      if (selectedNFT?.id === nftId) {
        setNft({...selectedNFT, isLocal: false, source: 'blockchain'});
        setLoading(false);
        return;
      }
      
      // Charger depuis le contrat
      try {
        const nftDetails = await getNFTDetails(nftId);
        setNft({
          ...nftDetails,
          isLocal: false,
          source: 'blockchain'
        });
      } catch (contractError) {
        setError(`NFT #${nftId} non trouvé.`);
      }
      
    } catch (error) {
      console.error('Erreur chargement NFT:', error);
      setError('Erreur lors du chargement du NFT');
    } finally {
      setLoading(false);
    }
  };

  // Calculer si l'utilisateur est propriétaire
  const isOwner = isWalletConnected && (
    nft?.isLocal || // Tout NFT local appartient à l'utilisateur connecté
    (walletAddress && nft?.owner && walletAddress.toLowerCase() === nft.owner.toLowerCase()) ||
    (walletAddress && nft?.creator && walletAddress.toLowerCase() === nft.creator.toLowerCase())
  );

  // Migrer vers la blockchain
const handleMigrateToBlockchain = async () => {
  let salePrice = null;
  
  const wantToSell = window.confirm(`Voulez-vous mettre "${nft.name}" en vente lors de la création sur la blockchain ?`);
  
  if (wantToSell) {
    salePrice = prompt('Prix de vente en ETH (ex: 2.5) :');
    if (!salePrice || parseFloat(salePrice) <= 0) {
      alert('Prix invalide');
      return;
    }
  }
  
  if (!window.confirm(`Créer "${nft.name}" sur la blockchain ?${salePrice ? ` Prix: ${salePrice} ETH` : ''}`)) return;

  setIsProcessing(true);
  try {
    const { getContract } = await import('../../utils/contract');
    const { contract } = await getContract();
    
    // Tests de diagnostic
    console.log('Test: Récupération prix listing...');
    const listingPrice = await contract.getListingPrice();
    console.log('Prix listing:', listingPrice.toString());
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const balance = await signer.getBalance();
    console.log('Solde:', ethers.utils.formatEther(balance), 'ETH');
    
    const metadata = {
      name: nft.name,
      description: nft.description,
      category: nft.category,
      attributes: nft.attributes,
      image: `https://picsum.photos/400/400?random=${Date.now()}`
    };
    
    const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
    const price = salePrice ? ethers.utils.parseEther(salePrice) : 0;
    
    console.log('TokenURI length:', tokenURI.length);
    
    const transaction = await contract.createToken(tokenURI, price, {
      value: listingPrice,
      gasLimit: 5000000
    });
    
    await transaction.wait();
    
    updateSubmittedNFT(nft.id, {
      blockchainStatus: 'minted',
      transactionHash: transaction.hash
    });
    
    setNft(prev => ({
      ...prev,
      blockchainStatus: 'minted',
      isLocal: false,
      source: 'blockchain',
      price: salePrice ? parseFloat(salePrice) : 0,
      forSale: !!salePrice
    }));
    
    alert('NFT migré vers la blockchain avec succès !');
    
  } catch (error) {
    console.error('Erreur migration:', error);
    alert('Erreur: ' + error.message);
  } finally {
    setIsProcessing(false);
  }
};

  // Mettre en vente
  const handleListForSale = () => {
    if (!isWalletConnected) {
      alert('Connectez votre wallet pour lister ce NFT');
      return;
    }
    setShowListingModal(true);
  };

  const confirmListing = async () => {
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      alert('Entrez un prix valide');
      return;
    }

    setIsProcessing(true);
    try {
      await listNFTForSale(nft.tokenId, listingPrice);
      
      setNft(prev => ({ 
        ...prev, 
        forSale: true, 
        price: parseFloat(listingPrice)
      }));
      
      setShowListingModal(false);
      setListingPrice('');
      alert('NFT mis en vente avec succès !');
      
    } catch (error) {
      console.error('Erreur mise en vente:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Retirer de la vente
  const handleWithdrawFromSale = async () => {
    if (!window.confirm(`Retirer "${nft.name}" de la vente ?`)) return;

    setIsProcessing(true);
    try {
      await withdrawNFT(nft.tokenId);
      
      setNft(prev => ({ 
        ...prev, 
        forSale: false, 
        owner: walletAddress
      }));
      
      alert('NFT retiré de la vente avec succès !');
      
    } catch (error) {
      console.error('Erreur retrait:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // États de chargement et d'erreur
  if (loading) {
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

  if (error || !nft) {
    return (
      <div className="nft-detail">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={64} />
            <h2>NFT non trouvé</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/explore')}>
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-detail">
      <div className="container">
        {/* Header */}
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/explore')}>
            <ArrowLeft size={20} />
            Retour
          </button>
        </div>

        {/* Contenu principal */}
        <div className="detail-content">
          {/* Image */}
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
          </div>

          {/* Informations */}
          <div className="detail-info-section">
            <div className="info-header">
              <div className="category-tag">{nft.category}</div>
              <h1 className="nft-title">{nft.name}</h1>

              <div className="token-id-display">
                <span className="token-id-label">Token ID:</span>
                <span className="token-id-value">#{nft.tokenId || nft.id || 'N/A'}</span>
              </div>

              <div className="ownership-info">
                <div className="owner-item">
                  <span className="label">Propriétaire</span>
                  <div className="address-link">
                    <User size={16} />
                    <span>{nft.owner || 'Vous'}</span>
                    {isOwner && <span className="you-badge">Vous</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Prix et actions */}
            <div className="price-section">
              <div className="price-info">
                <span className="price-label">Prix</span>
                <div className="price-value">
                  <DollarSign size={24} />
                  <span className="price-amount">{nft.price || 0}</span>
                  <span className="price-currency">ETH</span>
                </div>
              </div>

              {/* Actions selon le type de NFT et propriétaire */}
              <div className="action-buttons">
                {nft.isLocal ? (
                  // NFT LOCAL
                  <div className="local-actions">
                    <p className="local-info">
                      <AlertCircle size={16} />
                      Ce NFT est sauvegardé localement.
                    </p>
                    
                    {isOwner && (
                      <button 
                        className="btn btn-primary btn-large"
                        onClick={handleMigrateToBlockchain}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Migration...' : 'Migrer vers la blockchain'}
                      </button>
                    )}
                  </div>
                ) : (
                  // NFT BLOCKCHAIN
                  <div className="blockchain-actions">
                    {isOwner ? (
                      // PROPRIÉTAIRE
                      <div className="owner-actions">
                        {!nft.forSale ? (
                          <button 
                            className="btn btn-primary btn-large"
                            onClick={handleListForSale}
                            disabled={isProcessing}
                          >
                            <Tag size={20} />
                            Mettre en vente
                          </button>
                        ) : (
                          <button 
                            className="btn btn-secondary btn-large"
                            onClick={handleWithdrawFromSale}
                            disabled={isProcessing}
                          >
                            Retirer de la vente
                          </button>
                        )}
                      </div>
                    ) : (
                      // VISITEUR
                      <div className="buyer-actions">
                        {nft.forSale ? (
                          <button 
                            className="btn btn-primary btn-large"
                            disabled={isProcessing}
                          >
                            <ShoppingCart size={20} />
                            Acheter maintenant
                          </button>
                        ) : (
                          <p>Ce NFT n'est pas en vente</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="nft-description">
              <h3>Description</h3>
              <p>{nft.description}</p>
            </div>
          </div>
        </div>

        {/* Modal de listing */}
        {showListingModal && (
          <div className="modal-overlay" onClick={() => setShowListingModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Mettre en vente</h2>
              <div className="modal-content">
                <label>Prix (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Ex: 2.5"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                />
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
                  Confirmer
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