import React, { useState, createContext, useContext, useEffect } from 'react';
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

// Context pour gérer l'état des NFTs et wallet
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
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Vérifier si MetaMask est déjà connecté au chargement
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      } catch (error) {
        console.error('Erreur vérification connexion:', error);
      }
    }
  };

  // Connexion MetaMask réelle
  const handleConnect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        // Vérifier qu'on est sur le bon réseau (Hardhat = chainId 1337)
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        if (chainId !== '0x539') { // 1337 en hex
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x539' }],
            });
          } catch (switchError) {
            // Si le réseau n'existe pas, l'ajouter
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x539',
                  chainName: 'Hardhat Local',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['http://127.0.0.1:8545'],
                }]
              });
            }
          }
        }
        
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        console.log('Connecté à:', accounts[0]);
        console.log('Réseau:', chainId);
        
      } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('Erreur lors de la connexion au wallet: ' + error.message);
      }
    } else {
      alert('MetaMask n\'est pas installé. Veuillez l\'installer pour utiliser cette application.');
    }
  };

  const handleDisconnect = async () => {
    setWalletAddress('');
    setIsWalletConnected(false);
    
    // Optionnel : Demander à MetaMask de supprimer la permission
    try {
      await window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }]
      });
    } catch (error) {
      // Ne pas bloquer si cette méthode n'est pas supportée
      console.log('Révocation des permissions non supportée');
    }
    
    console.log('Wallet déconnecté');
  };

  // Écouter les changements de compte et réseau
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        } else {
          handleDisconnect();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Changement de réseau:', chainId);
        // Recharger la page pour éviter les problèmes de cache
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AppProvider>
    </Router>
  );
}

export default App;