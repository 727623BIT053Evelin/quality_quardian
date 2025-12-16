import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Github, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 bg-white">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-10 text-blue-600">
                        <ShieldCheck className="w-8 h-8" />
                        <span className="text-xl font-bold">Guardian</span>
                    </Link>

                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome back</h2>
                    <p className="text-slate-500 mb-8">
                        Enter your credentials to access your data guardian dashboard.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="name@company.com"
                                />
                                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                            </div>
                        </div>



                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image/Gradient */}
            <div className="hidden lg:block relative bg-blue-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/30 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl opacity-50" />

                <div className="relative h-full flex flex-col justify-center px-16 text-white text-center sm:text-left">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl max-w-lg mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 text-blue-600">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">"The data quality insights are incredible."</h3>
                        <p className="text-blue-100 mb-6 leading-relaxed">
                            Guardian has completely transformed how we handle our B2B contacts. We've reduced bounce rates by 40% in just two weeks.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-400" />
                            <div>
                                <div className="font-bold">Sarah Jenkins</div>
                                <div className="text-sm text-blue-200">Head of Data, TechFlow</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
