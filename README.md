# BlockIntel: Decentralized AI-Based Skill Verification Framework

## Objective 1 Implementation: Secure Credential Verification using Blockchain ✅

A complete blockchain-based certificate verification system using IPFS for decentralized storage.

---

## 🎯 What's Implemented

### Core Features (Objective 1)
✅ **Certificate Upload & Registration** - Upload certificates → Generate SHA-256 hash → Store on IPFS → Register on blockchain  
✅ **Certificate Verification** - Upload certificate → Verify against blockchain → VERIFIED/NOT VERIFIED  
✅ **User Authentication** - JWT-based secure login/registration  
✅ **Blockchain Integration** - Solidity smart contract + local Ethereum network  
✅ **Decentralized Storage** - IPFS via Pinata for permanent file storage  

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite |
| **Backend** | Node.js, Express.js, JWT |
| **Database** | SQLite |
| **Blockchain** | Ethereum, Hardhat, Solidity 0.8.20, ethers.js v6 |
| **Storage** | IPFS (Pinata) |
| **Hashing** | SHA-256 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git

### Setup

```bash
# 1. Install all dependencies
cd backend && npm install
cd ../blockchain && npm install
cd ../frontend && npm install

# 2. Configure Pinata IPFS
cd ../backend
cp .env.example .env
# Edit .env and add your Pinata API keys from https://pinata.cloud

# 3. Start blockchain (Terminal 1)
cd ../blockchain
npx hardhat node

# 4. Deploy smart contract (Terminal 2)
cd blockchain
npx hardhat compile
npm run deploy

# 5. Start backend (Terminal 3)
cd backend
npm run dev

# 6. Start frontend (Terminal 4)
cd frontend
npm run dev
```

**Open browser**: http://localhost:5173

---

## 📁 Project Structure

```
MAJOR_PROJECT/
├── backend/          # Express API, services, database
├── blockchain/       # Solidity contracts, Hardhat setup
├── frontend/         # React UI (Vite)
└── README.md
```

---

## 🧪 Testing

1. Register account at http://localhost:5173
2. Upload a certificate (PDF/image)
3. See blockchain transaction + IPFS CID
4. Go to Verify tab
5. Upload same file → ✅ VERIFIED
6. Upload different file → ❌ NOT VERIFIED

---

## 🔐 API Endpoints

```
POST   /api/auth/register          # Register user
POST   /api/auth/login             # Login
POST   /api/certificates/upload    # Upload & register (protected)
POST   /api/certificates/verify    # Verify certificate (public)
GET    /api/certificates           # Get user's certificates (protected)
```

---

## 🎓 Key Concepts for Viva

**Why Blockchain?** Immutable, decentralized, tamper-evident certificate records  
**Why IPFS?** Decentralized file storage, content-addressed, permanent  
**How Verification Works?** Generate hash → Compare with blockchain → Match = VERIFIED  

**Security**: Backend-generated hashes, JWT auth, file validation, environment variable secrets

---

## ⚠️ What's NOT Implemented (Future Work)

- ❌ Objective 2: AI Skill Extraction & Scoring
- ❌ Objective 3: Recruiter Candidate Ranking
- ❌ Testnet/Mainnet deployment (currently local Hardhat network)

---

## 🛠️ Troubleshooting

**"Contract address not configured"** → Run `cd blockchain && npm run deploy`  
**"Pinata upload failed"** → Check API keys in backend/.env  
**"Blockchain connection failed"** → Ensure `npx hardhat node` is running  

---

## 📊 Status

**Objective 1: ✅ COMPLETE** - Ready for demonstration!