import React from 'react';
import { motion } from 'framer-motion';
import {
    Download, FileText, CheckCircle, AlertTriangle, XCircle, Zap,
    ArrowRight, ShieldCheck, BarChart2, Search
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function DatasetReport() {

    // Mock Data mimicking the user's screenshots
    const rawData = [
        { id: 0, companyId: 1, name: 'TechNova', industry: 'IT', revenue: 1200000, employees: 50, country: 'USA', email: 'info@technova.com' },
        { id: 1, companyId: 2, name: 'GreenWorks', industry: 'Manufacturing', revenue: 800000, employees: 35, country: 'USA', email: 'contact@greenworks.com' },
        { id: 2, companyId: 3, name: 'AlphaCorp', industry: 'IT', revenue: 'None', employees: 45, country: 'UK', email: 'alpha@alphacorp.co.uk' },
        { id: 3, companyId: 4, name: 'BlueSolutions', industry: 'Consulting', revenue: 500000, employees: 'None', country: 'Germany', email: 'info@bluesolutions.de' },
        { id: 4, companyId: 5, name: 'GreenWorks', industry: 'Manufacturing', revenue: 800000, employees: 35, country: 'USA', email: 'contact@greenworks.com' },
    ];

    const missingValuesData = [
        { column: 'Revenue', count: 2 },
        { column: 'EmployeeCount', count: 2 },
        { column: 'Country', count: 1 },
        { column: 'ContactEmail', count: 1 },
    ];

    const anomalyData = [
        { id: 6, companyId: '?', name: 'GlobalSoft', industry: 'IT', revenue: 1500000, employees: 70, country: 'USA', email: 'contact@globalsoft.com', label: -1 },
    ];

    const qualityScores = {
        missing: 100.0,
        duplicate: 100.0,
        anomaly: 91.67,
        overall: 97.5
    };

    const errorDistribution = [
        { name: 'Missing Values', value: 35, color: '#EF4444' }, // red-500
        { name: 'Duplicates', value: 25, color: '#F59E0B' },    // amber-500
        { name: 'Formatting', value: 20, color: '#F97316' },    // orange-500
        { name: 'Anomalies', value: 10, color: '#F43F5E' },    // rose-500
    ];

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">

            {/* Top Header */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Processing Complete
                                </div>
                                <span className="text-slate-400 text-sm">Report ID: #GD-2024-8821</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">Quality Assessment Report</h1>
                            <p className="text-slate-500">Analysis for <span className="font-semibold text-slate-700">b2b_leads_q4.csv</span></p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-sm font-semibold text-slate-500 uppercase">Overall Quality</span>
                                <span className="text-4xl font-extrabold text-blue-600">{qualityScores.overall}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

                {/* ACTION SECTION: Download & Charts (Requested Order) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left: Download & Summary */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Download className="w-6 h-6 text-blue-600" /> Download Cleaned Data
                        </h2>
                        <p className="text-slate-500 mb-6">
                            Your dataset has been processed. We've handled missing values, removed duplicates, and flagged anomalies.
                            Download the corrected CSV file below.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" /> Download Corrected CSV
                            </button>
                            <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <FileText className="w-5 h-5" /> View Raw Data
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <ScoreCard label="Missing Score" value={qualityScores.missing + '%'} />
                            <ScoreCard label="Duplicate Score" value={qualityScores.duplicate + '%'} />
                            <ScoreCard label="Anomaly Score" value={qualityScores.anomaly + '%'} />
                            <ScoreCard label="Overall" value={qualityScores.overall + '%'} highlight />
                        </div>
                    </div>

                    {/* Right: Pie Chart (Below/Next to Download as requested "below that the pie chart") */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 h-full min-h-[400px]">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Issue Distribution</h3>
                        <p className="text-slate-500 text-sm mb-6">Breakdown of quality issues detected in the dataset.</p>
                        <div className="h-64 w-full">
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
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1E293B', fontWeight: 600 }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* DETAILED TABLES Section */}

                {/* Raw Dataset Preview */}
                <Section title="Raw Dataset Preview" icon={FileText} color="text-slate-500">
                    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-3"></th>
                                    <th className="px-6 py-3">CompanyID</th>
                                    <th className="px-6 py-3">CompanyName</th>
                                    <th className="px-6 py-3">Industry</th>
                                    <th className="px-6 py-3">Revenue</th>
                                    <th className="px-6 py-3">EmployeeCount</th>
                                    <th className="px-6 py-3">Country</th>
                                    <th className="px-6 py-3">ContactEmail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {rawData.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-xs text-slate-400 font-mono">{row.id}</td>
                                        <td className="px-6 py-3 font-medium text-slate-900">{row.companyId}</td>
                                        <td className="px-6 py-3">{row.name}</td>
                                        <td className="px-6 py-3">{row.industry}</td>
                                        <td className={`px-6 py-3 ${row.revenue === 'None' ? 'text-red-500 font-bold bg-red-50/50 rounded' : ''}`}>{row.revenue}</td>
                                        <td className={`px-6 py-3 ${row.employees === 'None' ? 'text-red-500 font-bold bg-red-50/50 rounded' : ''}`}>{row.employees}</td>
                                        <td className="px-6 py-3">{row.country}</td>
                                        <td className="px-6 py-3 text-blue-600 hover:underline cursor-pointer">{row.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* Missing Values Analysis */}
                <Section title="Missing Values Analysis" icon={XCircle} color="text-red-500">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-500 uppercase flex justify-between">
                            <span>Missing Values</span>
                            <span>Count</span>
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

                {/* Duplicate Records */}
                <Section title="Duplicate Records" icon={FileText} color="text-amber-500">
                    <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">No duplicate rows found!</span>
                    </div>
                </Section>

                {/* Anomaly Detection */}
                <Section title="Anomaly Detection" icon={AlertTriangle} color="text-rose-500">
                    <div className="mb-4 text-sm font-medium text-slate-600">Anomalies detected: <span className="font-bold text-slate-900">1</span></div>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-3"></th>
                                    <th className="px-6 py-3">CompanyID</th>
                                    <th className="px-6 py-3">CompanyName</th>
                                    <th className="px-6 py-3">Industry</th>
                                    <th className="px-6 py-3">Revenue</th>
                                    <th className="px-6 py-3">EmployeeCount</th>
                                    <th className="px-6 py-3">Country</th>
                                    <th className="px-6 py-3">ContactEmail</th>
                                    <th className="px-6 py-3 text-rose-500 bg-rose-50">anomaly_label</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {anomalyData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-xs text-slate-400 font-mono">{row.id}</td>
                                        <td className="px-6 py-3 font-medium text-slate-900 flex items-center gap-2">
                                            <span className="text-amber-500 font-bold">?</span> {row.companyId}
                                        </td>
                                        <td className="px-6 py-3">{row.name}</td>
                                        <td className="px-6 py-3">{row.industry}</td>
                                        <td className="px-6 py-3">{row.revenue}</td>
                                        <td className="px-6 py-3">{row.employees}</td>
                                        <td className="px-6 py-3">{row.country}</td>
                                        <td className="px-6 py-3">{row.email}</td>
                                        <td className="px-6 py-3 font-bold text-rose-600 bg-rose-50/30">{row.label}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
