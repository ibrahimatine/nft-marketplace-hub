import React, { useState } from 'react';
import './Header.css';
import WalletButton from '../../WalletButton/WalletButton';
import { Menu, X } from 'lucide-react';

const Header = ({ onNavigate, isWalletConnected, walletAddress, onConnect, onDisconnect }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <nav className="header-nav container">
          <div 
            className="header-logo gradient-text"
            onClick={() => handleNavClick('welcome')}
          >
            NFT Hub
          </div>

          {/* Desktop Menu */}
          <div className="header-desktop-menu">
            <button 
              className="header-link" 
              onClick={() => handleNavClick('explore')}
            >
              Explorer
            </button>
            <button 
              className="header-link"
              onClick={() => handleNavClick('submit')}
            >
              Soumettre NFT
            </button>
            {isWalletConnected && (
              <button 
                className="header-link"
                onClick={() => handleNavClick('portfolio')}
              >
                Portfolio
              </button>
            )}
            <WalletButton
              isConnected={isWalletConnected}
              address={walletAddress}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="header-mobile-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-content">
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
          
          <nav className="mobile-menu-nav">
            <button 
              className="mobile-menu-link"
              onClick={() => handleNavClick('explore')}
            >
              Explorer
            </button>
            <button 
              className="mobile-menu-link"
              onClick={() => handleNavClick('submit')}
            >
              Soumettre NFT
            </button>
            {isWalletConnected && (
              <button 
                className="mobile-menu-link"
                onClick={() => handleNavClick('portfolio')}
              >
                Portfolio
              </button>
            )}
            <div className="mobile-menu-wallet">
              <WalletButton
                isConnected={isWalletConnected}
                address={walletAddress}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
