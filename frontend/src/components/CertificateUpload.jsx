import { useState } from 'react';
import { certificateAPI } from '../services/api';

const CertificateUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('certificate', selectedFile);

    try {
      const response = await certificateAPI.upload(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      setResult(response.data);
      setSelectedFile(null);

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload certificate');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="certificate-upload">
      <h2>📤 Upload Certificate</h2>

      <div className="upload-area">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          disabled={uploading}
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          {selectedFile ? selectedFile.name : 'Choose a certificate file'}
        </label>

        {selectedFile && (
          <div className="file-info">
            <p>📄 File: {selectedFile.name}</p>
            <p>📊 Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            <p>📋 Type: {selectedFile.type}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="btn btn-primary"
        >
          {uploading ? 'Uploading...' : 'Upload & Register on Blockchain'}
        </button>

        {uploading && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {result && result.success && (
        <div className="alert alert-success">
          <h3>✅ Certificate Registered Successfully!</h3>
          <div className="result-details">
            <p><strong>File Hash:</strong> <code>{result.certificate.fileHash}</code></p>
            <p><strong>IPFS CID:</strong> <code>{result.certificate.ipfsCid}</code></p>
            <p><strong>IPFS URL:</strong> <a href={result.certificate.ipfsUrl} target="_blank" rel="noopener noreferrer">View on IPFS</a></p>
            <p><strong>Blockchain TX:</strong> <code>{result.certificate.transactionHash}</code></p>
            <p><strong>Status:</strong> <span className="badge badge-success">Blockchain Verified ✅</span></p>
          </div>
        </div>
      )}

      {result && result.partialSuccess && (
        <div className="alert alert-warning">
          <h3>⚠️ Partial Success</h3>
          <p>Certificate uploaded to IPFS but blockchain registration failed.</p>
          <p>{result.error}</p>
        </div>
      )}
    </div>
  );
};

export default CertificateUpload;
