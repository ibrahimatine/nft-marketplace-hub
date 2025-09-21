import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import './SubmitNFT.css';
import { 
  Upload, 
  Image, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { categories } from '../../data/mockData';
import { useAppContext } from '../../App';
import { getContract } from '../../utils/contract';
import { saveSubmittedNFT, updateSubmittedNFT } from '../../utils/storage';
import { ethers } from 'ethers';

const SubmitNFT = () => {
  const navigate = useNavigate();
  const { isWalletConnected } = useAppContext();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedNFT, setSubmittedNFT] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Digital Art',
    price: '',
    forSale: false,
    image: null,
    imagePreview: null
  });
  
  const [errors, setErrors] = useState({});

  // Fonction pour compresser une image
  const compressImage = (file, maxSizeKB = 25) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions
        const maxDim = 400; // Taille maximum
        let { width, height } = img;

        if (width > height) {
          if (width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Commencer avec une qualité élevée et réduire si nécessaire
        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);

        // Réduire la qualité jusqu'à atteindre la taille cible
        while (result.length > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(result);
      };

      img.src = file;
    });
  };
  
  // Redirect if not connected
  useEffect(() => {
    if (!isWalletConnected) {
      navigate('/');
    }
  }, [isWalletConnected, navigate]);
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file selection - NOUVELLE VERSION avec sauvegarde de l'image
  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Seuls les fichiers image sont acceptés' }));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors(prev => ({ ...prev, image: 'La taille du fichier ne doit pas dépasser 10MB' }));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: imageDataUrl,
        imageDataUrl: imageDataUrl // Sauvegarder l'image en base64
      }));
      setErrors(prev => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(file);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    
    if (!formData.image) {
      newErrors.image = 'Une image est requise';
    }
    
    if (formData.forSale && (!formData.price || parseFloat(formData.price) <= 0)) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }
    
    return newErrors;
  };
  
  // Handle form submission - MODIFIÉ pour sauvegarder localement
// Remplacez votre fonction handleSubmit par celle-ci :

const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsSubmitting(true);

  try {
    if (formData.forSale) {
      console.log('Création NFT en vente directement sur la blockchain...');

      const { contract } = await getContract();

      if (!contract) {
        throw new Error('Contrat non disponible');
      }

      // Vérifier la taille de l'image
      const imageSize = formData.imageDataUrl ? formData.imageDataUrl.length : 0;
      console.log('Taille image base64:', imageSize, 'caractères');

      // Optimiser l'image selon sa taille
      let finalImage = formData.imageDataUrl;

      if (imageSize > 30000) { // 30KB limite pour éviter les problèmes
        console.log('Image trop grosse, compression en cours...');
        try {
          finalImage = await compressImage(formData.imageDataUrl, 25); // 25KB max
          console.log('Image compressée:', finalImage.length, 'caractères');
        } catch (err) {
          console.warn('Erreur compression, utilisation d\'un placeholder');
          finalImage = `https://picsum.photos/400/400?text=${encodeURIComponent(formData.name.substring(0, 20))}`;
        }
      } else {
        console.log('Image taille acceptable, utilisation de la vraie image');
      }

      // Créer un tokenURI minimal qui référence les métadonnées externes
      // Au lieu d'embarquer l'image dans le tokenURI, on crée un JSON minimal
      const metadata = {
        name: formData.name.substring(0, 30),
        description: formData.description.substring(0, 50),
        image: `https://picsum.photos/400/400?text=${encodeURIComponent(formData.name.substring(0, 10))}`
      };

      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      // Sauvegarder l'image réelle localement pour l'affichage
      const localMetadata = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image: finalImage // Garder la vraie image pour l'affichage local
      };

      // Vérifier et corriger le prix
      const priceValue = parseFloat(formData.price);
      console.log('Prix saisi:', formData.price, 'ETH');
      console.log('Prix parsé:', priceValue, 'ETH');

      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Prix invalide: ' + formData.price);
      }

      const price = ethers.utils.parseEther(priceValue.toString());
      console.log('Prix en Wei:', price.toString());
      console.log('Prix vérifié:', ethers.utils.formatEther(price), 'ETH');

      // Test de base du contrat d'abord
      console.log('Test de base du contrat...');
      let listingPrice;
      try {
        listingPrice = await contract.getListingPrice();
        console.log('✅ getListingPrice réussi:', ethers.utils.formatEther(listingPrice), 'ETH');
      } catch (err) {
        console.error('❌ Erreur getListingPrice:', err);
        throw new Error('Le contrat ne répond pas correctement: ' + err.message);
      }

      // Test de l'adresse du wallet
      const signer = await contract.signer.getAddress();
      console.log('Adresse du signer:', signer);

      // Test du solde
      const balance = await contract.signer.getBalance();
      console.log('Solde du wallet:', ethers.utils.formatEther(balance), 'ETH');

      console.log('Création du NFT sur la blockchain...');
      console.log('Prix:', ethers.utils.formatEther(price), 'ETH');
      console.log('Listing price:', ethers.utils.formatEther(listingPrice), 'ETH');
      console.log('TokenURI length:', tokenURI.length);
      console.log('TokenURI preview:', tokenURI.substring(0, 100) + '...');

      // Test des paramètres avant envoi
      console.log('Paramètres transaction:');
      console.log('- tokenURI:', typeof tokenURI, tokenURI.length, 'caractères');
      console.log('- price:', price.toString());
      console.log('- value (listingPrice):', listingPrice.toString());

      // Transaction avec paramètres conservateurs
      console.log('🚀 Envoi de la transaction...');
      const transaction = await contract.createToken(tokenURI, price, {
        value: listingPrice,
        gasLimit: 1000000, // Gas limit réduit mais suffisant
        gasPrice: ethers.utils.parseUnits('20', 'gwei') // Prix du gas explicite
      });

      console.log('Transaction envoyée:', transaction.hash);

      const receipt = await transaction.wait();
      console.log('Transaction confirmée:', receipt);

      console.log('NFT créé avec succès sur la blockchain!');

      // Extraire le token ID avec plusieurs méthodes de fallback
      let newTokenId = null;

      console.log('=== Extraction du Token ID ===');

      // Méthode 1: Chercher dans les logs bruts
      if (receipt.logs && receipt.logs.length > 0) {
        console.log('Méthode 1: Analyse des logs bruts...');
        console.log('Nombre de logs:', receipt.logs.length);

        // L'événement Transfer ERC721: Transfer(address from, address to, uint256 tokenId)
        // Topic[0] = signature de l'événement Transfer
        // Topic[1] = from address
        // Topic[2] = to address
        // Topic[3] = tokenId
        const transferLog = receipt.logs.find(log => {
          return log.topics &&
                 log.topics.length >= 4 &&
                 log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
        });

        if (transferLog) {
          try {
            newTokenId = ethers.BigNumber.from(transferLog.topics[3]).toString();
            console.log('✅ Token ID trouvé dans logs bruts:', newTokenId);
          } catch (error) {
            console.log('❌ Erreur parsing token ID des logs:', error.message);
          }
        } else {
          console.log('❌ Aucun Transfer log trouvé');
          // Debug: afficher tous les logs
          receipt.logs.forEach((log, index) => {
            console.log(`Log ${index}:`, {
              address: log.address,
              topics: log.topics,
              data: log.data
            });
          });
        }
      }

      // Méthode 2: Chercher dans les events parsés si disponibles
      if (!newTokenId && receipt.events) {
        console.log('Méthode 2: Analyse des events parsés...');
        console.log('Events disponibles:', Object.keys(receipt.events));

        const transferEvent = receipt.events.find(event => event.event === 'Transfer');
        if (transferEvent && transferEvent.args && transferEvent.args.tokenId) {
          newTokenId = transferEvent.args.tokenId.toString();
          console.log('✅ Token ID trouvé dans events parsés:', newTokenId);
        }
      }

      // Méthode 3: Utiliser totalSupply() comme fallback
      if (!newTokenId) {
        console.log('Méthode 3: Fallback via totalSupply...');
        try {
          const totalSupply = await contract.totalSupply();
          newTokenId = totalSupply.toString();
          console.log('✅ Token ID estimé via totalSupply:', newTokenId);
        } catch (error) {
          console.log('❌ Erreur totalSupply:', error.message);
        }
      }

      // Méthode 4: Parser manuellement les logs si tout le reste échoue
      if (!newTokenId && receipt.logs) {
        console.log('Méthode 4: Parsing manuel des logs...');
        for (const log of receipt.logs) {
          if (log.data && log.data !== '0x') {
            try {
              // Essayer de décoder les données comme un nombre
              const decoded = ethers.BigNumber.from(log.data);
              if (decoded.gt(0) && decoded.lt(1000000)) { // Token ID raisonnable
                newTokenId = decoded.toString();
                console.log('✅ Token ID trouvé via parsing manuel:', newTokenId);
                break;
              }
            } catch (error) {
              // Ignorer les erreurs de parsing
            }
          }
        }
      }

      // Si rien ne fonctionne, utiliser un timestamp unique
      if (!newTokenId) {
        console.log('⚠️ Fallback: Utilisation d\'un ID temporaire');
        newTokenId = `temp-${Date.now()}`;
      }

      console.log('🎯 Token ID final:', newTokenId);

      // Sauvegarder les vraies métadonnées localement avec le token ID
      const nftData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.forSale ? parseFloat(formData.price) : 0,
        forSale: formData.forSale,
        image: finalImage, // Vraie image
        likes: 0,
        views: 0,
        owner: 'Vous',
        seller: formData.forSale ? 'Vous' : null,
        tokenId: newTokenId,
        blockchainStatus: 'minted',
        transactionHash: transaction.hash
      };

      const savedNFT = saveSubmittedNFT(nftData);
      console.log('Métadonnées complètes sauvegardées localement:', savedNFT);

      setSubmittedNFT({
        name: formData.name,
        tokenId: newTokenId,
        transactionHash: transaction.hash,
        blockchainStatus: 'minted'
      });
      setSubmitted(true);

      setTimeout(() => {
        navigate('/portfolio');
      }, 3000);

    } else {
      console.log('Création NFT en mode local uniquement...');

      const nftData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: 0,
        forSale: false,
        image: formData.imageDataUrl,
        likes: 0,
        views: 0,
        owner: 'Vous',
        seller: null,
        tokenId: null,
        contractAddress: null,
        blockchainStatus: 'local-only'
      };

      const savedNFT = saveSubmittedNFT(nftData);
      console.log('NFT sauvegardé localement:', savedNFT);

      setSubmittedNFT(savedNFT);
      setSubmitted(true);

      setTimeout(() => {
        navigate('/portfolio');
      }, 3000);
    }

  } catch (error) {
    console.error('Erreur création NFT complète:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error data:', error.data);

    let errorMessage = 'Erreur lors de la création du NFT';

    if (error.message && error.message.includes('insufficient funds')) {
      errorMessage = 'Fonds insuffisants pour payer les frais de gas';
    } else if (error.message && error.message.includes('user rejected')) {
      errorMessage = 'Transaction annulée par l\'utilisateur';
    } else if (error.code === -32603) {
      errorMessage = 'Erreur interne du réseau blockchain. Vérifiez que le réseau Hardhat fonctionne correctement.';
    } else if (error.code === 4001) {
      errorMessage = 'Transaction annulée par l\'utilisateur';
    } else if (error.message && error.message.includes('gas')) {
      errorMessage = 'Erreur de gas. Vérifiez votre solde ETH.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    setErrors({ submit: errorMessage });
  } finally {
    setIsSubmitting(false);
  }
};
  
  if (!isWalletConnected) {
    return <Navigate to="/" replace />;
  }
  
  if (submitted) {
    return (
      <div className="submit-nft">
      <div className="container">
      <div className="success-message">
      <CheckCircle size={64} className="success-icon" />
      <h2>NFT créé avec succès!</h2>

      {submittedNFT?.blockchainStatus === 'minted' ? (
        <div>
          <p>🎉 Votre NFT "{submittedNFT?.name}" a été créé sur la blockchain et mis en vente!</p>
          <p className="blockchain-success">✅ Token ID: #{submittedNFT?.tokenId}</p>
          {submittedNFT?.transactionHash && (
            <p className="transaction-hash">📝 Transaction: {submittedNFT.transactionHash}</p>
          )}
        </div>
      ) : (
        <div>
          <p>Votre NFT "{submittedNFT?.name}" a été sauvegardé localement.</p>
          <p className="local-info">💾 Visible dans votre portfolio</p>
        </div>
      )}
      <button 
      className="btn btn-primary"
      onClick={() => navigate('/portfolio')}
      >
      Voir mon portfolio
      </button>
      </div>
      </div>
      </div>
    );
  }
  
  return (
    <div className="submit-nft">
    <div className="container">
    {/* Header */}
    <div className="submit-header">
    <button 
    className="back-button"
    onClick={() => navigate('/explore')}
    >
    <ArrowLeft size={20} />
    Retour
    </button>
    <div className="header-content">
    <h1>Créer un nouveau NFT</h1>
    <p>Téléchargez votre œuvre et ajoutez les détails pour créer votre NFT</p>
    </div>
    </div>
    
    <form onSubmit={handleSubmit} className="submit-form">
    <div className="form-grid">
    {/* Left Column - Image Upload */}
    <div className="upload-section">
    <h3>Image de votre NFT *</h3>
    
    {!formData.imagePreview ? (
      <div
      className={`upload-zone ${dragActive ? 'drag-active' : ''} ${errors.image ? 'error' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      >
      <div className="upload-content">
      <Upload size={48} />
      <h4>Glissez votre image ici</h4>
      <p>ou cliquez pour sélectionner un fichier</p>
      <span className="upload-hint">PNG, JPG, GIF jusqu'à 10MB</span>
      </div>
      </div>
    ) : (
      <div className="image-preview">
      <img src={formData.imagePreview} alt="Preview" />
      <div className="preview-overlay">
      <button
      type="button"
      className="preview-action"
      onClick={() => setFormData(prev => ({ 
        ...prev, 
        image: null, 
        imagePreview: null,
        imageDataUrl: null
      }))}
      >
      <X size={20} />
      </button>
      <button
      type="button"
      className="preview-action"
      onClick={() => fileInputRef.current?.click()}
      >
      <Upload size={20} />
      </button>
      </div>
      </div>
    )}
    
    {errors.image && (
      <div className="error-message">
      <AlertCircle size={16} />
      <span>{errors.image}</span>
      </div>
    )}
    
    <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
    style={{ display: 'none' }}
    />
    </div>
    
    {/* Right Column - Form Fields - RESTE IDENTIQUE */}
    <div className="form-section">
    <div className="form-group">
    <label>Nom du NFT *</label>
    <input
    type="text"
    name="name"
    value={formData.name}
    onChange={handleInputChange}
    placeholder="Ex: Mon œuvre unique #1"
    className={errors.name ? 'error' : ''}
    />
    {errors.name && (
      <div className="error-message">
      <AlertCircle size={16} />
      <span>{errors.name}</span>
      </div>
    )}
    </div>
    
    <div className="form-group">
    <label>Description *</label>
    <textarea
    name="description"
    value={formData.description}
    onChange={handleInputChange}
    placeholder="Décrivez votre NFT, son inspiration, ses caractéristiques..."
    rows={4}
    className={errors.description ? 'error' : ''}
    />
    {errors.description && (
      <div className="error-message">
      <AlertCircle size={16} />
      <span>{errors.description}</span>
      </div>
    )}
    </div>
    
    <div className="form-group">
    <label>Catégorie</label>
    <select
    name="category"
    value={formData.category}
    onChange={handleInputChange}
    >
    {categories.filter(cat => cat !== 'Tous').map(category => (
      <option key={category} value={category}>{category}</option>
    ))}
    </select>
    </div>
    
    {/* Sale Options */}
    <div className="form-group">
    <label className="checkbox-label">
    <input
    type="checkbox"
    name="forSale"
    checked={formData.forSale}
    onChange={handleInputChange}
    />
    <span>Mettre en vente immédiatement</span>
    </label>
    </div>
    
    {formData.forSale && (
      <div className="form-group">
      <label>Prix de vente (ETH) *</label>
      <input
      type="number"
      name="price"
      value={formData.price}
      onChange={handleInputChange}
      placeholder="Ex: 2.5"
      step="0.001"
      min="0"
      className={errors.price ? 'error' : ''}
      />
      {errors.price && (
        <div className="error-message">
        <AlertCircle size={16} />
        <span>{errors.price}</span>
        </div>
      )}
      </div>
    )}
    </div>
    </div>
    
    {/* Submit Section */}
    <div className="submit-section">
    {errors.submit && (
      <div className="error-message submit-error">
      <AlertCircle size={16} />
      <span>{errors.submit}</span>
      </div>
    )}
    
    <div className="submit-actions">
    <button
    type="button"
    className="btn btn-secondary"
    onClick={() => navigate('/explore')}
    disabled={isSubmitting}
    >
    Annuler
    </button>
    <button
    type="submit"
    className="btn btn-primary btn-large"
    disabled={isSubmitting}
    >
    {isSubmitting ? (
      <>
      <Loader className="spinning" size={20} />
      Création en cours...
      </>
    ) : (
      <>
      <Eye size={20} />
      Créer le NFT
      </>
    )}
    </button>
    </div>
    
    <p className="submit-note">
    En créant ce NFT, vous acceptez nos conditions d'utilisation.
    {formData.forSale
      ? " ⚡ Ce NFT sera créé directement sur la blockchain et mis en vente. Des frais de gas seront appliqués."
      : " 💾 Ce NFT sera sauvegardé localement sans frais."
    }
    </p>
    </div>
    </form>
    </div>
    </div>
  );
};

export default SubmitNFT;