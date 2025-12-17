import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function UploadModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
    const [progress, setProgress] = useState(0);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file) => {
        // Basic validation (e.g., check type or size)
        // For now, accept anything, but maybe limit to common data formats
        setFile(file);
        setUploadStatus('idle');
        setProgress(0);
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    const uploadFile = async () => {
        if (!file) return;

        setUploadStatus('uploading');

        // Prepare FormData
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Call Node.js Backend
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            // Success
            // Success
            setUploadStatus('success');
            console.log('Upload Success:', data);

            setTimeout(() => {
                onClose();
                setFile(null);
                setUploadStatus('idle');
                setProgress(0);
                // Navigate to scanning page with the uploaded dataset info
                navigate('/dashboard/scanning', { state: { dataset: data.dataset } });
            }, 1000);

        } catch (error) {
            console.error(error);
            setUploadStatus('error'); // You might want to handle error state visually
        }
    };

    const removeFile = () => {
        setFile(null);
        setUploadStatus('idle');
        setProgress(0);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-800">Upload Dataset</h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {uploadStatus === 'success' ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Upload Complete!</h4>
                                        <p className="text-slate-500">Your dataset has been successfully processed.</p>
                                    </div>
                                ) : (
                                    <>
                                        {!file ? (
                                            <div
                                                className={cn(
                                                    "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-50/30",
                                                    dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                                                )}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                                onClick={onButtonClick}
                                            >
                                                <input
                                                    ref={inputRef}
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleChange}
                                                    accept=".csv,.xlsx,.json"
                                                />
                                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                                    <Upload className="w-7 h-7" />
                                                </div>
                                                <p className="text-lg font-semibold text-slate-700 mb-1">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    Supported formats: CSV, Excel, JSON
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                                                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                                        </div>
                                                    </div>
                                                    {uploadStatus !== 'uploading' && (
                                                        <button
                                                            onClick={removeFile}
                                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Progress Bar */}
                                                {(uploadStatus === 'uploading' || file) && (
                                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                        <motion.div
                                                            className="bg-blue-600 h-full rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 0.2 }}
                                                        />
                                                    </div>
                                                )}

                                                {uploadStatus === 'uploading' && (
                                                    <div className="flex items-center justify-center mt-2 text-xs text-slate-500 gap-2">
                                                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            {uploadStatus !== 'success' && (
                                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                                        disabled={uploadStatus === 'uploading'}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={uploadFile}
                                        disabled={!file || uploadStatus === 'uploading'}
                                        className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {uploadStatus === 'uploading' ? (
                                            <>Processing...</>
                                        ) : (
                                            <>Upload File</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
