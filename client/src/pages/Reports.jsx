import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, BarChart2, AlertCircle, CheckCircle, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function Reports() {
    const navigate = useNavigate();
    const { searchQuery } = useOutletContext() || { searchQuery: '' }; // Get search query from layout
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:4000/api/datasets', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                const formattedReports = data.map(d => ({
                    id: d._id.slice(-6),
                    fullId: d._id,
                    name: d.filename,
                    date: new Date(d.uploadDate).toLocaleDateString(),
                    status: d.status.charAt(0).toUpperCase() + d.status.slice(1),
                    score: d.report?.quality_score || 0,
                    issues: {
                        missing: typeof d.report?.missing_values === 'number' ? d.report.missing_values : Object.values(d.report?.missing_values || {}).reduce((a, b) => a + b, 0),
                        duplicates: d.report?.duplicates || 0,
                        formatting: d.report?.inconsistencies || 0
                    }
                }));
                setReports(formattedReports);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    // Filter reports based on search query
    const filteredReports = reports.filter(report =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculated Stats
    const totalReports = filteredReports.length;
    const scoredReports = filteredReports.filter(r => r.score > 0);
    const avgScore = scoredReports.length > 0 ? (scoredReports.reduce((acc, r) => acc + r.score, 0) / scoredReports.length).toFixed(1) : 0;
    const criticalReports = filteredReports.filter(r => r.score < 60).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Analysis Reports</h1>
                    <p className="text-slate-500">Deep dive into your data quality insights and historical trends.</p>
                </div>
                <div className="flex gap-4 justify-end items-start">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SummaryCard label="Total Reports" value={totalReports} icon={FileText} color="blue" />
                <SummaryCard label="Avg Quality Score" value={`${avgScore}%`} icon={BarChart2} color="emerald" />
                <SummaryCard label="Critical Issues" value={criticalReports} icon={AlertCircle} color="amber" />
            </div>

            {/* Content Grid */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col group cursor-pointer"
                            onClick={() => navigate(`/dashboard/report/${report.fullId}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${report.score >= 80 ? 'bg-green-50 text-green-700 border-green-100' :
                                    report.score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                    {report.score}% Score
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-900 mb-1 truncate" title={report.name}>{report.name}</h3>
                            <p className="text-xs text-slate-500 mb-4">Processed on {report.date}</p>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <MiniStat label="Missing" value={report.issues.missing} />
                                <MiniStat label="Dupes" value={report.issues.duplicates} />
                                <MiniStat label="Format" value={report.issues.formatting} />
                            </div>

                            <button className="mt-auto w-full py-2 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm transition-colors group-hover:text-blue-600">
                                View Analysis <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* List View Fallback */
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center md:text-left text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Report Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{report.name}</td>
                                        <td className="px-6 py-4">{report.date}</td>
                                        <td className="px-6 py-4 font-bold text-blue-600">{report.score}%</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => navigate(`/dashboard/report/${report.fullId}`)} className="text-blue-600 hover:underline">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ label, value, icon: Icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600'
    };
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="bg-slate-50 p-2 rounded text-center">
            <div className="text-lg font-bold text-slate-700">{value}</div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">{label}</div>
        </div>
    );
}
