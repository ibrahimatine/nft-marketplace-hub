import React, { useState, useEffect } from 'react';
import './Explore.css';
import NFTCard from '../../components/NFTCard/NFTCard';
import { Filter, Search, Grid, List } from 'lucide-react';
import { mockNFTs, categories, priceFilters } from '../../data/mockData';

const Explore = ({ onNavigate, isWalletConnected }) => {
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(priceFilters[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyForSale, setShowOnlyForSale] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setNfts(mockNFTs);
    setFilteredNfts(mockNFTs);
  }, []);

  useEffect(() => {
    filterNFTs();
  }, [selectedCategory, selectedPriceFilter, searchQuery, showOnlyForSale, nfts]);

  const filterNFTs = () => {
    let filtered = [...nfts];

    // Filtre par catégorie
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(nft => nft.category === selectedCategory);
    }

    // Filtre par prix
    filtered = filtered.filter(nft => 
      nft.price >= selectedPriceFilter.min && 
      nft.price <= selectedPriceFilter.max
    );

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre "en vente uniquement"
    if (showOnlyForSale) {
      filtered = filtered.filter(nft => nft.forSale);
    }

    setFilteredNfts(filtered);
    setCurrentPage(1);
  };

  const handleNFTClick = (nft) => {
    onNavigate('nft-detail', nft);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNfts = filteredNfts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNfts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="explore">
      <div className="container">
        {/* Header */}
        <div className="explore-header">
          <h1 className="explore-title">Explorer les NFTs</h1>
          <p className="explore-subtitle">
            Découvrez {filteredNfts.length} œuvres uniques dans notre collection
          </p>
        </div>

        {/* Filters Bar */}
        <div className="explore-filters">
          <div className="filters-row">
            {/* Search */}
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Rechercher des NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Toggle */}
            <div className="view-toggle">
              <button 
                className={`view-btn ${gridView ? 'active' : ''}`}
                onClick={() => setGridView(true)}
              >
                <Grid size={20} />
              </button>
              <button 
                className={`view-btn ${!gridView ? 'active' : ''}`}
                onClick={() => setGridView(false)}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div className="filters-row">
            {/* Category Filter */}
            <div className="filter-group">
              <label>Catégorie</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <label>Prix</label>
              <select 
                value={priceFilters.indexOf(selectedPriceFilter)}
                onChange={(e) => setSelectedPriceFilter(priceFilters[e.target.value])}
              >
                {priceFilters.map((filter, index) => (
                  <option key={index} value={index}>{filter.label}</option>
                ))}
              </select>
            </div>

            {/* For Sale Toggle */}
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showOnlyForSale}
                  onChange={(e) => setShowOnlyForSale(e.target.checked)}
                />
                <span>En vente uniquement</span>
              </label>
            </div>

            {/* Submit NFT Button */}
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('submit')}
            >
              Soumettre un NFT
            </button>
          </div>
        </div>

        {/* NFT Grid/List */}
        <div className={`nft-container ${gridView ? 'nft-grid' : 'nft-list'}`}>
          {currentNfts.length > 0 ? (
            currentNfts.map(nft => (
              <NFTCard 
                key={nft.id} 
                nft={nft}
                onClick={handleNFTClick}
              />
            ))
          ) : (
            <div className="no-results">
              <Filter size={48} />
              <p>Aucun NFT ne correspond à vos critères</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedCategory('Tous');
                  setSelectedPriceFilter(priceFilters[0]);
                  setSearchQuery('');
                  setShowOnlyForSale(false);
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
            
            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;