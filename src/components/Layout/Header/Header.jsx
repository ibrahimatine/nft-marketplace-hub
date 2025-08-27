import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import WalletButton from '../../WalletButton/WalletButton';
import { useAppContext } from '../../../App';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { isWalletConnected, walletAddress, handleConnect, handleDisconnect } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <nav className="header-nav container">
          <Link 
            to="/"
            className="header-logo gradient-text"
          >
            NFT Hub
          </Link>

          {/* Desktop Menu */}
          <div className="header-desktop-menu">
            <Link 
              to="/explore"
              className="header-link"
            >
              Explorer
            </Link>
            <Link 
              to="/submit"
              className="header-link"
            >
              Soumettre NFT
            </Link>
            {isWalletConnected && (
              <Link 
                to="/portfolio"
                className="header-link"
              >
                Portfolio
              </Link>
            )}
            <WalletButton
              isConnected={isWalletConnected}
              address={walletAddress}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
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
            <Link 
              to="/explore"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explorer
            </Link>
            <Link 
              to="/submit"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Soumettre NFT
            </Link>
            {isWalletConnected && (
              <Link 
                to="/portfolio"
                className="mobile-menu-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolio
              </Link>
            )}
            <div className="mobile-menu-wallet">
              <WalletButton
                isConnected={isWalletConnected}
                address={walletAddress}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;