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
import { getNFTDetails, withdrawNFT, listNFTForSale, buyNFT } from '../../utils/contract';
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
        setNft(selectedNFT); // Utiliser directement selectedNFT tel qu'il est
        setLoading(false);
        return;
      }
      
      // Charger depuis le contrat - RÉACTIVÉ
      try {
        const nftDetails = await getNFTDetails(nftId);
        setNft(nftDetails); // Utiliser directement les données retournées par getNFTDetails
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
    id.startsWith('local-') || // Tout NFT local appartient à l'utilisateur connecté
    (walletAddress && nft?.owner && walletAddress.toLowerCase() === nft.owner.toLowerCase()) ||
    (walletAddress && nft?.creator && walletAddress.toLowerCase() === nft.creator.toLowerCase()) ||
    (walletAddress && nft?.seller && walletAddress.toLowerCase() === nft.seller.toLowerCase()) // Ajout: si vous êtes le vendeur
  );

  // Migrer vers la blockchain - RÉACTIVÉ
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

    let imageToUse = nft.image;

    // Vérifier la taille de l'image base64
    const imageSize = nft.image ? nft.image.length : 0;
    console.log('Taille image base64:', imageSize, 'caractères');

    // Si l'image est trop grosse, proposer une alternative
    if (imageSize > 15000) {
      const useSmaller = window.confirm(
        `⚠️ Image très lourde (${Math.round(imageSize/1000)}k caractères en base64)\n\n` +
        `Cela va coûter beaucoup de gas et peut échouer.\n\n` +
        `Voulez-vous utiliser une image placeholder temporaire ?\n\n` +
        `✅ OUI = Image placeholder (migration rapide)\n` +
        `❌ NON = Garder votre image (gas élevé)`
      );

      if (useSmaller) {
        // Image placeholder petite (SVG simple)
        imageToUse = `data:image/svg+xml;base64,${btoa(`
          <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#667eea"/>
            <text x="50" y="40" text-anchor="middle" fill="white" font-size="10">NFT</text>
            <text x="50" y="60" text-anchor="middle" fill="white" font-size="8">${nft.name}</text>
          </svg>
        `)}`;
        console.log('✅ Utilisation image placeholder');
      }
    }

    const metadata = {
      name: nft.name,
      description: nft.description,
      category: nft.category,
      image: imageToUse
    };

    const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
    const price = salePrice ? ethers.utils.parseEther(salePrice) : 0;

    console.log('TokenURI final length:', tokenURI.length);

    // Vérifier la taille du TokenURI pour éviter les erreurs de gas
    if (tokenURI.length > 20000) {
      console.warn('TokenURI très long:', tokenURI.length, 'caractères');
      const confirm = window.confirm(`Attention: TokenURI très long (${tokenURI.length} caractères).\nCela va coûter beaucoup de gas.\nContinuer quand même ?`);
      if (!confirm) return;
    }

    const transaction = await contract.createToken(tokenURI, price, {
      value: listingPrice,
      gasLimit: 8000000 // Augmenté pour les gros TokenURI
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

  // Retirer de la vente - RÉACTIVÉ
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

  // Acheter un NFT - RÉACTIVÉ
  const handleBuyNFT = async () => {

    if (!isWalletConnected) {
      alert('Connectez votre wallet pour acheter ce NFT');
      return;
    }

    const confirmMessage = `Acheter "${nft.name}" pour ${nft.price} ETH ?\n\nCette action est irréversible.`;
    if (!window.confirm(confirmMessage)) return;

    setIsProcessing(true);
    try {
      console.log('Début de l\'achat du NFT:', nft.tokenId);

      const result = await buyNFT(nft.tokenId, nft.price);

      console.log('Achat réussi:', result);

      // Mettre à jour l'état du NFT
      setNft(prev => ({
        ...prev,
        owner: walletAddress,
        forSale: false,
        sold: true
      }));

      alert(`🎉 Félicitations ! Vous avez acheté "${nft.name}" avec succès !\n\nTransaction: ${result.transactionRecord.transactionHash}`);

      // Rediriger vers le portfolio après un délai
      setTimeout(() => {
        navigate('/portfolio');
      }, 2000);

    } catch (error) {
      console.error('Erreur achat NFT:', error);

      // Messages d'erreur plus spécifiques
      let errorMessage = 'Erreur lors de l\'achat du NFT';

      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Solde ETH insuffisant pour effectuer cet achat';
      } else if (error.message.includes('Solde insuffisant')) {
        errorMessage = error.message;
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction annulée par l\'utilisateur';
      } else if (error.message.includes('already sold')) {
        errorMessage = 'Ce NFT a déjà été vendu';
      } else if (error.message.includes('not listed')) {
        errorMessage = 'Ce NFT n\'est plus en vente';
      }

      alert(errorMessage);
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
              <img
                src={nft.image || 'https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=No+Image'}
                alt={nft.name}
                className="nft-image"
              />
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
                {/* Logique simplifiée: si l'URL contient 'local-', c'est un NFT local */}
                {id.startsWith('local-') ? (
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
                            onClick={handleBuyNFT}
                            disabled={isProcessing}
                          >
                            <ShoppingCart size={20} />
                            {isProcessing ? 'Achat en cours...' : 'Acheter maintenant'}
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