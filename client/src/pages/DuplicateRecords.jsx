import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { ArrowLeft, Loader, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DuplicateRecords() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dataset, setDataset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const duplicates = dataset.duplicates || [];

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Duplicate Records</h1>
                        <p className="text-slate-500 mt-1">Found {duplicates.length} duplicate rows that were removed.</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {duplicates.length > 0 ? (
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        {Object.keys(duplicates[0]).map((header) => (
                                            <th key={header} scope="col" className="px-6 py-3 whitespace-nowrap">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {duplicates.map((row, index) => (
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
                            <div className="p-12 text-center text-slate-400">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                No duplicate records found in this dataset.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
