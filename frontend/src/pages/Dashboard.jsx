import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { certificateAPI } from '../services/api';
import CertificateUpload from '../components/CertificateUpload';
import CertificateVerification from '../components/CertificateVerification';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await certificateAPI.getUserCertificates();
      setCertificates(response.data.certificates);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchCertificates();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🔐 BlockIntel Dashboard</h1>
        <div className="user-info">
          <span>👤 {user.fullName}</span>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload Certificate
        </button>
        <button
          className={activeTab === 'verify' ? 'active' : ''}
          onClick={() => setActiveTab('verify')}
        >
          🔍 Verify Certificate
        </button>
        <button
          className={activeTab === 'my-certificates' ? 'active' : ''}
          onClick={() => setActiveTab('my-certificates')}
        >
          📋 My Certificates
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'upload' && (
          <CertificateUpload onUploadSuccess={handleUploadSuccess} />
        )}

        {activeTab === 'verify' && (
          <CertificateVerification />
        )}

        {activeTab === 'my-certificates' && (
          <div className="my-certificates">
            <h2>📋 My Certificates</h2>
            {loading ? (
              <p>Loading...</p>
            ) : certificates.length === 0 ? (
              <p>No certificates uploaded yet.</p>
            ) : (
              <div className="certificates-list">
                {certificates.map(cert => (
                  <div key={cert.id} className="certificate-card">
                    <h3>📄 {cert.originalFilename}</h3>
                    <div className="cert-details">
                      <p><strong>Hash:</strong> <code>{cert.fileHash.substring(0, 16)}...</code></p>
                      <p><strong>IPFS CID:</strong> <code>{cert.ipfsCid}</code></p>
                      <p>
                        <strong>Status:</strong>{' '}
                        {cert.blockchainVerified ? (
                          <span className="badge badge-success">✅ Verified</span>
                        ) : (
                          <span className="badge badge-warning">⏳ Pending</span>
                        )}
                      </p>
                      <p><strong>Uploaded:</strong> {new Date(cert.createdAt).toLocaleString()}</p>
                      {cert.ipfsUrl && (
                        <a href={cert.ipfsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-small">
                          View on IPFS
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
