const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalPath: { type: String, required: true },
    cleanedPath: { type: String },
    uploadDate: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['uploaded', 'processing', 'completed', 'failed'], default: 'uploaded' },
    report: {
        quality_score: Number,
        missing_values: Object,
        duplicates: Number,
        anomalies: Number,
        inconsistencies: Number,
        anomalies: Number,
        inconsistencies: Number,
        formatting_issues: Object,
        final_rows: Number
    },
    preview_original: { type: Array, default: [] },
    preview_cleaned: { type: Array, default: [] },
    duplicates: { type: Array, default: [] }
});

module.exports = mongoose.model('Dataset', DatasetSchema);
