import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubmitNFT.css';
import { useAppContext } from '../../App';

const SubmitNFT = () => {
  const navigate = useNavigate();
  const { walletAddress, isWalletConnected } = useAppContext();
  const { mintNFT, isMinting, error } = useMint();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState('Art');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress) return alert('Connectez votre wallet d’abord');
    if (!name || !description || !imageFile || !price) return alert('Veuillez remplir tous les champs');

    try {
      await mintNFT({
        name,
        description,
        imageFile,
        category,
        price: parseFloat(price),
      });
      alert('NFT créé avec succès !');
      navigate('/explore');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création du NFT');
    }
  };

  return (
    <div className="submit-nft">
      <div className="container">
        <h1>Soumettre un NFT</h1>
        {!isWalletConnected && (
          <p className="warning">Connectez votre wallet pour pouvoir soumettre un NFT.</p>
        )}
        <form className="nft-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du NFT</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Art">Art</option>
              <option value="Music">Musique</option>
              <option value="Game">Jeu</option>
              <option value="Collectible">Collection</option>
            </select>
          </div>

          <div className="form-group">
            <label>Prix (ETH)</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={isMinting}>
            {isMinting ? 'Création en cours...' : 'Créer NFT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitNFT;
