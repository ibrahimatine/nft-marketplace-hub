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
  Plus,
  Trash2,
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
    imagePreview: null,
    attributes: []
  });
  
  const [errors, setErrors] = useState({});
  const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' });
  
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
  
  // Add attribute
  const addAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute, id: Date.now() }]
      }));
      setNewAttribute({ trait_type: '', value: '' });
    }
  };
  
  // Remove attribute
  const removeAttribute = (id) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter(attr => attr.id !== id)
    }));
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
    // 1. Sauvegarder le NFT localement IMMÉDIATEMENT
    const nftData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.forSale ? parseFloat(formData.price) : 0,
      forSale: formData.forSale,
      image: formData.imageDataUrl,
      attributes: formData.attributes,
      likes: 0,
      views: 0,
      owner: 'Vous',
      seller: formData.forSale ? 'Vous' : null,
      tokenId: null,
      contractAddress: null,
      blockchainStatus: 'pending'
    };
    
    const savedNFT = saveSubmittedNFT(nftData);
    console.log('NFT sauvegardé localement:', savedNFT);
    
    // 2. Option pour activer/désactiver la blockchain
    const ENABLE_BLOCKCHAIN = false; // Mettez à true quand votre contrat sera prêt
    
    if (ENABLE_BLOCKCHAIN && formData.forSale) {
      try {
        const { contract } = await getContract();
        
        // Vérifier que le contrat existe
        if (!contract) {
          throw new Error('Contrat non disponible');
        }
        
        // Créer les métadonnées
        const metadata = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          attributes: formData.attributes,
          image: formData.imageDataUrl
        };
        
        const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
        const price = ethers.utils.parseEther(formData.price.toString());
        
        // Obtenir le prix de listing
        let listingPrice = ethers.utils.parseEther("0");
        try {
          listingPrice = await contract.getListingPrice();
          console.log('Prix de listing:', ethers.utils.formatEther(listingPrice), 'ETH');
        } catch (err) {
          console.log('Impossible de récupérer le prix de listing, utilisation de 0');
        }
        
        console.log('Création du NFT sur la blockchain...');
        console.log('Prix:', ethers.utils.formatEther(price), 'ETH');
        console.log('Listing price:', ethers.utils.formatEther(listingPrice), 'ETH');
        
        // Essayer avec un gas limit plus bas
        const transaction = await contract.createToken(tokenURI, price, {
          value: listingPrice,
          gasLimit: 300000 // Gas limit plus raisonnable
        });
        
        console.log('Transaction envoyée:', transaction.hash);
        
        // Attendre la confirmation
        const receipt = await transaction.wait();
        console.log('Transaction confirmée:', receipt);
        
        // Mettre à jour le NFT local
        updateSubmittedNFT(savedNFT.id, {
          blockchainStatus: 'minted',
          transactionHash: transaction.hash,
          tokenId: receipt.events?.[0]?.args?.tokenId?.toString() || 'unknown'
        });
        
        console.log('NFT créé avec succès sur la blockchain!');
        
      } catch (blockchainError) {
        console.error('Erreur blockchain détaillée:', blockchainError);
        
        // Analyser l'erreur pour donner plus d'infos
        let errorMessage = 'Erreur blockchain';
        
        if (blockchainError.message?.includes('insufficient funds')) {
          errorMessage = 'Fonds insuffisants pour payer les frais de gas';
        } else if (blockchainError.message?.includes('user rejected')) {
          errorMessage = 'Transaction annulée par l\'utilisateur';
        } else if (blockchainError.code === -32603) {
          errorMessage = 'Erreur du contrat smart (vérifiez que le contrat est bien déployé)';
        }
        
        // Mettre à jour le statut
        updateSubmittedNFT(savedNFT.id, {
          blockchainStatus: 'local-only',
          error: errorMessage
        });
        
        console.log('NFT sauvegardé localement uniquement (mode hors-ligne)');
      }
    } else {
      // Mode local uniquement
      updateSubmittedNFT(savedNFT.id, {
        blockchainStatus: 'local-only'
      });
      console.log('NFT créé en mode local uniquement');
    }
    
    // 3. Afficher le succès (le NFT est au moins sauvegardé localement)
    setSubmittedNFT(savedNFT);
    setSubmitted(true);
    
    // Rediriger vers portfolio après 3 secondes
    setTimeout(() => {
      navigate('/portfolio');
    }, 3000);
    
  } catch (error) {
    console.error('Erreur création NFT:', error);
    setErrors({ submit: 'Erreur lors de la création du NFT: ' + error.message });
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
      <p>Votre NFT "{submittedNFT?.name}" a été sauvegardé et sera visible dans votre portfolio.</p>
      {submittedNFT?.blockchainStatus === 'minted' && (
        <p className="blockchain-success">✅ Également créé sur la blockchain!</p>
      )}
      {submittedNFT?.blockchainStatus === 'failed' && (
        <p className="blockchain-warning">⚠️ Sauvegardé localement (erreur blockchain)</p>
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
    
    {/* Attributes Section */}
    <div className="attributes-section">
    <h4>Propriétés (optionnel)</h4>
    <p>Ajoutez des attributs pour rendre votre NFT plus unique</p>
    
    <div className="attribute-input">
    <input
    type="text"
    placeholder="Type (ex: Couleur)"
    value={newAttribute.trait_type}
    onChange={(e) => setNewAttribute(prev => ({ ...prev, trait_type: e.target.value }))}
    />
    <input
    type="text"
    placeholder="Valeur (ex: Bleu)"
    value={newAttribute.value}
    onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
    />
    <button
    type="button"
    className="btn btn-secondary btn-small"
    onClick={addAttribute}
    disabled={!newAttribute.trait_type || !newAttribute.value}
    >
    <Plus size={16} />
    </button>
    </div>
    
    {formData.attributes.length > 0 && (
      <div className="attributes-list">
      {formData.attributes.map(attr => (
        <div key={attr.id} className="attribute-tag">
        <span className="attr-type">{attr.trait_type}</span>
        <span className="attr-value">{attr.value}</span>
        <button
        type="button"
        onClick={() => removeAttribute(attr.id)}
        className="remove-attr"
        >
        <X size={14} />
        </button>
        </div>
      ))}
      </div>
    )}
    </div>
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
      ? " Des frais de création et de listing seront appliqués."
      : " Aucun frais - le NFT sera sauvegardé localement."
    }
    </p>
    </div>
    </form>
    </div>
    </div>
  );
};

export default SubmitNFT;