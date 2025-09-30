import React, { useState } from 'react';
import { saveSubmittedNFT } from '../../utils/storage';
import { categories } from '../../data/mockData';

const TestCategory = () => {
  const [results, setResults] = useState([]);
  const [isTestingCategory, setIsTestingCategory] = useState(false);

  const testCategorySubmission = () => {
    setIsTestingCategory(true);
    console.log('🧪 Test de soumission avec différentes catégories');

    const testResults = [];
    const testCategories = categories.filter(cat => cat !== 'Tous');

    testCategories.forEach((category, index) => {
      console.log(`\n${index + 1}️⃣ Test catégorie: "${category}"`);

      const nftData = {
        name: `Test NFT ${index + 1}`,
        description: `Description du NFT de test ${index + 1}`,
        category: category,
        price: 0,
        forSale: false,
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        likes: 0,
        views: 0,
        owner: 'Vous',
        seller: null,
        tokenId: null,
        contractAddress: null,
        blockchainStatus: 'local-only'
      };

      console.log('📝 Données avant sauvegarde:');
      console.log(`   - Nom: ${nftData.name}`);
      console.log(`   - Catégorie: "${nftData.category}"`);
      console.log(`   - Type: ${typeof nftData.category}`);

      try {
        const savedNFT = saveSubmittedNFT(nftData);

        console.log('💾 Données après sauvegarde:');
        console.log(`   - Nom: ${savedNFT.name}`);
        console.log(`   - Catégorie: "${savedNFT.category}"`);
        console.log(`   - Type: ${typeof savedNFT.category}`);

        const success = savedNFT.category === nftData.category;
        testResults.push({
          index: index + 1,
          category: category,
          original: nftData.category,
          saved: savedNFT.category,
          success: success,
          savedNFT: savedNFT
        });

        if (success) {
          console.log('✅ Catégorie conservée correctement');
        } else {
          console.log('❌ PROBLÈME: Catégorie changée!');
          console.log(`   Attendu: "${nftData.category}"`);
          console.log(`   Obtenu: "${savedNFT.category}"`);
        }

      } catch (error) {
        console.log('❌ Erreur lors de la sauvegarde:', error.message);
        testResults.push({
          index: index + 1,
          category: category,
          original: nftData.category,
          saved: 'ERREUR',
          success: false,
          error: error.message
        });
      }
    });

    setResults(testResults);
    setIsTestingCategory(false);

    // Afficher le résumé
    console.log('\n📋 Résumé des tests:');
    const successful = testResults.filter(r => r.success).length;
    const total = testResults.length;
    console.log(`✅ Réussis: ${successful}/${total}`);
    if (successful < total) {
      console.log('❌ Échecs:');
      testResults.filter(r => !r.success).forEach(r => {
        console.log(`   ${r.index}. ${r.category}: "${r.original}" → "${r.saved}"`);
      });
    }
  };

  const clearResults = () => {
    setResults([]);
    localStorage.removeItem('nft_marketplace_submitted_nfts');
    console.log('🧹 Résultats et localStorage nettoyés');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Test de Catégories NFT</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testCategorySubmission}
          disabled={isTestingCategory}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isTestingCategory ? 'not-allowed' : 'pointer'
          }}
        >
          {isTestingCategory ? 'Test en cours...' : 'Tester toutes les catégories'}
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
          <h2>📊 Résultats des tests</h2>
          <div style={{ marginBottom: '20px' }}>
            <strong>Réussis: {results.filter(r => r.success).length}/{results.length}</strong>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Test</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Catégorie</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Original</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Sauvegardé</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.index}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.category}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>"{result.original}"</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>"{result.saved}"</td>
                  <td style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    color: result.success ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {result.success ? '✅ OK' : '❌ ÉCHEC'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>📝 Instructions</h3>
        <p>
          1. Cliquez sur "Tester toutes les catégories" pour créer des NFTs de test avec chaque catégorie<br/>
          2. Vérifiez les résultats dans le tableau ci-dessus<br/>
          3. Consultez la console du navigateur pour les logs détaillés<br/>
          4. Utilisez "Nettoyer les résultats" pour effacer les données de test
        </p>
      </div>
    </div>
  );
};

export default TestCategory;