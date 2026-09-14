const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

let pinata;

// Initialize Pinata SDK
function initializePinata() {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.warn('⚠️  Pinata credentials not configured. IPFS features will be limited.');
    return null;
  }

  try {
    pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);
    console.log('✅ Pinata IPFS service initialized');
    return pinata;
  } catch (error) {
    console.error('Failed to initialize Pinata:', error);
    return null;
  }
}

/**
 * Upload file to IPFS via Pinata
 * @param {string} filePath - Path to the file to upload
 * @param {object} metadata - Optional metadata for the file
 * @returns {Promise<{cid: string, url: string}>}
 */
async function uploadFileToIPFS(filePath, metadata = {}) {
  try {
    if (!pinata) {
      pinata = initializePinata();
    }

    if (!pinata) {
      throw new Error('Pinata not configured');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Create readable stream
    const readableStream = fs.createReadStream(filePath);

    // Prepare options
    const options = {
      pinataMetadata: {
        name: metadata.filename || 'certificate',
        keyvalues: {
          type: 'certificate',
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    // Upload to IPFS
    console.log('📤 Uploading file to IPFS...');
    const result = await pinata.pinFileToIPFS(readableStream, options);

    const cid = result.IpfsHash;
    const url = `${PINATA_GATEWAY}${cid}`;

    console.log('✅ File uploaded to IPFS successfully');
    console.log('📍 CID:', cid);

    return {
      cid,
      url,
      pinSize: result.PinSize,
      timestamp: result.Timestamp
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
}

/**
 * Upload file buffer to IPFS
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {object} metadata - Optional metadata
 * @returns {Promise<{cid: string, url: string}>}
 */
async function uploadBufferToIPFS(buffer, filename, metadata = {}) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata credentials not configured');
    }

    // Use Pinata API directly for buffer upload
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    const formData = new FormData();
    formData.append('file', buffer, {
      filename: filename,
      contentType: metadata.mimeType || 'application/octet-stream'
    });

    // Add metadata (Pinata only accepts strings/numbers, not booleans)
    const sanitizedMetadata = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'boolean') {
        sanitizedMetadata[key] = value ? 'true' : 'false';
      } else if (value !== null && value !== undefined) {
        sanitizedMetadata[key] = String(value);
      }
    }

    const pinataMetadata = JSON.stringify({
      name: filename,
      keyvalues: {
        type: 'certificate',
        uploadedAt: new Date().toISOString(),
        ...sanitizedMetadata
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', pinataOptions);

    console.log('📤 Uploading buffer to IPFS...');

    const response = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      }
    });

    const cid = response.data.IpfsHash;
    const ipfsUrl = `${PINATA_GATEWAY}${cid}`;

    console.log('✅ Buffer uploaded to IPFS successfully');
    console.log('📍 CID:', cid);

    return {
      cid,
      url: ipfsUrl,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp
    };
  } catch (error) {
    console.error('IPFS buffer upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload buffer to IPFS: ${error.message}`);
  }
}

/**
 * Retrieve file from IPFS
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<string>} - URL to access the file
 */
function getIPFSUrl(cid) {
  return `${PINATA_GATEWAY}${cid}`;
}

/**
 * Check if file exists on IPFS
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<boolean>}
 */
async function checkIPFSFile(cid) {
  try {
    const url = getIPFSUrl(cid);
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Test Pinata connection
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    if (!pinata) {
      pinata = initializePinata();
    }

    if (!pinata) {
      return false;
    }

    await pinata.testAuthentication();
    console.log('✅ Pinata connection test successful');
    return true;
  } catch (error) {
    console.error('Pinata connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  initializePinata,
  uploadFileToIPFS,
  uploadBufferToIPFS,
  getIPFSUrl,
  checkIPFSFile,
  testConnection
};
