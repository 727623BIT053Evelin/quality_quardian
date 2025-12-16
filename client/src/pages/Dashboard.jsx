import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, ArrowUpRight, TrendingUp, BarChart2 } from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import UploadModal from '../components/dashboard/UploadModal';

export default function Dashboard() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Mock Data for Charts
    const trendData = [
        { name: 'Mon', score: 65 }, { name: 'Tue', score: 72 }, { name: 'Wed', score: 68 },
        { name: 'Thu', score: 85 }, { name: 'Fri', score: 82 }, { name: 'Sat', score: 91 }, { name: 'Sun', score: 88 },
    ];

    const issueData = [
        { name: 'Missing', value: 45 }, { name: 'Duplicate', value: 32 },
        { name: 'Format', value: 24 }, { name: 'Anomaly', value: 18 },
    ];

    const stats = [
        { label: 'Total Datasets', value: '12', change: '+2 this week', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg Quality Score', value: '87%', change: '+5% improvement', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Critical Errors', value: '34', change: '-12 fixed', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const recentUploads = [
        { name: 'b2b_leads_q4.csv', date: '2 hours ago', score: 92, status: 'Clean' },
        { name: 'customer_contacts_v2.xlsx', date: '5 hours ago', score: 64, status: 'Needs Attention' },
        { name: 'legacy_import_2023.csv', date: '1 day ago', score: 45, status: 'Critical' },
    ];

    return (
        <div>
            {/* Upload Modal */}
            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
                    <p className="text-slate-500">Overview of your data quality metrics.</p>
                </div>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 font-medium"
                >
                    <Upload className="w-5 h-5" />
                    Upload New Dataset
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> Quality Trend
                        </h3>
                        <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded font-medium">+12% vs last week</span>
                    </div>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1E293B', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Issues Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-amber-500" /> Issues Overview
                        </h3>
                    </div>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>


            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border md:border border-slate-200 md:rounded-xl overflow-hidden shadow-sm"
            >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Recent Uploads</h2>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        View All <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentUploads.map((file) => (
                        <div key={file.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{file.name}</h4>
                                    <p className="text-xs text-slate-500">{file.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900">{file.score}/100</div>
                                    <div className="text-xs text-slate-500">Quality Score</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${file.status === 'Clean' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    file.status === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {file.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
