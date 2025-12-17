import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Database, Shield, Zap, BarChart, Menu, X, ShieldCheck, Briefcase, BookOpen, CreditCard, Users, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';


// Inline Navbar specifically for the Landing Page
function LandingNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Use Cases', href: '#use-cases' },
        { name: 'Resources', href: '#resources' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Company', href: '#company' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-blue-600/95 backdrop-blur-md shadow-sm py-4">
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
                                    src="/dashboard-preview.png"
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

                {/* Use Cases Section */}
                <section id="use-cases" className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Built for Every Industry</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                                From e-commerce to healthcare, Guardian adapts to your data needs.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <UseCaseCard
                                icon={<Briefcase className="w-6 h-6 text-white" />}
                                title="E-Commerce"
                                description="Ensure product descriptions are unique and inventory data is accurate across all channels."
                                color="bg-blue-600"
                            />
                            <UseCaseCard
                                icon={<Database className="w-6 h-6 text-white" />}
                                title="Finance"
                                description="Detect anomalies in transaction logs instantly and maintain regulatory compliance."
                                color="bg-indigo-600"
                            />
                            <UseCaseCard
                                icon={<ShieldCheck className="w-6 h-6 text-white" />}
                                title="Healthcare"
                                description="Standardize patient records and ensure data integrity for critical medical research."
                                color="bg-cyan-600"
                            />
                        </div>
                    </div>
                </section>

                {/* Resources Section */}
                <section id="resources" className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-12 max-w-6xl mx-auto">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Resources</h2>
                                <p className="text-slate-500 text-lg">Learn how to get the most out of your data.</p>
                            </div>
                            <Link to="/signup" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                                View all resources <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <ResourceCard
                                title="Data Quality 101"
                                category="Guide"
                                image="https://placehold.co/600x400/e2e8f0/64748b?text=Guide"
                            />
                            <ResourceCard
                                title="API Integration Docs"
                                category="Documentation"
                                image="https://placehold.co/600x400/e2e8f0/64748b?text=Docs"
                            />
                            <ResourceCard
                                title="Case Study: FinTech"
                                category="Case Study"
                                image="https://placehold.co/600x400/e2e8f0/64748b?text=Case+Study"
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                                Start for free, scale as you grow.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                            <PricingCard
                                tier="Starter"
                                price="$0"
                                features={['Up to 5 Datasets', 'Basic Anomaly Detection', 'Community Support']}
                            />
                            <PricingCard
                                tier="Pro"
                                price="$49"
                                features={['Unlimited Datasets', 'Advanced AI Models', 'Priority Support', 'API Access']}
                                highlighted
                            />
                            <PricingCard
                                tier="Enterprise"
                                price="Custom"
                                features={['Dedicated Infrastructure', 'SLA Guarantee', 'Custom AI Training', '24/7 Support']}
                            />
                        </div>
                    </div>
                </section>

                {/* Company Section */}
                <section id="company" className="py-24 bg-slate-900 text-white">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl mb-8">
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                        <p className="text-xl text-slate-300 leading-relaxed mb-10">
                            We believe that reliable data is the foundation of modern innovation. Guardian was built to empower organizations to trust their data, automating the tedious cleaning process so teams can focus on what matters—building the future.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-10">
                            <div>
                                <div className="text-3xl font-bold text-blue-400 mb-1">99.9%</div>
                                <div className="text-sm text-slate-400">Uptime</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-blue-400 mb-1">50M+</div>
                                <div className="text-sm text-slate-400">Rows Processed</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-blue-400 mb-1">10k+</div>
                                <div className="text-sm text-slate-400">Users</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-blue-400 mb-1">24/7</div>
                                <div className="text-sm text-slate-400">Support</div>
                            </div>
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

function UseCaseCard({ icon, title, description, color }) {
    return (
        <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
    );
}

function ResourceCard({ title, category, image }) {
    return (
        <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div className="h-48 overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">{category}</span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
            </div>
        </div>
    );
}

function PricingCard({ tier, price, features, highlighted }) {
    return (
        <div className={`p-8 rounded-2xl border ${highlighted ? 'border-blue-500 bg-blue-50/10 shadow-xl ring-1 ring-blue-500 relative' : 'border-slate-200 bg-white hover:border-blue-300 transition-colors'}`}>
            {highlighted && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>}
            <h3 className="text-lg font-bold text-slate-900 mb-2">{tier}</h3>
            <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">{price}</span>
                {price !== 'Custom' && <span className="text-slate-500">/month</span>}
            </div>
            <Link to="/signup" className={`block w-full py-3 px-6 rounded-lg text-center font-bold transition-all ${highlighted ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                Get Started
            </Link>
            <ul className="mt-8 space-y-4">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}
