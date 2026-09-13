const { getContract, getContractWithSigner, testConnection } = require('../config/blockchain');
const { hashToBytes32, bytes32ToHash } = require('./hashService');

/**
 * Register certificate on blockchain
 * @param {string} certificateHash - SHA-256 hash of certificate (hex format)
 * @param {string} ipfsCid - IPFS Content Identifier
 * @param {string} studentId - Student ID
 * @returns {Promise<object>} - Transaction details
 */
async function registerCertificate(certificateHash, ipfsCid, studentId = '') {
  try {
    console.log('📝 Registering certificate on blockchain...');

    // Convert hash to bytes32 format
    const bytes32Hash = hashToBytes32(certificateHash);

    // Get contract with signer
    const contract = await getContractWithSigner();

    // Call smart contract
    const tx = await contract.registerCertificate(
      bytes32Hash,
      ipfsCid,
      studentId
    );

    console.log('⏳ Transaction submitted:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log('✅ Certificate registered on blockchain');
    console.log('   Transaction Hash:', receipt.hash);
    console.log('   Block Number:', receipt.blockNumber);
    console.log('   Gas Used:', receipt.gasUsed.toString());

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed'
    };
  } catch (error) {
    console.error('Blockchain registration error:', error);

    // Check for specific error messages
    if (error.message.includes('Certificate already registered')) {
      throw new Error('This certificate is already registered on the blockchain');
    }

    throw new Error(`Blockchain registration failed: ${error.message}`);
  }
}

/**
 * Verify certificate on blockchain
 * @param {string} certificateHash - SHA-256 hash of certificate (hex format)
 * @returns {Promise<object>} - Verification result
 */
async function verifyCertificate(certificateHash) {
  try {
    console.log('🔍 Verifying certificate on blockchain...');

    // Convert hash to bytes32 format
    const bytes32Hash = hashToBytes32(certificateHash);

    // Get contract (read-only)
    const contract = getContract();

    // Call smart contract verification function
    const [exists, record] = await contract.verifyCertificate(bytes32Hash);

    if (!exists) {
      console.log('❌ Certificate not found on blockchain');
      return {
        verified: false,
        exists: false,
        message: 'Certificate not registered on blockchain'
      };
    }

    console.log('✅ Certificate verified on blockchain');

    return {
      verified: true,
      exists: true,
      certificateHash: bytes32ToHash(record.certificateHash),
      ipfsCid: record.ipfsCid,
      studentAddress: record.studentAddress,
      studentId: record.studentId,
      timestamp: Number(record.timestamp),
      isVerified: record.isVerified,
      message: 'Certificate is valid and registered on blockchain'
    };
  } catch (error) {
    console.error('Blockchain verification error:', error);
    throw new Error(`Blockchain verification failed: ${error.message}`);
  }
}

/**
 * Check if certificate is registered
 * @param {string} certificateHash - SHA-256 hash
 * @returns {Promise<boolean>}
 */
async function isCertificateRegistered(certificateHash) {
  try {
    const bytes32Hash = hashToBytes32(certificateHash);
    const contract = getContract();
    return await contract.isCertificateRegistered(bytes32Hash);
  } catch (error) {
    console.error('Error checking certificate registration:', error);
    return false;
  }
}

/**
 * Get certificate details from blockchain
 * @param {string} certificateHash - SHA-256 hash
 * @returns {Promise<object>}
 */
async function getCertificateDetails(certificateHash) {
  try {
    const bytes32Hash = hashToBytes32(certificateHash);
    const contract = getContract();

    const record = await contract.getCertificate(bytes32Hash);

    return {
      certificateHash: bytes32ToHash(record.certificateHash),
      ipfsCid: record.ipfsCid,
      studentAddress: record.studentAddress,
      studentId: record.studentId,
      timestamp: Number(record.timestamp),
      isVerified: record.isVerified
    };
  } catch (error) {
    if (error.message.includes('Certificate not found')) {
      return null;
    }
    throw error;
  }
}

/**
 * Get all certificates for a student address
 * @param {string} studentAddress - Ethereum address
 * @returns {Promise<array>}
 */
async function getStudentCertificates(studentAddress) {
  try {
    const contract = getContract();
    const hashes = await contract.getStudentCertificates(studentAddress);

    return hashes.map(hash => bytes32ToHash(hash));
  } catch (error) {
    console.error('Error fetching student certificates:', error);
    return [];
  }
}

/**
 * Log verification event on blockchain
 * @param {string} certificateHash - SHA-256 hash
 * @returns {Promise<object>}
 */
async function logVerification(certificateHash) {
  try {
    const bytes32Hash = hashToBytes32(certificateHash);
    const contract = await getContractWithSigner();

    const tx = await contract.logVerification(bytes32Hash);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error logging verification:', error);
    throw error;
  }
}

/**
 * Get blockchain network info
 * @returns {Promise<object>}
 */
async function getNetworkInfo() {
  try {
    const { getProvider } = require('../config/blockchain');
    const provider = getProvider();

    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    return {
      chainId: network.chainId.toString(),
      name: network.name,
      blockNumber
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return null;
  }
}

module.exports = {
  registerCertificate,
  verifyCertificate,
  isCertificateRegistered,
  getCertificateDetails,
  getStudentCertificates,
  logVerification,
  getNetworkInfo,
  testConnection
};
