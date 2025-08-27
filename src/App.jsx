import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Layout/Header/Header.jsx';

// Pages
import Welcome from './pages/Welcome/Welcome.jsx';
import Explore from './pages/Explore/Explore.jsx';
import NFTDetail from './pages/NFTDetail/NFTDetail.jsx';
import Portfolio from './pages/Portfolio/Portfolio.jsx';
import SubmitNFT from './pages/SubmitNFT/SubmitNFT.jsx';

// Context pour gérer l'état du wallet et des NFTs
const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Composant Provider pour l'état global
const AppProvider = ({ children }) => {
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

  const value = {
    isWalletConnected,
    walletAddress,
    selectedNFT,
    setSelectedNFT,
    handleConnect,
    handleDisconnect
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Composant de protection des routes privées
const PrivateRoute = ({ children }) => {
  const { isWalletConnected } = useAppContext();
  return isWalletConnected ? children : <Navigate to="/" replace />;
};

// Composant principal de l'app
function App() {
  return (
    <Router>
      <AppProvider>
        <div className="app">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/nft/:id" element={<NFTDetail />} />
              <Route 
                path="/portfolio" 
                element={
                  <PrivateRoute>
                    <Portfolio />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/submit" 
                element={
                  <PrivateRoute>
                    <SubmitNFT />
                  </PrivateRoute>
                } 
              />
              {/* Route 404 - redirection vers l'accueil */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AppProvider>
    </Router>
  );
}

export default App;