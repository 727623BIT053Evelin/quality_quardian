const mongoose = require('mongoose');

const Dataset = mongoose.model('Dataset', new mongoose.Schema({}, { strict: false }));

mongoose.connect('mongodb://127.0.0.1:27017/quality_guardian')
    .then(async () => {
        console.log('Connected to DB');

        // IDs identified from the previous debug run as having 5315 issues each
        // These were processed before the empty row fix.
        const badIds = [
            '6942e08d077cdc18594e7e37',
            '6942e0af077cdc18594e7e3e',
            '6942e247077cdc18594e7e7d'
        ];

        const result = await Dataset.deleteMany({ _id: { $in: badIds } });
        console.log(`Deleted ${result.deletedCount} bad datasets.`);

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
