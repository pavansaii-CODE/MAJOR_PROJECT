# BlockIntel - Complete Setup Guide

## 📋 Step-by-Step Setup Instructions

### Step 1: Get Pinata IPFS API Keys

1. Go to https://pinata.cloud
2. Click "Sign Up" (it's free!)
3. Verify your email
4. Go to Dashboard → API Keys
5. Click "New Key"
6. Give it a name (e.g., "BlockIntel")
7. Enable "pinFileToIPFS" permission
8. Copy your **API Key** and **API Secret**
9. Save these - you'll need them in Step 3

### Step 2: Install Dependencies

Open terminal in `MAJOR_PROJECT` folder:

```bash
# Backend
cd backend
npm install

# Blockchain
cd ../blockchain
npm install

# Frontend
cd ../frontend
npm install
```

Wait for all installations to complete.

### Step 3: Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` in a text editor and update:

```env
# REQUIRED: Add your Pinata keys from Step 1
PINATA_API_KEY=paste_your_api_key_here
PINATA_SECRET_API_KEY=paste_your_secret_key_here

# Optional: Change JWT secret for production
JWT_SECRET=your_super_secret_change_this_12345

# Keep these as-is for local development
PORT=5000
DATABASE_PATH=./database.sqlite
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
FRONTEND_URL=http://localhost:5173
```

Save the file.

### Step 4: Start Blockchain Network

Open **Terminal 1**:

```bash
cd blockchain
npx hardhat node
```

You should see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
[... more accounts ...]
```

**Keep this terminal running!** Don't close it.

### Step 5: Compile and Deploy Smart Contract

Open **Terminal 2**:

```bash
cd blockchain
npx hardhat compile
```

You should see:
```
Compiled 1 Solidity file successfully
```

Then deploy:

```bash
npm run deploy
```

or

```bash
npx hardhat run scripts/deploy.js --network localhost
```

You should see:
```
🚀 Deploying CertificateVerification Smart Contract
✅ Contract deployed successfully!
📄 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

The deploy script automatically updates `backend/.env` with the contract address.

### Step 6: Start Backend Server

Open **Terminal 3**:

```bash
cd backend
npm run dev
```

or

```bash
node server.js
```

You should see:
```
==================================================
🚀 BlockIntel Backend Server Started
==================================================
📡 Server running on: http://localhost:5000
🌍 Environment: development
📁 Database: ./database.sqlite
==================================================
✅ Connected to SQLite database
✅ Users table ready
✅ Certificates table ready
✅ Database indexes created
```

**Keep this terminal running!**

### Step 7: Start Frontend

Open **Terminal 4**:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal running!**

### Step 8: Open the Application

Open your browser and go to:

```
http://localhost:5173
```

You should see the BlockIntel login page.

---

## 🧪 Testing the Complete Flow

### Test 1: User Registration

1. Click **"Register"** tab
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `John Doe`
   - Student ID: `STU123456`
3. Click **"Register"**
4. You should be redirected to the dashboard

### Test 2: Certificate Upload

1. On the dashboard, you should see **"Upload Certificate"** tab (active by default)
2. Click **"Choose a certificate file"**
3. Select any PDF or image file (your degree, marksheet, or any document)
4. Click **"Upload & Register on Blockchain"**
5. Watch the progress bar
6. After 10-30 seconds, you should see:

```
✅ Certificate Registered Successfully!

File Hash: a1b2c3d4e5f6...
IPFS CID: QmXyz123...
IPFS URL: https://gateway.pinata.cloud/ipfs/QmXyz...
Blockchain TX: 0xabc123...
Status: Blockchain Verified ✅
```

7. Click on the IPFS URL to view your certificate on IPFS

### Test 3: Certificate Verification (Same File)

1. Click **"Verify Certificate"** tab
2. Upload the **SAME** file you just uploaded
3. Click **"Verify on Blockchain"**
4. You should see:

```
✅ CERTIFICATE VERIFIED

This certificate is authentic and registered on the blockchain.

Certificate Hash: a1b2c3d4e5f6...
IPFS CID: QmXyz123...
Student ID: STU123456
Registered: [timestamp]
Status: ✅ BLOCKCHAIN VERIFIED
```

### Test 4: Tamper Detection (Different File)

1. Stay on **"Verify Certificate"** tab
2. Upload a **DIFFERENT** file (or edit the original and upload)
3. Click **"Verify on Blockchain"**
4. You should see:

```
❌ CERTIFICATE NOT VERIFIED

This certificate is NOT registered on the blockchain
or has been tampered with.

Status: ❌ NOT VERIFIED
```

### Test 5: View Your Certificates

1. Click **"My Certificates"** tab
2. You should see a list of all certificates you've uploaded
3. Each certificate shows:
   - Filename
   - Hash (truncated)
   - IPFS CID
   - Verification status
   - Upload date
   - "View on IPFS" button

---

## ✅ Verification Checklist

Check all boxes to confirm your setup is working:

- [ ] All 4 terminals are running without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can register a new user
- [ ] Can login
- [ ] Can upload a certificate
- [ ] See IPFS CID after upload
- [ ] See blockchain transaction hash
- [ ] Can verify the same certificate (shows VERIFIED)
- [ ] Different certificate shows NOT VERIFIED
- [ ] Can view "My Certificates" list
- [ ] IPFS link opens and shows the certificate

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module" errors during npm install

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Blockchain errors in Terminal 1

**Solution:**
```bash
# Stop Hardhat node (Ctrl+C)
# Clear Hardhat cache
npx hardhat clean
# Restart
npx hardhat node
```

Then re-deploy (Terminal 2):
```bash
npm run deploy
```

### Issue 3: "Contract address not configured" in backend

**Solution:**
```bash
cd blockchain
npm run deploy
```

The deploy script automatically updates `backend/.env`

### Issue 4: "Pinata upload failed"

**Possible causes:**

A. **Wrong API keys**
- Double-check your Pinata keys in `backend/.env`
- Make sure there are no extra spaces

B. **No internet connection**
- Pinata requires internet access
- Check your connection

C. **Pinata free tier limit reached**
- Free tier: 1GB storage
- Create a new account if needed

### Issue 5: Backend won't start

**Solution:**
```bash
# Check if port 5000 is already in use
# On Windows:
netstat -ano | findstr :5000

# On Mac/Linux:
lsof -i :5000

# Kill the process or change PORT in backend/.env
```

### Issue 6: Smart contract tests failing

**Solution:**
```bash
cd blockchain
npx hardhat clean
npx hardhat compile
npx hardhat test
```

### Issue 7: "CORS error" in browser console

**Solution:**
- Make sure backend is running
- Check that `FRONTEND_URL` in backend/.env matches your frontend URL
- Restart backend after changing .env

---

## 🔄 Restarting After Computer Restart

If you restart your computer, you need to:

1. **Start Blockchain** (Terminal 1)
```bash
cd blockchain
npx hardhat node
```

2. **Re-deploy Contract** (Terminal 2)
```bash
cd blockchain
npm run deploy
```

3. **Start Backend** (Terminal 3)
```bash
cd backend
npm run dev
```

4. **Start Frontend** (Terminal 4)
```bash
cd frontend
npm run dev
```

**Note:** The local Hardhat blockchain resets when stopped, so you need to re-deploy the contract. Previously uploaded certificates won't be on the blockchain anymore (but will still be in the database).

---

## 📊 Understanding the Logs

### Backend Logs

When you upload a certificate, you should see:

```
==================================================
🔄 Processing Certificate Registration
==================================================
1️⃣  Generating SHA-256 hash...
   Hash: a1b2c3d4e5f6789...
2️⃣  Uploading to IPFS...
   IPFS CID: QmXyz123...
   IPFS URL: https://gateway.pinata.cloud/ipfs/QmXyz...
3️⃣  Saving to database...
   Database ID: uuid-here
4️⃣  Registering on blockchain...
📝 Registering certificate on blockchain...
⏳ Transaction submitted: 0xabc123...
✅ Certificate registered on blockchain
   Transaction Hash: 0xabc123...
   Block Number: 2
5️⃣  Updating blockchain verification status...
==================================================
✅ Certificate Registration Complete!
==================================================
```

### Blockchain Logs (Terminal 1)

You should see transactions:

```
eth_sendTransaction
  Contract call:       CertificateVerification#registerCertificate
  Transaction:         0xabc123...
  From:                0xf39fd6e...
  Gas used:            123456

eth_getTransactionReceipt
```

---

## 🎯 Next Steps

Now that Objective 1 is working:

1. **Demo Preparation:**
   - Practice the complete flow
   - Prepare sample certificates
   - Note down: hash values, IPFS CIDs, transaction hashes

2. **Understanding for Viva:**
   - Review [backend/services/certificateService.js](backend/services/certificateService.js) (main flow)
   - Review [blockchain/contracts/CertificateVerification.sol](blockchain/contracts/CertificateVerification.sol) (smart contract)
   - Understand the architecture diagram in README.md

3. **Future Work (Objectives 2 & 3):**
   - AI skill extraction from certificates
   - Competency scoring
   - Recruiter candidate ranking
   - These are NOT implemented yet

---

## 📞 Getting Help

If you're stuck:

1. Check the error message carefully
2. Look at the relevant terminal logs
3. Review this guide's troubleshooting section
4. Check if all 4 terminals are running
5. Verify your Pinata API keys are correct

---

## 🎉 Success!

If all tests pass, you have successfully set up:

✅ A working blockchain-based certificate verification system  
✅ IPFS decentralized storage  
✅ Smart contract on Ethereum  
✅ Full-stack application (React + Express + Blockchain)  

**You're ready for demonstration and viva!**
