import React, { useState } from 'react';
import { saveSubmittedNFT } from '../../utils/storage';
import { categories } from '../../data/mockData';
import { fetchAllMarketplaceNFTs, fetchMarketplaceNFTs } from '../../utils/contract';

const TestBlockchainCategory = () => {
  const [results, setResults] = useState([]);
  const [isTestingBlockchain, setIsTestingBlockchain] = useState(false);
  const [blockchainNFTs, setBlockchainNFTs] = useState([]);

  const testBlockchainCategories = async () => {
    setIsTestingBlockchain(true);
    console.log('🔗 Test de récupération des catégories depuis la blockchain');

    try {
      // Récupérer tous les NFTs de la blockchain
      const allNFTs = await fetchAllMarketplaceNFTs();
      console.log('NFTs récupérés de la blockchain:', allNFTs);

      const testResults = [];

      // Analyser chaque NFT
      allNFTs.forEach((nft, index) => {
        console.log(`\n${index + 1}️⃣ Analyse NFT Token ID: ${nft.tokenId}`);
        console.log(`   - Nom: ${nft.name}`);
        console.log(`   - Catégorie: "${nft.category}"`);
        console.log(`   - Source: ${nft.source}`);
        console.log(`   - Blockchain Status: ${nft.blockchainStatus}`);

        testResults.push({
          tokenId: nft.tokenId,
          name: nft.name,
          category: nft.category,
          source: nft.source,
          isCorrectCategory: nft.category !== 'Digital Art', // Assume que "Digital Art" = problème
          nft: nft
        });

        if (nft.category === 'Digital Art') {
          console.log('⚠️ Catégorie suspecte: "Digital Art" (possiblement fallback)');
        } else {
          console.log(`✅ Catégorie spécifique: "${nft.category}"`);
        }
      });

      setResults(testResults);
      setBlockchainNFTs(allNFTs);

      // Afficher le résumé
      console.log('\n📋 Résumé des tests blockchain:');
      const correctCategories = testResults.filter(r => r.isCorrectCategory).length;
      const total = testResults.length;
      console.log(`✅ Catégories spécifiques: ${correctCategories}/${total}`);
      console.log(`⚠️ Catégories par défaut: ${total - correctCategories}/${total}`);

      if (correctCategories < total) {
        console.log('❌ NFTs avec catégorie par défaut:');
        testResults.filter(r => !r.isCorrectCategory).forEach(r => {
          console.log(`   Token ${r.tokenId}: "${r.name}" → "${r.category}"`);
        });
      }

    } catch (error) {
      console.error('❌ Erreur lors des tests blockchain:', error);
      setResults([{
        tokenId: 'ERROR',
        name: 'Erreur',
        category: error.message,
        source: 'error',
        isCorrectCategory: false
      }]);
    } finally {
      setIsTestingBlockchain(false);
    }
  };

  const testMarketplaceOnly = async () => {
    setIsTestingBlockchain(true);
    console.log('🛒 Test des NFTs en vente uniquement');

    try {
      const marketplaceNFTs = await fetchMarketplaceNFTs();
      console.log('NFTs en vente récupérés:', marketplaceNFTs);

      setBlockchainNFTs(marketplaceNFTs);

      const testResults = marketplaceNFTs.map((nft, index) => {
        console.log(`\n${index + 1}️⃣ NFT en vente Token ID: ${nft.tokenId}`);
        console.log(`   - Nom: ${nft.name}`);
        console.log(`   - Catégorie: "${nft.category}"`);
        console.log(`   - Prix: ${nft.price} ETH`);

        return {
          tokenId: nft.tokenId,
          name: nft.name,
          category: nft.category,
          source: nft.source,
          price: nft.price,
          isCorrectCategory: nft.category !== 'Digital Art',
          nft: nft
        };
      });

      setResults(testResults);

    } catch (error) {
      console.error('❌ Erreur lors des tests marketplace:', error);
    } finally {
      setIsTestingBlockchain(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setBlockchainNFTs([]);
    console.log('🧹 Résultats nettoyés');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔗 Test de Catégories Blockchain</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testBlockchainCategories}
          disabled={isTestingBlockchain}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isTestingBlockchain ? 'not-allowed' : 'pointer'
          }}
        >
          {isTestingBlockchain ? 'Test en cours...' : 'Tester tous les NFTs blockchain'}
        </button>

        <button
          onClick={testMarketplaceOnly}
          disabled={isTestingBlockchain}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isTestingBlockchain ? 'not-allowed' : 'pointer'
          }}
        >
          {isTestingBlockchain ? 'Test en cours...' : 'Tester NFTs en vente'}
        </button>

        <button
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Nettoyer les résultats
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <h2>📊 Résultats des tests blockchain</h2>
          <div style={{ marginBottom: '20px' }}>
            <strong>
              Catégories correctes: {results.filter(r => r.isCorrectCategory).length}/{results.length}
            </strong>
            {results.filter(r => !r.isCorrectCategory).length > 0 && (
              <span style={{ color: 'red', marginLeft: '10px' }}>
                ({results.filter(r => !r.isCorrectCategory).length} problèmes détectés)
              </span>
            )}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Token ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nom</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Catégorie</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Source</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Prix</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>#{result.tokenId}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.name}</td>
                  <td style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    fontWeight: 'bold',
                    color: result.isCorrectCategory ? 'green' : 'red'
                  }}>
                    "{result.category}"
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.source}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {result.price ? `${result.price} ETH` : 'N/A'}
                  </td>
                  <td style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    color: result.isCorrectCategory ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {result.isCorrectCategory ? '✅ OK' : '❌ PROBLÈME'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {blockchainNFTs.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>🔍 Détails des métadonnées</h3>
          <p>Consultez la console du navigateur pour voir les logs détaillés des métadonnées récupérées.</p>

          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Afficher les données brutes des NFTs ({blockchainNFTs.length})
            </summary>
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '5px',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '12px'
            }}>
              {JSON.stringify(blockchainNFTs, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>📝 Instructions</h3>
        <p>
          1. <strong>Tester tous les NFTs blockchain</strong>: Récupère tous les NFTs du contrat<br/>
          2. <strong>Tester NFTs en vente</strong>: Récupère seulement les NFTs actuellement en vente<br/>
          3. Vérifiez que les catégories ne sont pas toutes "Digital Art"<br/>
          4. Consultez la console pour les logs détaillés de récupération des métadonnées<br/>
          5. Les NFTs avec catégorie "Digital Art" pourraient indiquer un problème de parsing
        </p>

        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '3px' }}>
          <strong>Note:</strong> Ce test vérifie si les catégories sont correctement récupérées depuis la blockchain.
          Si vous voyez beaucoup de "Digital Art", cela signifie que le parsing des métadonnées IPFS ne récupère pas les catégories correctement.
        </div>
      </div>
    </div>
  );
};

export default TestBlockchainCategory;