import React, { useState } from 'react';
import { uploadCompleteNFT } from '../../services/ipfsService';
import { runIPFSTests, createTestImage } from '../../test/ipfsTest';

const TestIPFS = () => {
  const [testResults, setTestResults] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    console.log('🧪 Lancement des tests IPFS...');
    const result = await runIPFSTests();
    setTestResults(result);
  };

  const testUpload = async () => {
    setLoading(true);
    try {
      console.log('📤 Test d\'upload IPFS...');

      // Créer une image test
      const testImage = await createTestImage();

      // Préparer les données NFT
      const nftData = {
        file: testImage,
        name: 'NFT Test IPFS',
        description: 'Test d\'upload vers IPFS via Pinata',
        attributes: [
          {
            trait_type: "Test",
            value: "IPFS Upload"
          },
          {
            trait_type: "Timestamp",
            value: new Date().toISOString()
          }
        ]
      };

      // Upload vers IPFS
      const tokenURI = await uploadCompleteNFT(nftData);

      setUploadResult({
        success: true,
        tokenURI,
        message: 'Upload réussi !'
      });

      console.log('✅ Upload test réussi !');
      console.log('Token URI:', tokenURI);

    } catch (error) {
      console.error('❌ Erreur upload test:', error);
      setUploadResult({
        success: false,
        error: error.message,
        message: 'Upload échoué'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Test IPFS Service</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Configuration</h2>
        <p>API Key: {import.meta.env?.VITE_PINATA_API_KEY ? '✅ Configurée' : '❌ Manquante'}</p>
        <p>Secret Key: {import.meta.env?.VITE_PINATA_SECRET_KEY ? '✅ Configurée' : '❌ Manquante'}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Tests de base</h2>
        <button
          onClick={runTests}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Lancer les tests
        </button>

        {testResults !== null && (
          <div style={{ marginTop: '1rem' }}>
            {testResults ? (
              <p style={{ color: 'green' }}>✅ Tests de base réussis</p>
            ) : (
              <p style={{ color: 'red' }}>❌ Tests de base échoués</p>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test d'upload</h2>
        <button
          onClick={testUpload}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#gray' : '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Upload en cours...' : 'Tester l\'upload IPFS'}
        </button>

        {uploadResult && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: uploadResult.success ? '#D1FAE5' : '#FEE2E2',
            border: `1px solid ${uploadResult.success ? '#10B981' : '#EF4444'}`,
            borderRadius: '5px'
          }}>
            <h3>{uploadResult.message}</h3>
            {uploadResult.success ? (
              <div>
                <p><strong>Token URI:</strong></p>
                <code style={{
                  display: 'block',
                  padding: '0.5rem',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '3px',
                  fontSize: '12px',
                  wordBreak: 'break-all'
                }}>
                  {uploadResult.tokenURI}
                </code>
              </div>
            ) : (
              <p style={{ color: 'red' }}>
                <strong>Erreur:</strong> {uploadResult.error}
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '5px'
      }}>
        <h3>📝 Logs</h3>
        <p>Ouvrez la console (F12) pour voir les logs détaillés des tests.</p>
      </div>
    </div>
  );
};

export default TestIPFS;