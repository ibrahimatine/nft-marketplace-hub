export const mockNFTs = [
  {
    id: 1,
    name: "Cosmic Dreams #001",
    tokenId: "0x1234...5678",
    contractAddress: "0xABCD...EF01",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop",
    price: 2.5,
    owner: "0xABCD...EF01",
    creator: "0xCREA...TOR1",
    description: "A mesmerizing digital artwork from the Cosmic Dreams collection. This piece represents the infinite possibilities of the cosmos, blending vibrant colors with ethereal patterns.",
    highestSale24h: true,
    forSale: true,
    category: "Digital Art",
    likes: 142,
    views: 1523,
    createdAt: "2024-01-15",
    transfers: [
      { from: "0x0000...0000", to: "0xCREA...TOR1", date: "2024-01-15", price: null },
      { from: "0xCREA...TOR1", to: "0xBUY1...2345", date: "2024-02-20", price: 1.5 },
      { from: "0xBUY1...2345", to: "0xABCD...EF01", date: "2024-03-10", price: 2.5 }
    ]
  },
  {
    id: 2,
    name: "Pixel Warrior #142",
    tokenId: "0x2345...6789",
    contractAddress: "0xBCDE...F012",
    image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=400&h=400&fit=crop",
    price: 1.8,
    owner: "0xBCDE...F012",
    creator: "0xCREA...TOR2",
    description: "Rare pixel art warrior from the retro gaming collection. Each warrior has unique attributes and powers in the metaverse.",
    highestSale24h: false,
    forSale: true,
    category: "Gaming",
    likes: 89,
    views: 956,
    createdAt: "2024-02-01",
    transfers: [
      { from: "0x0000...0000", to: "0xCREA...TOR2", date: "2024-02-01", price: null },
      { from: "0xCREA...TOR2", to: "0xBCDE...F012", date: "2024-02-15", price: 1.8 }
    ]
  },
  {
    id: 3,
    name: "Abstract Mind #088",
    tokenId: "0x3456...789A",
    contractAddress: "0xCDEF...0123",
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop",
    price: 3.2,
    owner: "0xCDEF...0123",
    creator: "0xCREA...TOR3",
    description: "Abstract representation of consciousness and thoughts. This piece explores the complexity of human emotions through geometric patterns.",
    highestSale24h: false,
    forSale: true,
    category: "Abstract",
    likes: 234,
    views: 2341,
    createdAt: "2024-01-20",
    transfers: [
      { from: "0x0000...0000", to: "0xCREA...TOR3", date: "2024-01-20", price: null }
    ]
  },
  {
    id: 4,
    name: "Neon City #005",
    tokenId: "0x4567...89AB",
    contractAddress: "0xDEF0...1234",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
    price: 4.0,
    owner: "0xDEF0...1234",
    creator: "0xCREA...TOR4",
    description: "Cyberpunk cityscape from the future. Experience the neon-lit streets of tomorrow in this stunning digital masterpiece.",
    highestSale24h: false,
    forSale: false,
    category: "Digital Art",
    likes: 456,
    views: 3456,
    createdAt: "2024-01-25",
    transfers: [
      { from: "0x0000...0000", to: "0xCREA...TOR4", date: "2024-01-25", price: null },
      { from: "0xCREA...TOR4", to: "0xDEF0...1234", date: "2024-02-28", price: 4.0 }
    ]
  },
  {
    id: 5,
    name: "Ocean Depths #023",
    tokenId: "0x5678...9ABC",
    contractAddress: "0xEF01...2345",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
    price: 1.2,
    owner: "0xEF01...2345",
    creator: "0xCREA...TOR5",
    description: "Explore the mysterious depths of the ocean with this captivating underwater scene.",
    highestSale24h: false,
    forSale: true,
    category: "Nature",
    likes: 67,
    views: 789,
    createdAt: "2024-02-10",
    transfers: [
      { from: "0x0000...0000", to: "0xCREA...TOR5", date: "2024-02-10", price: null }
    ]
  },
  {
    id: 6,
    name: "Retro Wave #077",
    tokenId: "0x6789...ABCD",
    contractAddress: "0xF012...3456",
    image: "https://images.unsplash.com/photo-1557672199-6e8e30b35a56?w=400&h=400&fit=crop",
    price: 2.1,
    owner: "0xF012...3456",
    creator: "0xCREA...TOR6",
    description: "Nostalgic journey through the 80s synthwave aesthetic. Feel the retro vibes!",
    highestSale24h: false,
    forSale: true,
    category: "Retro",
    likes: 189,
    views: 1567,
    createdAt: "2024-02-05",
    transfers: [
      { from: "0x0000...0000", to: "0xCREA...TOR6", date: "2024-02-05", price: null },
      { from: "0xCREA...TOR6", to: "0xF012...3456", date: "2024-03-01", price: 2.1 }
    ]
  },
  {
    id: 7,
    name: "Fractal Universe #012",
    tokenId: "0x789A...BCDE",
    contractAddress: "0x0123...4567",
    image: "https://images.unsplash.com/photo-1579547621309-5e57ab324182?w=400&h=400&fit=crop",
    price: 5.5,
    owner: "0x0123...4567",
    creator: "0xCREA...TOR7",
    description: "Mathematical beauty meets artistic expression in this stunning fractal composition.",
    highestSale24h: false,
    forSale: false,
    category: "Abstract",
    likes: 345,
    views: 2890,
    createdAt: "2024-01-30",
    transfers: [
      { from: "0x0000...0000", to: "0xCREA...TOR7", date: "2024-01-30", price: null }
    ]
  },
  {
    id: 8,
    name: "Digital Flora #033",
    tokenId: "0x89AB...CDEF",
    contractAddress: "0x1234...5678",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
    price: 1.5,
    owner: "0x1234...5678",
    creator: "0xCREA...TOR8",
    description: "Where nature meets technology. A beautiful fusion of organic and digital elements.",
    highestSale24h: false,
    forSale: true,
    category: "Nature",
    likes: 123,
    views: 1234,
    createdAt: "2024-02-12",
    transfers: [
      { from: "0x0000...0000", to: "0xCREA...TOR8", date: "2024-02-12", price: null }
    ]
  }
];

// Catégories disponibles
export const categories = [
  "Tous",
  "Digital Art",
  "Gaming",
  "Abstract",
  "Nature",
  "Retro",
  "Photography",
  "3D Art"
];

// Filtres de prix
export const priceFilters = [
  { label: "Tous les prix", min: 0, max: Infinity },
  { label: "< 1 ETH", min: 0, max: 1 },
  { label: "1 - 2 ETH", min: 1, max: 2 },
  { label: "2 - 5 ETH", min: 2, max: 5 },
  { label: "> 5 ETH", min: 5, max: Infinity }
];

// Statistiques du marketplace
export const marketStats = {
  totalNFTs: 2543,
  totalUsers: 1289,
  totalCreators: 856,
  totalVolume: 15234.5,
  floorPrice: 0.8,
  averagePrice: 2.3
};

// Portfolio utilisateur (pour simuler un wallet connecté)
export const userPortfolio = {
  "0x742d...8A9F": {
    owned: [1, 3, 5], // IDs des NFTs possédés
    created: [1],     // IDs des NFTs créés
    onSale: [1, 3],   // IDs des NFTs en vente
    balance: 10.5     // Balance en ETH
  }
};

// Fonction helper pour obtenir des NFTs aléatoires
export const getRandomNFTs = (count = 2) => {
  const shuffled = [...mockNFTs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Fonction helper pour obtenir le NFT avec la plus haute vente
export const getHighestSaleNFT = () => {
  return mockNFTs.find(nft => nft.highestSale24h) || mockNFTs[0];
};

// Fonction helper pour obtenir les NFTs disponibles
export const getAvailableNFTs = () => {
  return mockNFTs.filter(nft => nft.forSale);
};