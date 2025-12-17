import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, Calendar, CheckCircle, AlertTriangle, Upload, XCircle, Trash2 } from 'lucide-react';
import UploadModal from '../components/dashboard/UploadModal';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function Datasets() {
    const navigate = useNavigate();
    const { searchQuery } = useOutletContext() || { searchQuery: '' };
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/datasets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            // Transform data if necessary to match UI structure
            // Backend returns array of Dataset objects
            const formattedDatasets = data.map(d => ({
                id: d._id,
                shortId: d._id.slice(-6),
                name: d.filename,
                date: new Date(d.uploadDate).toLocaleDateString() + ' ' + new Date(d.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: d.status.charAt(0).toUpperCase() + d.status.slice(1),
                score: d.report?.quality_score || 0,
                type: d.filename.split('.').pop().toUpperCase(),
                size: 'Unknown' // You might want to store/return file size from backend
            }));

            setDatasets(formattedDatasets);
        } catch (error) {
            console.error("Failed to fetch datasets:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDatasets = datasets.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.shortId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this dataset? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:4000/api/datasets/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Remove from state immediately
                setDatasets(prev => prev.filter(d => d.id !== id));
            } else {
                console.error("Failed to delete dataset");
                alert("Failed to delete dataset. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting dataset:", error);
            alert("Error deleting dataset.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <UploadModal isOpen={isUploadOpen} onClose={() => {
                setIsUploadOpen(false);
                fetchDatasets(); // Refresh list after upload
            }} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Datasets</h1>
                    <p className="text-slate-500">Manage your uploaded data files.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold shadow-md shadow-blue-600/20"
                    >
                        <Upload className="w-4 h-4" /> Upload New
                    </button>
                </div>
            </div>

            {/* Datasets List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-center md:text-left text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Filename</th>
                                <th className="px-6 py-4">Upload Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Quality Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {datasets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No datasets found. Upload one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredDatasets.map((dataset) => (
                                    <motion.tr
                                        key={dataset.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-mono text-slate-400 text-xs">{dataset.shortId}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-slate-900">{dataset.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{dataset.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${dataset.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                dataset.status === 'Failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {dataset.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                                                {dataset.status === 'Failed' && <XCircle className="w-3 h-3" />}
                                                {dataset.status === 'Processing' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                                                {dataset.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {dataset.status === 'Completed' ? (
                                                <span className={`font-bold ${dataset.score >= 90 ? 'text-emerald-600' :
                                                    dataset.score >= 70 ? 'text-amber-500' :
                                                        'text-red-500'
                                                    }`}>
                                                    {dataset.score}%
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/report/${dataset.id}`)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full"
                                                title="View Report"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dataset.id)}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
