import React, { useState } from 'react';
import './WalletButton.css';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';

const WalletButton = ({ isConnected, address, onConnect, onDisconnect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <button className="wallet-button" onClick={onConnect}>
        <Wallet size={18} />
        <span>Connecter</span>
      </button>
    );
  }

  return (
    <div className="wallet-connected">
      <button 
        className="wallet-button wallet-button-connected"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Wallet size={18} />
        <span>{address}</span>
      </button>
      
      {showDropdown && (
        <div className="wallet-dropdown">
          <button className="wallet-dropdown-item" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copié!' : 'Copier l\'adresse'}</span>
          </button>
          <button className="wallet-dropdown-item" onClick={onDisconnect}>
            <LogOut size={16} />
            <span>Déconnecter</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletButton;