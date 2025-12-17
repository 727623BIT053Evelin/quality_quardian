const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Import path
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploads folder

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/quality_guardian')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api', uploadRoutes); // Mount upload routes (handles /upload and /datasets)
app.use('/api/auth', userRoutes); // Mount user routes
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard routes

app.listen(PORT, () => {
    console.log(`🚀 Node API Server running on port ${PORT}`);
    console.log(`👉 API Usage: http://localhost:${PORT}/api`);
});
