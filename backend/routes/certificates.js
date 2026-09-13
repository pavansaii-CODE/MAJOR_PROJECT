const express = require('express');
const { authenticate } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const {
  processAndRegisterCertificate,
  verifyCertificateByFile,
  verifyCertificateByHash,
  getUserCertificates,
  getCertificateById
} = require('../services/certificateService');
const { getNetworkInfo, testConnection } = require('../services/blockchainService');

const router = express.Router();

/**
 * POST /api/certificates/upload
 * Upload and register a certificate
 * Protected route - requires authentication
 */
router.post('/upload', authenticate, upload.single('certificate'), handleMulterError, async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { studentId } = req.body;

    console.log('📥 Certificate upload request received');
    console.log('   User:', req.user.email);
    console.log('   File:', req.file.originalname);
    console.log('   Size:', req.file.size, 'bytes');

    // Process and register certificate
    const result = await processAndRegisterCertificate({
      fileBuffer: req.file.buffer,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      userId: req.user.id,
      studentId: studentId || req.user.studentId || ''
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      // Partial success - uploaded but blockchain failed
      res.status(202).json(result);
    }
  } catch (error) {
    console.error('Upload error:', error);

    if (error.message.includes('already been registered')) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to process certificate',
      details: error.message
    });
  }
});

/**
 * POST /api/certificates/verify
 * Verify a certificate by uploading it
 * Public route - anyone can verify
 */
router.post('/verify', upload.single('certificate'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('🔍 Certificate verification request received');
    console.log('   File:', req.file.originalname);

    const result = await verifyCertificateByFile(req.file.buffer);

    res.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Failed to verify certificate',
      details: error.message
    });
  }
});

/**
 * GET /api/certificates/verify/:hash
 * Verify a certificate by its hash
 * Public route
 */
router.get('/verify/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash || hash.length !== 64) {
      return res.status(400).json({ error: 'Invalid hash format. Expected 64-character SHA-256 hash' });
    }

    const result = await verifyCertificateByHash(hash);

    res.json(result);
  } catch (error) {
    console.error('Hash verification error:', error);
    res.status(500).json({
      error: 'Failed to verify certificate',
      details: error.message
    });
  }
});

/**
 * GET /api/certificates
 * Get all certificates for the authenticated user
 * Protected route
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const certificates = await getUserCertificates(req.user.id);

    res.json({
      count: certificates.length,
      certificates: certificates.map(cert => ({
        id: cert.id,
        originalFilename: cert.original_filename,
        fileHash: cert.file_hash,
        fileSize: cert.file_size,
        mimeType: cert.mime_type,
        ipfsCid: cert.ipfs_cid,
        ipfsUrl: cert.ipfs_url,
        blockchainVerified: Boolean(cert.blockchain_verified),
        transactionHash: cert.blockchain_tx_hash,
        verifiedAt: cert.verified_at,
        createdAt: cert.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

/**
 * GET /api/certificates/:id
 * Get specific certificate details
 * Protected route - user can only access their own certificates
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const certificate = await getCertificateById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Check ownership
    if (certificate.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: certificate.id,
      originalFilename: certificate.original_filename,
      fileHash: certificate.file_hash,
      fileSize: certificate.file_size,
      mimeType: certificate.mime_type,
      ipfsCid: certificate.ipfs_cid,
      ipfsUrl: certificate.ipfs_url,
      blockchainVerified: Boolean(certificate.blockchain_verified),
      transactionHash: certificate.blockchain_tx_hash,
      verifiedAt: certificate.verified_at,
      createdAt: certificate.created_at
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

/**
 * GET /api/certificates/blockchain/status
 * Check blockchain connection status
 * Public route
 */
router.get('/blockchain/status', async (req, res) => {
  try {
    const isConnected = await testConnection();
    const networkInfo = await getNetworkInfo();

    res.json({
      connected: isConnected,
      network: networkInfo
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

module.exports = router;
