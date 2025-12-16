import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Database, Shield, Zap, BarChart, Menu, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { cn } from '../lib/utils';

// Inline Navbar specifically for the Landing Page
function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Use Cases', href: '#use-cases' },
        { name: 'Resources', href: '#resources' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Company', href: '#company' },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-blue-600/95 backdrop-blur-md shadow-sm py-4" // Scrolled: Blue
                    : "bg-transparent py-6" // Top: Transparent (shows Blue Hero)
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    {/* Logo - Always White/Blue theme */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-blue-600">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-white">
                        BuzzSumo <span className="text-xs font-normal opacity-70">(Guardian Edition)</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-semibold text-blue-50 hover:text-white transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-bold text-white hover:text-blue-50 transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="px-5 py-2.5 rounded text-sm font-bold transition-all shadow-lg bg-white text-blue-600 hover:bg-blue-50 hover:shadow-white/20 hover:-translate-y-0.5"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </nav>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <LandingNavbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-40 pb-32 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 min-h-[90vh] flex items-center">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-white/20 blur-sm" />
                    <div className="absolute top-40 left-1/4 w-8 h-8 rounded-full bg-white/10 blur-md" />
                    <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl opacity-50" />

                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl mx-auto mb-12"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8 drop-shadow-sm">
                                Be inspired. <br />
                                Stay informed.
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                                See how much interest brands and content generate in the wild with our AI-powered Data Guardian.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-blue-600 bg-white rounded shadow-xl hover:bg-blue-50 hover:scale-105 transition-all duration-200"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </motion.div>

                        {/* Dashboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative max-w-5xl mx-auto"
                        >
                            <div className="relative z-10 bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-white/20">
                                <img
                                    src="https://placehold.co/1000x600/f8fafc/3b82f6?text=Dashboard+Preview"
                                    alt="Dashboard"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                            {/* Glow behind image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-400/30 blur-3xl rounded-full -z-10" />
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Guardian?</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                                Comprehensive tools to maintain data integrity across your entire organization.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <FeatureCard
                                icon={<Shield className="w-8 h-8 text-blue-600" />}
                                title="AI Anomaly Detection"
                                description="Automatically identify outliers and suspicious patterns in your data using advanced machine learning models."
                            />
                            <FeatureCard
                                icon={<Database className="w-8 h-8 text-cyan-600" />}
                                title="Smart Deduplication"
                                description="Intelligent fuzzy matching to find and merge duplicate records without manual intervention."
                            />
                            <FeatureCard
                                icon={<BarChart className="w-8 h-8 text-indigo-600" />}
                                title="Quality Scoring"
                                description="Get instant quality scores for every dataset. Track improvements over time with detailed reports."
                            />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-8 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all hover:shadow-xl hover:shadow-blue-900/5 group text-left">
            <div className="mb-6 p-4 bg-blue-50/50 rounded-lg w-fit shadow-sm group-hover:scale-110 transition-transform duration-300 ring-1 ring-blue-100">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
