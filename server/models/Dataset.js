const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalPath: { type: String, required: true },
    cleanedPath: { type: String },
    uploadDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['uploaded', 'processing', 'completed', 'failed'], default: 'uploaded' },
    report: {
        quality_score: Number,
        missing_values: Object,
        duplicates: Number,
        anomalies: Number,
        inconsistencies: Number,
        final_rows: Number
    }
});

module.exports = mongoose.model('Dataset', DatasetSchema);
