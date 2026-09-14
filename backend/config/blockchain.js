const { ethers } = require('ethers');
const fs = require('path');

// Contract ABI will be loaded from compiled artifacts
let contractABI;
try {
  const artifactPath = require('path').join(__dirname, '../../blockchain/artifacts/contracts/CertificateVerification.sol/CertificateVerification.json');
  if (require('fs').existsSync(artifactPath)) {
    const artifact = require(artifactPath);
    contractABI = artifact.abi;
  }
} catch (error) {
  console.warn('⚠️  Contract ABI not found. Please compile contracts first.');
  contractABI = null;
}

// Blockchain configuration
const config = {
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
  contractAddress: process.env.CONTRACT_ADDRESS,
  privateKey: process.env.DEPLOYER_PRIVATE_KEY
};

// Create provider
function getProvider() {
  try {
    return new ethers.JsonRpcProvider(config.rpcUrl);
  } catch (error) {
    console.error('Failed to create provider:', error);
    throw new Error('Blockchain connection failed');
  }
}

// Create signer (for transactions)
function getSigner() {
  try {
    const provider = getProvider();

    // If private key is provided, use it
    if (config.privateKey) {
      return new ethers.Wallet(config.privateKey, provider);
    }

    // Otherwise, use first account from provider (for local development)
    return provider.getSigner();
  } catch (error) {
    console.error('Failed to create signer:', error);
    throw new Error('Failed to create blockchain signer');
  }
}

// Get contract instance (read-only)
function getContract() {
  if (!contractABI) {
    throw new Error('Contract ABI not loaded. Compile contracts first.');
  }

  if (!config.contractAddress) {
    throw new Error('Contract address not configured. Deploy contract first.');
  }

  const provider = getProvider();
  return new ethers.Contract(config.contractAddress, contractABI, provider);
}

// Get contract instance with signer (for transactions)
async function getContractWithSigner() {
  if (!contractABI) {
    throw new Error('Contract ABI not loaded. Compile contracts first.');
  }

  if (!config.contractAddress) {
    throw new Error('Contract address not configured. Deploy contract first.');
  }

  const signer = await getSigner();
  return new ethers.Contract(config.contractAddress, contractABI, signer);
}

// Test blockchain connection
async function testConnection() {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    console.log('✅ Blockchain connection successful');
    console.log('   Network:', network.name);
    console.log('   Chain ID:', network.chainId.toString());
    console.log('   Block Number:', blockNumber);

    return true;
  } catch (error) {
    console.error('❌ Blockchain connection failed:', error.message);
    return false;
  }
}

module.exports = {
  config,
  getProvider,
  getSigner,
  getContract,
  getContractWithSigner,
  testConnection,
  contractABI
};
