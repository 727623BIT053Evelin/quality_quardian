const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// POST /api/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 1. Save metadata to MongoDB
        const newDataset = new Dataset({
            filename: req.file.originalname,
            originalPath: req.file.path,
            status: 'processing'
        });
        await newDataset.save();

        // 2. Call Flask Microservice
        // Assuming Flask is running on port 5000
        const FLASK_URL = 'http://localhost:5000/process';

        // We pass the absolute path to Flask (since it's on the same machine for now)
        // In a real distributed system, we'd stream the file or use S3.
        try {
            const flaskResponse = await axios.post(FLASK_URL, {
                filepath: req.file.path
            });

            // 3. Update MongoDB with results
            newDataset.status = 'completed';
            newDataset.report = flaskResponse.data.report;
            newDataset.cleanedPath = flaskResponse.data.cleaned_path;
            await newDataset.save();

            res.json({
                message: 'File processed successfully',
                dataset: newDataset
            });

        } catch (flaskError) {
            console.error('Flask Service Error:', flaskError.message);
            if (flaskError.response) {
                console.error('Flask Response Status:', flaskError.response.status);
                console.error('Flask Response Data:', flaskError.response.data);
            } else if (flaskError.request) {
                console.error('Flask Request Error: No response received');
            }

            newDataset.status = 'failed';
            await newDataset.save();
            // Return more specific error to frontend if available
            const backendError = flaskError.response?.data?.error || 'ML Service failed to process file';
            return res.status(500).json({ error: backendError });
        }

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

module.exports = router;
