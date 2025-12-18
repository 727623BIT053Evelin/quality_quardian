import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ExternalLink } from 'lucide-react';

export default function ChatAssistant() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[calc(100vh-8rem)] flex flex-col -mx-4 md:-mx-8 -mb-8 overflow-hidden"
        >
            {/* Mini Header Overlay (optional, semi-transparent) */}
            <div className="absolute top-4 right-8 z-10 flex gap-4">
                <a
                    href="http://localhost:8501"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm text-white text-xs rounded-full border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                    Full Tab <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            {/* Chatbot Iframe Container - Edge to Edge */}
            <div className="flex-1 bg-slate-900 overflow-hidden relative border-t border-slate-800">
                <iframe
                    src="http://localhost:8501/?embed=true"
                    title="Guardian AI Assistant"
                    className="w-full h-full border-none"
                    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                />
            </div>
        </motion.div>
    );
}
