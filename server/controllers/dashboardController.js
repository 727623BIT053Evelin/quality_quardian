const Dataset = require('../models/Dataset');

exports.getDashboardStats = async (req, res) => {
    try {
        const datasets = await Dataset.find({ user: req.user.id }).sort({ uploadDate: -1 });

        // 1. Basic Stats
        const totalDatasets = datasets.length;

        // Calculate Average Quality Score
        const scoredDatasets = datasets.filter(d => d.report && d.report.quality_score);
        const avgScore = scoredDatasets.length > 0
            ? (scoredDatasets.reduce((acc, d) => acc + d.report.quality_score, 0) / scoredDatasets.length).toFixed(1)
            : 0;

        // Calculate Critical Issues (sum of all issues found)
        let totalIssues = 0;
        let missingCount = 0;
        let duplicateCount = 0;
        let anomalyCount = 0;
        let formatCount = 0; // Inconsistencies

        datasets.forEach(d => {
            if (d.report) {
                // Missing Values
                if (d.report.missing_values) {
                    // Check if it's an object (col: count) or number
                    if (typeof d.report.missing_values === 'object') {
                        const mCount = Object.values(d.report.missing_values).reduce((a, b) => a + b, 0);
                        missingCount += mCount;
                        totalIssues += mCount;
                    } else if (typeof d.report.missing_values === 'number') {
                        missingCount += d.report.missing_values;
                        totalIssues += d.report.missing_values;
                    }
                }

                // Duplicates
                if (d.report.duplicates) {
                    duplicateCount += d.report.duplicates;
                    totalIssues += d.report.duplicates;
                }

                // Anomalies (Deprecated/Removed, but check for backward compat if needed)
                // We are ignoring Anomalies as per request to focus on Formatting

                // Inconsistencies (Invalid Formatting)
                if (d.report.inconsistencies) {
                    formatCount += d.report.inconsistencies;
                    totalIssues += d.report.inconsistencies;
                }
            }
        });

        // 2. Trend Data (Last 7 Days)
        // Group by day
        const last7Days = new Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const trendMap = {};
        last7Days.forEach(date => trendMap[date] = { count: 0, totalScore: 0 });

        scoredDatasets.forEach(d => {
            const dateStr = d.uploadDate.toISOString().split('T')[0];
            if (trendMap[dateStr]) {
                trendMap[dateStr].totalScore += d.report.quality_score;
                trendMap[dateStr].count += 1;
            }
        });

        const trendData = last7Days.map(date => {
            const dayData = trendMap[date];
            return {
                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                score: dayData.count > 0 ? Math.round(dayData.totalScore / dayData.count) : 0
            };
        });

        // 3. Issues Overview
        const issueData = [
            { name: 'Missing', value: missingCount },
            { name: 'Duplicate', value: duplicateCount },
            { name: 'Format', value: formatCount }
        ];

        // 4. Recent Activity
        const recentUploads = datasets.slice(0, 5).map(d => {
            let status = 'Clean';
            let score = d.report?.quality_score || 0;

            if (score < 50) status = 'Critical';
            else if (score < 80) status = 'Needs Attention';

            return {
                id: d._id,
                name: d.filename,
                date: new Date(d.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                score: Math.round(score),
                status: status
            };
        });

        res.json({
            stats: {
                totalDatasets,
                avgScore: `${avgScore}%`,
                criticalErrors: totalIssues
            },
            trendData,
            issueData,
            recentUploads
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
