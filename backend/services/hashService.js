const crypto = require('crypto');
const fs = require('fs');

/**
 * Generate SHA-256 hash from buffer
 * @param {Buffer} buffer - File buffer
 * @returns {string} - Hex encoded SHA-256 hash
 */
function generateHashFromBuffer(buffer) {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * Generate SHA-256 hash from file
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} - Hex encoded SHA-256 hash
 */
function generateHashFromFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Generate SHA-256 hash from string
 * @param {string} data - Input string
 * @returns {string} - Hex encoded SHA-256 hash
 */
function generateHashFromString(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Convert hex hash to bytes32 format for Ethereum
 * @param {string} hexHash - SHA-256 hash in hex format (64 characters)
 * @returns {string} - bytes32 format with 0x prefix
 */
function hashToBytes32(hexHash) {
  // Remove 0x prefix if present
  const cleanHash = hexHash.startsWith('0x') ? hexHash.slice(2) : hexHash;

  // Validate hash length
  if (cleanHash.length !== 64) {
    throw new Error('Invalid hash length. Expected 64 hex characters for SHA-256');
  }

  return '0x' + cleanHash;
}

/**
 * Convert bytes32 to hex hash
 * @param {string} bytes32Hash - Hash in bytes32 format with 0x prefix
 * @returns {string} - SHA-256 hash in hex format
 */
function bytes32ToHash(bytes32Hash) {
  return bytes32Hash.startsWith('0x') ? bytes32Hash.slice(2) : bytes32Hash;
}

/**
 * Verify if a buffer matches a given hash
 * @param {Buffer} buffer - File buffer to verify
 * @param {string} expectedHash - Expected SHA-256 hash
 * @returns {boolean} - True if hashes match
 */
function verifyHash(buffer, expectedHash) {
  const actualHash = generateHashFromBuffer(buffer);
  return actualHash === expectedHash;
}

/**
 * Generate a unique filename based on hash and timestamp
 * @param {string} originalFilename - Original filename
 * @param {string} hash - SHA-256 hash
 * @returns {string} - Unique filename
 */
function generateSecureFilename(originalFilename, hash) {
  const extension = originalFilename.split('.').pop();
  const timestamp = Date.now();
  const shortHash = hash.substring(0, 16);
  return `${shortHash}_${timestamp}.${extension}`;
}

module.exports = {
  generateHashFromBuffer,
  generateHashFromFile,
  generateHashFromString,
  hashToBytes32,
  bytes32ToHash,
  verifyHash,
  generateSecureFilename
};
