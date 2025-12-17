import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Download, FileText, CheckCircle, AlertTriangle, XCircle, Zap,
    ArrowRight, ShieldCheck, BarChart2, Search, Loader
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function DatasetReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dataset, setDataset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('cleaned');

    useEffect(() => {
        const fetchDataset = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:4000/api/datasets/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Dataset not found');
                const data = await response.json();
                setDataset(data);
            } catch (err) {
                console.error("Error fetching dataset:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDataset();
    }, [id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin w-8 h-8 text-blue-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-600 font-bold">Error: {error}</div>;
    if (!dataset) return null;

    // --- Transform Data for UI ---
    const report = dataset.report || {};

    // --- Score Calculation Logic ---
    const rowCount = report.initial_rows || 100; // Fallback to 100 to avoid division by zero
    // Estimate column count from preview or missing values keys (fallback to 10)
    const colCount = dataset.preview_original && dataset.preview_original.length > 0
        ? Object.keys(dataset.preview_original[0]).length
        : (report.missing_values ? Object.keys(report.missing_values).length : 10);
    const totalCells = rowCount * colCount;

    // 1. Missing Values Score (% of filled cells)
    let totalMissing = 0;
    if (report.missing_values) {
        if (typeof report.missing_values === 'object') {
            totalMissing = Object.values(report.missing_values).reduce((a, b) => a + b, 0);
        } else if (typeof report.missing_values === 'number') {
            totalMissing = report.missing_values;
        }
    }
    const missingScore = Math.max(0, ((totalCells - totalMissing) / totalCells) * 100);

    // 2. Duplicate Score (% of unique rows)
    const duplicateCount = report.duplicates || 0;
    const duplicateScore = Math.max(0, ((rowCount - duplicateCount) / rowCount) * 100);

    // 3. Formatting Score (Invalid Formats)
    const formattingCount = report.inconsistencies || 0;
    const formattingScore = Math.max(0, ((totalCells - formattingCount) / totalCells) * 100);

    // 4. Overall Score
    // Calculate as average of the three dimension scores for better representativeness
    const overallScore = (missingScore + duplicateScore + formattingScore) / 3;

    const qualityScores = {
        missing: missingScore.toFixed(1),
        duplicate: duplicateScore.toFixed(1),
        formatting: formattingScore.toFixed(1),
        overall: overallScore.toFixed(1)
    };

    // Error Distribution for Pie Chart
    // Normalize missing values count
    const missingCount = totalMissing;


    const errorDistribution = [
        { name: 'Missing Values', value: missingCount, color: '#EF4444' },
        { name: 'Duplicates', value: report.duplicates || 0, color: '#F59E0B' },
        { name: 'Formatting', value: report.inconsistencies || 0, color: '#F97316' },
    ].filter(item => item.value > 0); // Only show existing errors

    // Missing Values Table Data
    const missingValuesData = report.missing_values && typeof report.missing_values === 'object'
        ? Object.entries(report.missing_values).map(([col, count]) => ({ column: col, count }))
        : [];


    // --- Actions ---
    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:4000/api/datasets/${dataset._id}/download?type=cleaned`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            // Trigger file download from blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cleaned-${dataset.filename}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download file.");
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
            {/* Top Header */}
            {/* ... header code ... */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

                {/* ACTION SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left: Download & Summary */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Download className="w-6 h-6 text-blue-600" /> Download Cleaned Data
                        </h2>
                        <p className="text-slate-500 mb-6">
                            Your dataset has been processed. We've handled {missingCount} missing values, {report.duplicates || 0} duplicates, and fixed {report.inconsistencies || 0} formatting issues.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={handleDownload}
                                disabled={!dataset.cleanedPath}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-5 h-5" />
                                {dataset.cleanedPath ? "Download Corrected CSV" : "Processing..."}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <ScoreCard label="Missing Score" value={qualityScores.missing + '%'} />
                            <ScoreCard label="Duplicate Score" value={qualityScores.duplicate + '%'} />
                            <ScoreCard label="Formatting Score" value={qualityScores.formatting + '%'} />
                            <ScoreCard label="Overall" value={qualityScores.overall + '%'} highlight />
                        </div>
                    </div>

                    {/* Right: Pie Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 h-full min-h-[400px]">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Issue Distribution</h3>
                        <p className="text-slate-500 text-sm mb-6">Breakdown of quality issues detected.</p>
                        <div className="h-64 w-full">
                            {errorDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={errorDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {errorDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="w-12 h-12 text-green-200 mb-2" />
                                        <span>No issues found! Perfect score.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Missing Values Analysis */}
                {missingValuesData.length > 0 && (
                    <Section title="Missing Values Analysis" icon={XCircle} color="text-red-500">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-500 uppercase flex justify-between">
                                <span>Column Name</span>
                                <span>Missing Count</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {missingValuesData.map((item, index) => (
                                    <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                        <span className="font-medium text-slate-700">{item.column}</span>
                                        <span className="font-bold text-slate-900">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>
                )}

                {/* Duplicate Records */}
                <Section title="Duplicate Records" icon={FileText} color="text-amber-500">
                    {report.duplicates > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-lg flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">Found {report.duplicates} duplicate rows. They have been removed in the cleaned file.</span>
                            </div>

                            {/* Preview List */}
                            {dataset.duplicates && dataset.duplicates.length > 0 && (
                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mt-4">
                                    <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-500 uppercase flex justify-between items-center">
                                        <span>Deleted Duplicates Preview (First 5)</span>
                                        {dataset.duplicates.length > 5 && (
                                            <button
                                                onClick={() => navigate(`/dashboard/report/${id}/duplicates`)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 normal-case font-bold"
                                            >
                                                View all {dataset.duplicates.length} duplicates <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-slate-600">
                                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                                <tr>
                                                    {Object.keys(dataset.duplicates[0]).map((header) => (
                                                        <th key={header} className="px-6 py-3 whitespace-nowrap">{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dataset.duplicates.slice(0, 5).map((row, index) => (
                                                    <tr key={index} className="bg-white border-b hover:bg-slate-50">
                                                        {Object.values(row).map((cell, i) => (
                                                            <td key={i} className="px-6 py-4 whitespace-nowrap">
                                                                {cell !== null && cell !== undefined ? String(cell) : '-'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">No duplicate rows found!</span>
                        </div>
                    )}
                </Section>

                {/* Invalid Formats Breakdown */}
                <Section title="Invalid Formatting" icon={AlertTriangle} color="text-orange-500">
                    {report.inconsistencies > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-6 py-4 rounded-lg flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">Found {report.inconsistencies} cells with invalid formatting (e.g., Email, Phone, Date).</span>
                            </div>

                            {/* Column Breakdown for Formatting */}
                            {report.formatting_issues && Object.keys(report.formatting_issues).length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    {Object.entries(report.formatting_issues).map(([col, count]) => (
                                        <div key={col} className="bg-white border border-slate-200 p-4 rounded-lg flex justify-between items-center shadow-sm">
                                            <span className="font-medium text-slate-700">{col}</span>
                                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{count} Invalid</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">All columns following standard formats!</span>
                        </div>
                    )}
                </Section>

                {/* Data Preview Section */}
                <Section title="Data Preview" icon={BarChart2} color="text-blue-600">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab('cleaned')}
                                className={`px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'cleaned' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Cleaned Data (Preview)
                            </button>
                            <button
                                onClick={() => setActiveTab('original')}
                                className={`px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'original' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Original Data (Preview)
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            {dataset[activeTab === 'original' ? 'preview_original' : 'preview_cleaned'] && dataset[activeTab === 'original' ? 'preview_original' : 'preview_cleaned'].length > 0 ? (
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            {Object.keys(dataset[activeTab === 'original' ? 'preview_original' : 'preview_cleaned'][0]).map((header) => (
                                                <th key={header} scope="col" className="px-6 py-3 whitespace-nowrap">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataset[activeTab === 'original' ? 'preview_original' : 'preview_cleaned'].map((row, index) => (
                                            <tr key={index} className="bg-white border-b hover:bg-slate-50">
                                                {Object.values(row).map((cell, i) => (
                                                    <td key={i} className="px-6 py-4 whitespace-nowrap">
                                                        {cell !== null && cell !== undefined ? String(cell) : '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    No preview data available.
                                </div>
                            )}
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({ title, icon: Icon, color, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Icon className={`w-6 h-6 ${color}`} />
                {title}
            </h2>
            {children}
        </motion.div>
    );
}

function ScoreCard({ label, value, highlight }) {
    return (
        <div className={`p-4 rounded-lg border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</div>
            <div className={`font-bold ${highlight ? 'text-2xl text-blue-600' : 'text-xl text-slate-900'}`}>
                {value}
            </div>
        </div>
    );
}
