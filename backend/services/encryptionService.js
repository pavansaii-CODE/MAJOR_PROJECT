const crypto = require('crypto');

// AES-256-GCM encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
}

/**
 * Encrypt file buffer using AES-256-GCM
 * @param {Buffer} buffer - Original file buffer
 * @returns {Buffer} - Encrypted buffer with IV and auth tag prepended
 */
function encryptFile(buffer) {
  try {
    // Generate random initialization vector (16 bytes)
    const iv = crypto.randomBytes(16);

    // Create cipher with encryption key and IV
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Encrypt the buffer
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    // Get authentication tag (for GCM mode - ensures integrity)
    const authTag = cipher.getAuthTag();

    // Return: [IV (16 bytes)] + [Auth Tag (16 bytes)] + [Encrypted Data]
    // This structure allows decryption without storing IV/tag separately
    const result = Buffer.concat([iv, authTag, encrypted]);

    console.log('✅ File encrypted successfully');
    console.log(`   Original size: ${buffer.length} bytes`);
    console.log(`   Encrypted size: ${result.length} bytes (includes 32-byte header)`);

    return result;
  } catch (error) {
    console.error('❌ Encryption error:', error.message);
    throw new Error(`File encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt file buffer using AES-256-GCM
 * @param {Buffer} encryptedBuffer - Encrypted buffer with IV and auth tag
 * @returns {Buffer} - Original decrypted file buffer
 */
function decryptFile(encryptedBuffer) {
  try {
    // Extract components from encrypted buffer
    const iv = encryptedBuffer.slice(0, 16);           // First 16 bytes: IV
    const authTag = encryptedBuffer.slice(16, 32);     // Next 16 bytes: Auth Tag
    const encrypted = encryptedBuffer.slice(32);        // Rest: Encrypted data

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Set authentication tag (GCM mode)
    decipher.setAuthTag(authTag);

    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    console.log('✅ File decrypted successfully');
    console.log(`   Encrypted size: ${encryptedBuffer.length} bytes`);
    console.log(`   Decrypted size: ${decrypted.length} bytes`);

    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error.message);
    throw new Error(`File decryption failed: ${error.message}`);
  }
}

/**
 * Check if encryption is enabled
 * @returns {boolean}
 */
function isEncryptionEnabled() {
  return !!(ENCRYPTION_KEY && ENCRYPTION_KEY.length === 64);
}

module.exports = {
  encryptFile,
  decryptFile,
  isEncryptionEnabled
};
