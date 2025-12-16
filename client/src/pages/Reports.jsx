import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Reports() {
    const reports = [
        { id: 'GD-2024-8821', name: 'b2b_leads_q4.csv', date: 'Oct 24, 2024', status: 'Completed', score: 98, type: 'CSV' },
        { id: 'GD-2024-8710', name: 'customer_contacts_v2.xlsx', date: 'Oct 22, 2024', status: 'Completed', score: 85, type: 'Excel' },
        { id: 'GD-2024-8655', name: 'legacy_import_2023.csv', date: 'Oct 20, 2024', status: 'Failed', score: 0, type: 'CSV' },
        { id: 'GD-2024-8501', name: 'sales_data_raw.csv', date: 'Oct 18, 2024', status: 'Completed', score: 92, type: 'CSV' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reports</h1>
                    <p className="text-slate-500">History of all processed datasets and their quality assessments.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                        <Calendar className="w-4 h-4" /> Date Range
                    </button>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-center md:text-left text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Report ID</th>
                                <th className="px-6 py-4">Dataset Name</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Quality Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((report) => (
                                <motion.tr
                                    key={report.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">{report.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-slate-900">{report.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{report.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${report.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                report.status === 'Failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {report.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                                            {report.status === 'Failed' && <AlertTriangle className="w-3 h-3" />}
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.status === 'Completed' ? (
                                            <span className={`font-bold ${report.score >= 90 ? 'text-emerald-600' :
                                                    report.score >= 70 ? 'text-amber-500' :
                                                        'text-red-500'
                                                }`}>
                                                {report.score}%
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
