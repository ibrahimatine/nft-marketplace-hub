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
import { ethers } from 'ethers';

const SubmitNFT = () => {
  const navigate = useNavigate();
  const { isWalletConnected } = useAppContext();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
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

  // Handle file selection
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
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: e.target.result
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Obtenir le contrat
      const { contract } = await getContract();
      
      // Créer un URI simple pour les métadonnées (en attendant IPFS)
      const metadata = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        attributes: formData.attributes,
        image: `https://picsum.photos/400/400?random=${Date.now()}`
      };
      
      // Pour l'instant, utiliser une URL d'image placeholder
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      
      // Préparer le prix
      const price = formData.forSale ? ethers.utils.parseEther(formData.price) : 0;
      
      // Obtenir les frais de listing si NFT en vente
      let listingPrice = 0;
      if (formData.forSale) {
        listingPrice = await contract.getListingPrice();
      }
      
      console.log('Création du NFT...');
      console.log('Prix:', price.toString());
      console.log('Frais de listing:', listingPrice.toString());
      
      // Créer le token
      const transaction = await contract.createToken(tokenURI, price, {
        value: listingPrice
      });
      
      console.log('Transaction envoyée:', transaction.hash);
      
      // Attendre confirmation
      await transaction.wait();
      
      console.log('NFT créé avec succès!');
      setSubmitted(true);
      
      // Rediriger vers portfolio après 2 secondes
      setTimeout(() => {
        navigate('/portfolio');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur création NFT:', error);
      let errorMessage = 'Erreur lors de la création du NFT';
      
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction annulée par l\'utilisateur';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Fonds insuffisants pour payer les frais';
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
            <p>Votre NFT "{formData.name}" a été créé et ajouté à votre collection.</p>
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
                      onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
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

            {/* Right Column - Form Fields */}
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
              Des frais de création seront appliqués.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitNFT;