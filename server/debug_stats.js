const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
    filename: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    report: {
        quality_score: Number,
        missing_values: Object,
        duplicates: Number,
        anomalies: Number,
        inconsistencies: Number
    }
});

const Dataset = mongoose.model('Dataset', DatasetSchema);

mongoose.connect('mongodb://127.0.0.1:27017/quality_guardian')
    .then(async () => {
        console.log('Connected to DB');
        const datasets = await Dataset.find();

        console.log(`Total Datasets found: ${datasets.length}`);

        let grandTotalIssues = 0;

        datasets.forEach((d, i) => {
            let total = 0;
            let missing = 0;
            if (d.report) {
                if (typeof d.report.missing_values === 'object') {
                    if (d.report.missing_values) {
                        missing = Object.values(d.report.missing_values).reduce((a, b) => a + Number(b), 0);
                    }
                } else if (typeof d.report.missing_values === 'number') {
                    missing = d.report.missing_values;
                }

                const duplicates = d.report.duplicates || 0;
                const anomalies = d.report.anomalies || 0;
                const inconsistencies = d.report.inconsistencies || 0;

                total = missing + duplicates + anomalies + inconsistencies;
                grandTotalIssues += total;

                console.log(`[${i}] ${d.filename} (ID: ${d._id}, User: ${d.user})`);
                console.log(`    Missing: ${missing}`);
                console.log(`    Duplicates: ${duplicates}`);
                console.log(`    Anomalies: ${anomalies}`);
                console.log(`    Inconsistencies: ${inconsistencies}`);
                console.log(`    --> TOTAL: ${total}`);
            } else {
                console.log(`[${i}] ${d.filename} (NO REPORT)`);
            }
        });

        console.log(`--------------------------------`);
        console.log(`Grand Total Issues: ${grandTotalIssues}`);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
