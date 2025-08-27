import React, { useState } from 'react';
import './App.css';
import Header from './components/Layout/Header/Header.jsx';
import Welcome from './pages/Welcome/Welcome.jsx';
import Explore from './pages/Explore/Explore.jsx';
import NFTDetail from './pages/NFTDetail/NFTDetail.jsx';
import Portfolio from './pages/Portfolio/Portfolio.jsx';
import SubmitNFT from './pages/SubmitNFT/SubmitNFT.jsx';


function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);

  const handleConnect = () => {
    // Simuler la connexion du wallet
    setIsWalletConnected(true);
    setWalletAddress('0x742d...8A9F');
  };

  const handleDisconnect = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  const handleNavigate = (page, nft = null) => {
    console.log('Navigation vers:', page, 'avec NFT:', nft);
    setCurrentPage(page);
    if (nft) {
      setSelectedNFT(nft);
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'welcome':
        return <Welcome onNavigate={handleNavigate} />;
      case 'explore':
        return <Explore onNavigate={handleNavigate} isWalletConnected={isWalletConnected} />;
      case 'nft-detail':
        return <NFTDetail nft={selectedNFT} onNavigate={handleNavigate} isWalletConnected={isWalletConnected} walletAddress={walletAddress} />;
      case 'portfolio':
        return <Portfolio onNavigate={handleNavigate} walletAddress={walletAddress} isWalletConnected={isWalletConnected} />;
      case 'submit':
        return <SubmitNFT onNavigate={handleNavigate} isWalletConnected={isWalletConnected} />;
      default:
        return <Welcome onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <Header 
        onNavigate={handleNavigate}
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;