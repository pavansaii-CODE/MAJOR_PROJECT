import { useState } from 'react';
import { certificateAPI } from '../services/api';

const CertificateVerification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setVerifying(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('certificate', selectedFile);

    try {
      const response = await certificateAPI.verify(formData);
      setResult(response.data);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || 'Failed to verify certificate');
    } finally {
      setVerifying(false);
    }
  };

  const renderVerificationResult = () => {
    if (!result) return null;

    if (result.verified) {
      return (
        <div className="alert alert-success">
          <h3>✅ CERTIFICATE VERIFIED</h3>
          <p className="verification-message">
            This certificate is authentic and registered on the blockchain.
          </p>
          <div className="result-details">
            <h4>Certificate Details:</h4>
            <p><strong>Certificate Hash:</strong> <code>{result.certificateHash}</code></p>

            {result.blockchain && (
              <>
                <p><strong>IPFS CID:</strong> <code>{result.blockchain.ipfsCid}</code></p>
                <p><strong>Student ID:</strong> {result.blockchain.studentId || 'N/A'}</p>
                <p><strong>Registered:</strong> {new Date(result.blockchain.timestamp * 1000).toLocaleString()}</p>
                <p><strong>Student Address:</strong> <code>{result.blockchain.studentAddress}</code></p>
              </>
            )}

            {result.database && (
              <>
                <p><strong>Original Filename:</strong> {result.database.originalFilename}</p>
                <p><strong>Transaction Hash:</strong> <code>{result.database.transactionHash}</code></p>
                <p>
                  <strong>View on IPFS:</strong>{' '}
                  <a href={result.database.ipfsUrl} target="_blank" rel="noopener noreferrer">
                    Open Certificate
                  </a>
                </p>
              </>
            )}
          </div>
          <div className="verification-badge">
            <span className="badge badge-verified">✅ BLOCKCHAIN VERIFIED</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="alert alert-danger">
          <h3>❌ CERTIFICATE NOT VERIFIED</h3>
          <p className="verification-message">
            This certificate is NOT registered on the blockchain or has been tampered with.
          </p>
          <div className="result-details">
            <p><strong>Certificate Hash:</strong> <code>{result.certificateHash}</code></p>
            <p><strong>Status:</strong> Not found on blockchain</p>
          </div>
          <div className="verification-badge">
            <span className="badge badge-danger">❌ NOT VERIFIED</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="certificate-verification">
      <h2>🔍 Verify Certificate</h2>

      <div className="verify-area">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          disabled={verifying}
          id="verify-file-input"
        />
        <label htmlFor="verify-file-input" className="file-label">
          {selectedFile ? selectedFile.name : 'Choose a certificate to verify'}
        </label>

        {selectedFile && (
          <div className="file-info">
            <p>📄 File: {selectedFile.name}</p>
            <p>📊 Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={!selectedFile || verifying}
          className="btn btn-secondary"
        >
          {verifying ? 'Verifying...' : 'Verify on Blockchain'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {renderVerificationResult()}
    </div>
  );
};

export default CertificateVerification;
