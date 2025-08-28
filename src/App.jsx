import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { config } from './config/wagmi';
import './App.css';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Components
import Header from './components/Layout/Header/Header.jsx';

// Pages
import Welcome from './pages/Welcome/Welcome.jsx';
import Explore from './pages/Explore/Explore.jsx';
import NFTDetail from './pages/NFTDetail/NFTDetail.jsx';
import Portfolio from './pages/Portfolio/Portfolio.jsx';
import SubmitNFT from './pages/SubmitNFT/SubmitNFT.jsx';

// Context pour gérer l'état des NFTs
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
  const { address, isConnected } = useAccount();

  const value = {
    isWalletConnected: isConnected,
    walletAddress: address || '',
    selectedNFT,
    setSelectedNFT
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Composant de protection des routes privées
const PrivateRoute = ({ children }) => {
  const { isConnected } = useAccount();
  return isConnected ? children : <Navigate to="/" replace />;
};

// Composant qui utilise les hooks Wagmi
const AppContent = () => {
  return (
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
  );
};

// Client pour React Query
const queryClient = new QueryClient();

// Composant principal de l'app avec tous les providers
function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#6B46C1',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <Router>
            <AppContent />
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;