# 🚀 START THE APPLICATION

## ⚠️ IMPORTANT: Node.js Version Warning
You're using Node.js v16.13.1, but this project requires Node.js v18+.

**Download Node.js v18 or v20:** https://nodejs.org

(The app may still work with warnings, but upgrade recommended)

---

## 📋 STEP-BY-STEP STARTUP

### Step 1: Start Blockchain Network
**Terminal 1:**
```bash
cd blockchain
npx hardhat node
```
✅ **Wait for:** "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"
⚠️ **Keep this terminal running!** Do NOT close it.

---

### Step 2: Compile & Deploy Smart Contract
**Terminal 2:**
```bash
cd blockchain
npx hardhat compile
npm run deploy
```
✅ **Wait for:** "✅ Contract deployed successfully! Contract Address: 0x..."
📝 **Note:** The deploy script auto-updates `backend/.env` with the contract address

---

### Step 3: Start Backend Server
**Terminal 3:**
```bash
cd backend
npm run dev
```
✅ **Wait for:** "🚀 BlockIntel Backend Server Started" + "✅ Database indexes created"
⚠️ **Keep this terminal running!**

---

### Step 4: Start Frontend
**Terminal 4:**
```bash
cd frontend
npm run dev
```
✅ **Wait for:** "Local: http://localhost:5173/"
⚠️ **Keep this terminal running!**

---

## 🌐 Open the Application

**Browser:** http://localhost:5173

---

## ✅ QUICK TEST

1. **Register** a new account
2. **Upload** a certificate (any PDF/image)
3. **Verify** the same file → ✅ VERIFIED
4. **Verify** a different file → ❌ NOT VERIFIED

---

## 🛑 If You Get Errors

### "Cannot find module 'dotenv'" in blockchain
```bash
cd blockchain
npm install
```

### "Contract address not configured" in backend
```bash
cd blockchain
npm run deploy
```

### Backend won't start
Check if port 5000 is in use:
```bash
netstat -ano | findstr :5000
```

### "Pinata upload failed"
Check `backend/.env` - your Pinata keys are:
- PINATA_API_KEY=88e1a9486f54f7e45568
- PINATA_SECRET_API_KEY=6bbe4069fbd151efbf128918f3335bf4a1930e42982a94ffe79842d8053738b3

---

## 🔄 Restart After Computer Restart

If you restart your computer, you need to:
1. Restart blockchain (Terminal 1)
2. **Re-deploy contract** (Terminal 2) - Local blockchain resets!
3. Restart backend (Terminal 3)
4. Restart frontend (Terminal 4)

---

## 📞 Current Status

✅ All dependencies installed
✅ .env file configured with Pinata keys
✅ Ready to start!

**Just follow the 4 steps above in 4 separate terminals.**
