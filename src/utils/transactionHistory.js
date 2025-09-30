// Utilitaires pour l'historique des transactions NFT

export const formatTransactionDate = (isoString) => {
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString('fr-FR'),
    time: date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    full: date.toLocaleString('fr-FR')
  };
};

export const getTransactionTypeLabel = (type) => {
  const types = {
    'purchase': 'Achat',
    'sale': 'Vente',
    'listing': 'Mise en vente',
    'withdraw': 'Retrait de vente',
    'transfer': 'Transfert'
  };
  return types[type] || type;
};

export const getTransactionIcon = (type) => {
  const icons = {
    'purchase': '🛒',
    'sale': '💰',
    'listing': '🏷️',
    'withdraw': '📤',
    'transfer': '↔️'
  };
  return icons[type] || '📝';
};

export const shortenAddress = (address, chars = 4) => {
  if (!address) return 'Inconnu';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const formatPrice = (price) => {
  if (typeof price === 'number') {
    return `${price} ETH`;
  }
  return price || '0 ETH';
};

// Export des fonctions du fichier contract.js pour faciliter l'import
export {
  getTransactionHistory,
  clearTransactionHistory,
  getNFTTransactionHistory
} from './contract.js';