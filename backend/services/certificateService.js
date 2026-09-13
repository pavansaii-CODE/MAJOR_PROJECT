const Certificate = require('../models/Certificate');
const { generateHashFromBuffer } = require('./hashService');
const { uploadBufferToIPFS } = require('./ipfsService');
const { registerCertificate: registerOnBlockchain, verifyCertificate: verifyOnBlockchain } = require('./blockchainService');

/**
 * Process and register a certificate
 * This is the main orchestration function for Objective 1
 *
 * Flow:
 * 1. Generate SHA-256 hash of file
 * 2. Upload file to IPFS
 * 3. Save metadata to database
 * 4. Register hash on blockchain
 * 5. Update database with blockchain info
 *
 * @param {object} params - Certificate parameters
 * @param {Buffer} params.fileBuffer - File buffer
 * @param {string} params.originalFilename - Original filename
 * @param {number} params.fileSize - File size in bytes
 * @param {string} params.mimeType - MIME type
 * @param {string} params.userId - User ID
 * @param {string} params.studentId - Student ID (optional)
 * @returns {Promise<object>} - Registration result
 */
async function processAndRegisterCertificate({
  fileBuffer,
  originalFilename,
  fileSize,
  mimeType,
  userId,
  studentId = ''
}) {
  try {
    console.log('='.repeat(60));
    console.log('🔄 Processing Certificate Registration');
    console.log('='.repeat(60));

    // Step 1: Generate SHA-256 hash
    console.log('1️⃣  Generating SHA-256 hash...');
    const fileHash = generateHashFromBuffer(fileBuffer);
    console.log('   Hash:', fileHash);

    // Check if already registered
    const existing = await Certificate.findByHash(fileHash);
    if (existing) {
      throw new Error('This certificate has already been registered');
    }

    // Step 2: Upload to IPFS
    console.log('2️⃣  Uploading to IPFS...');
    const ipfsResult = await uploadBufferToIPFS(fileBuffer, originalFilename, {
      userId,
      studentId,
      mimeType,
      fileHash
    });
    console.log('   IPFS CID:', ipfsResult.cid);
    console.log('   IPFS URL:', ipfsResult.url);

    // Step 3: Save to database (without blockchain info yet)
    console.log('3️⃣  Saving to database...');
    const certificate = await Certificate.create({
      userId,
      originalFilename,
      fileHash,
      fileSize,
      mimeType,
      ipfsCid: ipfsResult.cid,
      ipfsUrl: ipfsResult.url
    });
    console.log('   Database ID:', certificate.id);

    // Step 4: Register on blockchain
    console.log('4️⃣  Registering on blockchain...');
    try {
      const blockchainResult = await registerOnBlockchain(
        fileHash,
        ipfsResult.cid,
        studentId
      );
      console.log('   Transaction Hash:', blockchainResult.transactionHash);
      console.log('   Block Number:', blockchainResult.blockNumber);

      // Step 5: Update database with blockchain info
      console.log('5️⃣  Updating blockchain verification status...');
      const updatedCertificate = await Certificate.updateBlockchainVerification(
        certificate.id,
        blockchainResult.transactionHash
      );

      console.log('='.repeat(60));
      console.log('✅ Certificate Registration Complete!');
      console.log('='.repeat(60));

      return {
        success: true,
        certificate: {
          id: updatedCertificate.id,
          originalFilename: updatedCertificate.original_filename,
          fileHash: updatedCertificate.file_hash,
          fileSize: updatedCertificate.file_size,
          ipfsCid: updatedCertificate.ipfs_cid,
          ipfsUrl: updatedCertificate.ipfs_url,
          blockchainVerified: Boolean(updatedCertificate.blockchain_verified),
          transactionHash: updatedCertificate.blockchain_tx_hash,
          verifiedAt: updatedCertificate.verified_at,
          createdAt: updatedCertificate.created_at
        },
        blockchain: blockchainResult,
        message: 'Certificate successfully registered and verified on blockchain'
      };
    } catch (blockchainError) {
      // Blockchain registration failed, but file is in IPFS and database
      console.error('⚠️  Blockchain registration failed:', blockchainError.message);
      console.log('   Certificate saved to database and IPFS, but not blockchain-verified');

      return {
        success: false,
        partialSuccess: true,
        certificate: {
          id: certificate.id,
          originalFilename: certificate.original_filename,
          fileHash: certificate.file_hash,
          fileSize: certificate.file_size,
          ipfsCid: certificate.ipfs_cid,
          ipfsUrl: certificate.ipfs_url,
          blockchainVerified: false
        },
        error: 'Certificate uploaded but blockchain registration failed',
        blockchainError: blockchainError.message
      };
    }
  } catch (error) {
    console.error('❌ Certificate processing error:', error);
    throw error;
  }
}

/**
 * Verify a certificate by comparing its hash with blockchain
 *
 * @param {Buffer} fileBuffer - File buffer to verify
 * @returns {Promise<object>} - Verification result
 */
async function verifyCertificateByFile(fileBuffer) {
  try {
    console.log('🔍 Verifying certificate...');

    // Generate hash from uploaded file
    const fileHash = generateHashFromBuffer(fileBuffer);
    console.log('   File hash:', fileHash);

    // Check database first
    const dbCertificate = await Certificate.findByHash(fileHash);

    // Verify on blockchain
    const blockchainResult = await verifyOnBlockchain(fileHash);

    if (blockchainResult.verified) {
      return {
        verified: true,
        certificateHash: fileHash,
        blockchain: blockchainResult,
        database: dbCertificate ? {
          id: dbCertificate.id,
          originalFilename: dbCertificate.original_filename,
          ipfsCid: dbCertificate.ipfs_cid,
          ipfsUrl: dbCertificate.ipfs_url,
          transactionHash: dbCertificate.blockchain_tx_hash,
          verifiedAt: dbCertificate.verified_at
        } : null,
        message: '✅ VERIFIED - This certificate is registered on the blockchain'
      };
    } else {
      return {
        verified: false,
        certificateHash: fileHash,
        message: '❌ NOT VERIFIED - This certificate is not registered on the blockchain or has been tampered with'
      };
    }
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
}

/**
 * Verify certificate by hash
 * @param {string} fileHash - SHA-256 hash
 * @returns {Promise<object>}
 */
async function verifyCertificateByHash(fileHash) {
  try {
    const blockchainResult = await verifyOnBlockchain(fileHash);
    const dbCertificate = await Certificate.findByHash(fileHash);

    return {
      verified: blockchainResult.verified,
      certificateHash: fileHash,
      blockchain: blockchainResult,
      database: dbCertificate || null
    };
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
}

/**
 * Get all certificates for a user
 * @param {string} userId - User ID
 * @returns {Promise<array>}
 */
async function getUserCertificates(userId) {
  try {
    return await Certificate.findByUserId(userId);
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    throw error;
  }
}

/**
 * Get certificate details by ID
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<object>}
 */
async function getCertificateById(certificateId) {
  try {
    return await Certificate.findById(certificateId);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
}

module.exports = {
  processAndRegisterCertificate,
  verifyCertificateByFile,
  verifyCertificateByHash,
  getUserCertificates,
  getCertificateById
};
