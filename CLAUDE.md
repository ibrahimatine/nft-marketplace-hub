# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React/Vite)
- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build

### Blockchain (Hardhat)
- `npx hardhat compile` - Compile smart contracts
- `npx hardhat test` - Run contract tests
- `npx hardhat node` - Start local blockchain network (port 8545)
- `npx hardhat run scripts/deploy.js --network localhost` - Deploy contracts to local network
- `npx hardhat run scripts/resetMarketplace.js --network localhost` - Reset marketplace state
- `npx hardhat run scripts/clearLocalNFTS.js --network localhost` - Clear local NFTs

## Architecture Overview

### Project Structure
This is a full-stack NFT marketplace with React frontend and Ethereum smart contracts:

- **Frontend**: React 19 + Vite, React Router for navigation
- **Blockchain**: Hardhat development environment with Solidity contracts
- **Wallet Integration**: MetaMask via ethers.js (v5), with fallback RainbowKit config
- **State Management**: React Context API for global state

### Key Components

#### Smart Contract Layer
- `contracts/NFTMarketplace.sol` - Main marketplace contract (ERC721 + marketplace functions)
- Contract deployed at address stored in `src/contracts/contract-address.json`
- Supports minting, listing, buying, and withdrawing NFTs

#### Frontend Architecture
- `src/App.jsx` - Main app with routing, wallet connection context, and private route protection
- **Global State**: AppContext provides wallet connection state, selected NFT, and connection handlers
- **Wallet Connection**: Direct MetaMask integration (not using wagmi/rainbowkit in current implementation)
- **Network**: Hardhat local network (chainId 0x539 / 1337) with automatic network switching

#### Core Pages
- `Welcome` - Landing page with wallet connection
- `Explore` - Browse marketplace NFTs (public access)
- `Portfolio` - User's owned NFTs (requires wallet connection)
- `SubmitNFT` - Create and mint new NFTs (requires wallet connection)
- `NFTDetail` - Individual NFT details page

#### Blockchain Integration
- `src/utils/contract.js` - Contract interaction utilities with ethers.js
- `src/config/wagmi.js` - RainbowKit configuration (currently unused)
- Supports both read-only operations (via JsonRpcProvider) and wallet transactions

### Development Workflow

1. **Smart Contract Development**:
   - Start local blockchain: `npx hardhat node`
   - Deploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
   - Contract address automatically saved to `src/contracts/contract-address.json`

2. **Frontend Development**:
   - Start frontend: `npm run dev`
   - Ensure MetaMask is connected to localhost:8545 (Hardhat network)
   - Application automatically handles network switching to chainId 1337

3. **Testing Flow**:
   - Connect wallet on Welcome page
   - Browse NFTs on Explore page (works without wallet)
   - Create NFTs on Submit page (requires wallet)
   - View owned NFTs in Portfolio (requires wallet)

### Important Notes

- **Wallet Connection**: Uses direct MetaMask integration, not wagmi/rainbowkit in current implementation
- **Network Configuration**: Hardhat local network (chainId 1337) with automatic switching
- **Contract Interaction**: Mixed approach - read operations use JsonRpcProvider, write operations require wallet
- **Metadata Storage**: NFTs use base64-encoded JSON metadata stored on-chain
- **Route Protection**: Private routes (`/portfolio`, `/submit`) require wallet connection
- **Error Handling**: Comprehensive error handling for contract interactions and network issues

### Contract Functions Used
- `fetchMarketItems()` - Get all marketplace NFTs
- `fetchMyNFTs()` - Get user's owned NFTs
- `fetchItemsListed()` - Get user's listed NFTs
- `createToken(tokenURI, price)` - Mint and list new NFT
- `createMarketSale(tokenId)` - Purchase NFT
- `withdrawListingItem(tokenId)` - Remove NFT from sale
- `getListingPrice()` - Get marketplace listing fee