import React, { useState } from 'react';
import { getContract, getContractReadOnly } from '../../utils/contract';
import { uploadCompleteNFT, uploadImageToIPFS } from '../../services/ipfsService';
import { createTestImage } from '../../test/ipfsTest';

const DiagnosticTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message, data = null) => {
    const result = {
      test,
      status, // 'success', 'error', 'warning'
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    console.log(`[${status.toUpperCase()}] ${test}: ${message}`, data);
    setResults(prev => [...prev, result]);
  };

  const runFullDiagnostic = async () => {
    setResults([]);
    setLoading(true);

    try {
      addResult('INIT', 'info', 'Démarrage du diagnostic complet...');

      // Test 1: Configuration IPFS
      addResult('IPFS-CONFIG', 'info', 'Test configuration IPFS...');
      const apiKey = import.meta.env?.VITE_PINATA_API_KEY;
      const secretKey = import.meta.env?.VITE_PINATA_SECRET_KEY;

      if (!apiKey || apiKey.includes('VOTRE_')) {
        addResult('IPFS-CONFIG', 'error', 'Clé API Pinata non configurée');
        return;
      }

      addResult('IPFS-CONFIG', 'success', 'Clés IPFS configurées');

      // Test 2: Connexion blockchain
      addResult('BLOCKCHAIN', 'info', 'Test connexion blockchain...');
      try {
        const { contract: readContract } = await getContractReadOnly();
        const listingPrice = await readContract.getListingPrice();
        addResult('BLOCKCHAIN', 'success', `Blockchain connectée (listing: ${listingPrice})`);
      } catch (error) {
        addResult('BLOCKCHAIN', 'error', 'Connexion blockchain échouée', error.message);
        return;
      }

      // Test 3: Wallet connection
      addResult('WALLET', 'info', 'Test connexion wallet...');
      try {
        const { contract: walletContract, signer } = await getContract();
        const address = await signer.getAddress();
        const balance = await signer.getBalance();
        addResult('WALLET', 'success', `Wallet connecté: ${address.substring(0, 8)}... (${parseFloat(balance) / 1e18} ETH)`);
      } catch (error) {
        addResult('WALLET', 'error', 'Connexion wallet échouée', error.message);
        return;
      }

      // Test 4: Upload IPFS simple
      addResult('IPFS-UPLOAD', 'info', 'Test upload IPFS...');
      try {
        const testImage = await createTestImage();
        const imageHash = await uploadImageToIPFS(testImage);
        addResult('IPFS-UPLOAD', 'success', `Image uploadée sur IPFS: ${imageHash}`);
      } catch (error) {
        addResult('IPFS-UPLOAD', 'error', 'Upload IPFS échoué', error.message);
        return;
      }

      // Test 5: Upload NFT complet vers IPFS
      addResult('IPFS-NFT', 'info', 'Test upload NFT complet...');
      try {
        const testImage = await createTestImage();
        const nftData = {
          file: testImage,
          name: 'Test Diagnostic NFT',
          description: 'NFT créé pour tester le système IPFS',
          attributes: [
            { trait_type: "Test", value: "Diagnostic" },
            { trait_type: "Timestamp", value: new Date().toISOString() }
          ]
        };

        const { tokenURI } = await uploadCompleteNFT(nftData);
        addResult('IPFS-NFT', 'success', `NFT uploadé: ${tokenURI}`);

        // Test 6: Création NFT sur blockchain
        addResult('BLOCKCHAIN-CREATE', 'info', 'Test création NFT blockchain...');
        try {
          const { contract } = await getContract();
          const listingPrice = await contract.getListingPrice();
          const price = parseFloat("0.01"); // 0.01 ETH
          const priceWei = (price * 1e18).toString();

          const transaction = await contract.createToken(tokenURI, priceWei, {
            value: listingPrice,
            gasLimit: 1000000
          });

          addResult('BLOCKCHAIN-CREATE', 'info', `Transaction envoyée: ${transaction.hash}`);

          const receipt = await transaction.wait();
          addResult('BLOCKCHAIN-CREATE', 'success', `NFT créé sur blockchain! Block: ${receipt.blockNumber}`);

        } catch (error) {
          addResult('BLOCKCHAIN-CREATE', 'error', 'Création blockchain échouée', error.message);
        }

      } catch (error) {
        addResult('IPFS-NFT', 'error', 'Upload NFT complet échoué', error.message);
      }

      addResult('COMPLETE', 'success', 'Diagnostic terminé !');

    } catch (error) {
      addResult('FATAL', 'error', 'Erreur fatale du diagnostic', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🔧 Diagnostic Complet du Système</h1>
      <p>Ce diagnostic teste toute la chaîne : IPFS, blockchain, wallet et création de NFT.</p>

      <button
        onClick={runFullDiagnostic}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: loading ? '#9CA3AF' : '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '2rem'
        }}
      >
        {loading ? '🔄 Diagnostic en cours...' : '🚀 Lancer le diagnostic complet'}
      </button>

      <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>📊 Résultats du diagnostic</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.map((result, index) => (
            <div key={index} style={{
              padding: '8px 12px',
              margin: '4px 0',
              backgroundColor: 'white',
              border: `2px solid ${getStatusColor(result.status)}`,
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{getStatusIcon(result.status)}</span>
                <strong>{result.test}</strong>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>{result.timestamp}</span>
              </div>
              <div style={{ marginLeft: '24px', marginTop: '4px' }}>
                {result.message}
                {result.data && (
                  <pre style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    backgroundColor: '#F3F4F6',
                    padding: '4px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {results.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#6B7280',
          padding: '2rem'
        }}>
          Cliquez sur "Lancer le diagnostic" pour commencer les tests.
        </div>
      )}

      <div style={{
        backgroundColor: '#FEF3C7',
        border: '1px solid #F59E0B',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '2rem'
      }}>
        <h4>💡 Instructions</h4>
        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
          <li>Le diagnostic teste chaque composant du système step-by-step</li>
          <li>En cas d'erreur, le diagnostic s'arrête et affiche les détails</li>
          <li>Si tout passe, un vrai NFT sera créé sur votre blockchain locale</li>
          <li>Consultez la console (F12) pour plus de détails techniques</li>
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticTest;