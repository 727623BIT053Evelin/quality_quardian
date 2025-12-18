const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const { protect } = require('../middleware/authMiddleware');

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
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 1. Save metadata to MongoDB
        const newDataset = new Dataset({
            filename: req.file.originalname,
            originalPath: req.file.path,
            status: 'processing',
            user: req.user.id // Link to logged-in user
        });
        await newDataset.save();

        // 2. Call Flask Microservice
        const FLASK_URL = 'http://localhost:5000/process';

        try {
            const flaskResponse = await axios.post(FLASK_URL, {
                filepath: req.file.path
            });

            // 3. Update MongoDB with results
            newDataset.status = 'completed';
            newDataset.report = flaskResponse.data.report;
            newDataset.cleanedPath = flaskResponse.data.cleaned_path;

            // Save Previews
            newDataset.preview_original = flaskResponse.data.preview_original || [];
            newDataset.preview_cleaned = flaskResponse.data.preview_cleaned || [];
            newDataset.duplicates = flaskResponse.data.preview_duplicates || [];

            await newDataset.save();

            res.json({
                message: 'File processed successfully',
                dataset: newDataset
            });

        } catch (flaskError) {
            console.error('Flask Service Error:', flaskError.message);

            newDataset.status = 'failed';
            await newDataset.save();

            const backendError = flaskError.response?.data?.error || 'ML Service failed to process file';
            return res.status(500).json({ error: backendError, dataset: newDataset });
        }

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// GET /api/datasets - List user's datasets
router.get('/datasets', protect, async (req, res) => {
    try {
        const datasets = await Dataset.find({ user: req.user.id }).sort({ uploadDate: -1 });
        res.json(datasets);
    } catch (error) {
        console.error('Fetch Datasets Error:', error);
        res.status(500).json({ error: 'Failed to fetch datasets' });
    }
});

// GET /api/datasets/:id - Get specific dataset
router.get('/datasets/:id', protect, async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);

        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }

        // Verify ownership
        if (dataset.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }
        res.json(dataset);
    } catch (error) {
        console.error('Fetch Dataset Error:', error);
        res.status(500).json({ error: 'Failed to fetch dataset' });
    }
});

// DELETE /api/datasets/:id - Delete a dataset
router.delete('/datasets/:id', protect, async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }

        // Verify ownership
        if (dataset.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        // Optional: Delete physical files if they exist
        if (dataset.originalPath && fs.existsSync(dataset.originalPath)) {
            try { fs.unlinkSync(dataset.originalPath); } catch (e) { console.error('Failed to delete original file:', e); }
        }
        if (dataset.cleanedPath && fs.existsSync(dataset.cleanedPath)) {
            try { fs.unlinkSync(dataset.cleanedPath); } catch (e) { console.error('Failed to delete cleaned file:', e); }
        }

        await Dataset.findByIdAndDelete(req.params.id);
        res.json({ message: 'Dataset deleted successfully' });
    } catch (error) {
        console.error('Delete Dataset Error:', error);
        res.status(500).json({ error: 'Failed to delete dataset' });
    }
});

// GET /api/datasets/:id/download - Download dataset file
router.get('/datasets/:id/download', protect, async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }

        // Verify ownership
        if (dataset.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        // Determine which file to download (prefer cleaned, fallback to original)
        const type = req.query.type || 'cleaned'; // 'cleaned' or 'original'
        const filePath = type === 'cleaned' ? dataset.cleanedPath : dataset.originalPath;

        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        // Set filename for download
        let downloadName = type === 'cleaned' ? `cleaned-${dataset.filename}` : dataset.filename;

        // Force .csv extension for cleaned files
        if (type === 'cleaned') {
            const baseName = path.parse(downloadName).name;
            downloadName = `${baseName}.csv`;
        }

        res.download(filePath, downloadName);

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

module.exports = router;
