import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, AlertTriangle, XCircle, Search, Zap, CheckCircle } from 'lucide-react';

export default function DatasetScanning() {
    const navigate = useNavigate();
    const [scannedRows, setScannedRows] = useState(0);
    const [totalRows] = useState(12450); // Simulated total
    const [currentAction, setCurrentAction] = useState('Initializing scan...');

    // Buckets for issues
    const [missingValues, setMissingValues] = useState([]);
    const [duplicates, setDuplicates] = useState([]);
    const [formattingErrors, setFormattingErrors] = useState([]);
    const [anomalies, setAnomalies] = useState([]);

    useEffect(() => {
        // Simulation Timer
        const timer = setInterval(() => {
            setScannedRows(prev => {
                const next = prev + Math.floor(Math.random() * 150) + 50;
                return next > totalRows ? totalRows : next;
            });

            // Randomly found issues simulation
            const rand = Math.random();
            if (rand < 0.1) {
                setMissingValues(prev => [...prev.slice(-5), { id: Date.now(), text: 'Row ' + Math.floor(Math.random() * 10000) }]);
                setCurrentAction('Detecting missing values...');
            } else if (rand < 0.2) {
                setDuplicates(prev => [...prev.slice(-5), { id: Date.now(), text: 'Duplicate ID #' + Math.floor(Math.random() * 5000) }]);
                setCurrentAction('Identifying duplicates...');
            } else if (rand < 0.25) {
                setFormattingErrors(prev => [...prev.slice(-5), { id: Date.now(), text: 'Invalid Email Format' }]);
                setCurrentAction('Checking data formats...');
            } else if (rand < 0.3) {
                setAnomalies(prev => [...prev.slice(-5), { id: Date.now(), text: 'Outlier Detected: $999k' }]);
                setCurrentAction('Analyzing statistical anomalies...');
            }

        }, 100);

        // End simulation
        if (scannedRows >= totalRows) {
            clearInterval(timer);
            setTimeout(() => {
                navigate('/report');
            }, 1500);
        }

        return () => clearInterval(timer);
    }, [scannedRows, totalRows, navigate]);

    const progressPercentage = (scannedRows / totalRows) * 100;

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">

            {/* Header */}
            <div className="text-center mb-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600"
                >
                    <Search className="w-10 h-10" />
                </motion.div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Scanning Dataset...</h1>
                <p className="text-slate-500 text-lg">{currentAction}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-12">
                <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
                    <span>Processed: {scannedRows.toLocaleString()} rows</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <motion.div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Live Buckets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">

                {/* Missing Values Bucket */}
                <BucketCard
                    title="Missing Values"
                    icon={XCircle}
                    color="text-red-500"
                    bg="bg-red-50"
                    borderColor="border-red-100"
                    items={missingValues}
                />

                {/* Duplicates Bucket */}
                <BucketCard
                    title="Duplicates"
                    icon={FileText}
                    color="text-amber-500"
                    bg="bg-amber-50"
                    borderColor="border-amber-100"
                    items={duplicates}
                />

                {/* Inconsistencies Bucket */}
                <BucketCard
                    title="Inconsistencies"
                    icon={AlertTriangle}
                    color="text-orange-500"
                    bg="bg-orange-50"
                    borderColor="border-orange-100"
                    items={formattingErrors}
                />

                {/* Anomalies Bucket (Requested) */}
                <BucketCard
                    title="Anomalies"
                    icon={Zap}
                    color="text-purple-500"
                    bg="bg-purple-50"
                    borderColor="border-purple-100"
                    items={anomalies}
                />

            </div>
        </div>
    );
}

function BucketCard({ title, icon: Icon, color, bg, borderColor, items }) {
    return (
        <div className={`bg-white rounded-xl border ${borderColor} shadow-sm overflow-hidden flex flex-col h-64`}>
            <div className={`p-4 ${bg} border-b ${borderColor} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <h3 className={`font-bold ${color}`}>{title}</h3>
                </div>
                <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded text-slate-600">
                    Live
                </span>
            </div>
            <div className="p-4 flex-1 overflow-hidden relative">
                <AnimatePresence>
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -20, x: -10 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-2 text-sm text-slate-600 flex items-center gap-2"
                        >
                            <div className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')}`} />
                            {item.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {/* Overlay gradient to fade out old items if simulated list gets long visually */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
            </div>
        </div>
    );
}
