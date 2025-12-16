require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/quality_guardian')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api', uploadRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Node API Server running on port ${PORT}`);
});
