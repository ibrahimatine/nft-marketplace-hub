// Script de debug pour vérifier le réseau et le contrat
const { ethers } = require('ethers');

async function debugNetwork() {
  console.log('🔍 Diagnostic réseau et contrat...\n');

  // 1. Tester la connexion RPC
  try {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8546');
    const network = await provider.getNetwork();
    console.log('✅ Connexion RPC: OK');
    console.log('📡 Network:', network.name, 'ChainId:', network.chainId);

    const blockNumber = await provider.getBlockNumber();
    console.log('📦 Block actuel:', blockNumber);
  } catch (error) {
    console.error('❌ Erreur RPC:', error.message);
    return;
  }

  // 2. Tester le contrat
  try {
    const contractAddress = require('./src/contracts/contract-address.json').NFTMarketplace;
    console.log('\n📍 Adresse contrat:', contractAddress);

    const abi = [
      "function getListingPrice() public view returns (uint256)",
      "function name() public view returns (string)",
      "function symbol() public view returns (string)"
    ];

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8546');
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const listingPrice = await contract.getListingPrice();
    console.log('💰 Listing price:', ethers.utils.formatEther(listingPrice), 'ETH');

    const name = await contract.name();
    const symbol = await contract.symbol();
    console.log('📛 Contrat:', name, '(' + symbol + ')');

    console.log('\n✅ Contrat accessible et fonctionnel!');
  } catch (error) {
    console.error('❌ Erreur contrat:', error.message);
  }

  // 3. Vérifier les comptes disponibles
  try {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8546');
    const accounts = await provider.listAccounts();
    console.log('\n👥 Comptes disponibles:');

    for (let i = 0; i < Math.min(accounts.length, 3); i++) {
      const balance = await provider.getBalance(accounts[i]);
      console.log(`  ${i + 1}. ${accounts[i]} - ${ethers.utils.formatEther(balance)} ETH`);
    }
  } catch (error) {
    console.error('❌ Erreur comptes:', error.message);
  }
}

debugNetwork().catch(console.error);