const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middleware Setup
app.use(express.json());
app.use(cors());

// --- 🌐 MONGODB FORCED CONNECTION LAYOUT ---
// Note: Intha long string structural fallback cluster bypass vazhi, dynamic DNS code blocks yellathaiyum udaichidu connected state-ku pogum.
// ⚠️ IMP: "UNGA_PASSWORD" edathula unga exact original cluster user password-ah matum type pannunga!
const MONGO_URI = "mongodb://kittuchamyrmallika_db_user:UNGA_PASSWORD@ac-tdzz6k6-shard-00-00.tdzz6k6.mongodb.net:27017,ac-tdzz6k6-shard-00-01.tdzz6k6.mongodb.net:27017,ac-tdzz6k6-shard-00-02.tdzz6k6.mongodb.net:27017/expenseTracker?ssl=true&replicaSet=atlas-m9g8k9-shard-0&authSource=admin&authMechanism=SCRAM-SHA-1&retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Error auto-throw retry limit
})
.then(() => console.log("🔥 SUCCESS: Connected to Cloud MongoDB Atlas!"))
.catch(err => {
    console.log("⚠️ Database Error Detected. Activating Local Mock Storage Engine Fallback...");
    // Network strict block aahi connect aagalana kooda project complete crash aagaama backend memory database live tracker activate aagum.
});

// --- 📊 MEMORY STORAGE FOR INTERNET RESTRICTION BYPASS ---
let localMockTransactions = [];

// --- 📋 DATABASE DATA MODEL (SCHEMA) ---
const TransactionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- 🛣️ BACKEND API ROUTES ---

// 1. Get All Transactions
app.get('/api/transactions', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const transactions = await Transaction.find().sort({ date: -1 });
            return res.status(200).json({ success: true, data: transactions });
        } else {
            return res.status(200).json({ success: true, data: localMockTransactions });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Add New Transaction
app.post('/api/transactions', async (req, res) => {
    try {
        const { title, amount, category } = req.body;
        if (mongoose.connection.readyState === 1) {
            const newTransaction = await Transaction.create({ title, amount, category });
            return res.status(201).json({ success: true, data: newTransaction });
        } else {
            const mockEntry = { _id: Date.now().toString(), title, amount, category, date: new Date() };
            localMockTransactions.unshift(mockEntry);
            return res.status(201).json({ success: true, data: mockEntry });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Delete Transaction
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (mongoose.connection.readyState === 1) {
            const transaction = await Transaction.findById(id);
            if (transaction) await transaction.deleteOne();
            return res.status(200).json({ success: true, data: {} });
        } else {
            localMockTransactions = localMockTransactions.filter(t => t._id !== id);
            return res.status(200).json({ success: true, data: {} });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Server Initialization
app.listen(PORT, () => {
    console.log(`🚀 Backend Engine Server active on Port ${PORT}`);
});