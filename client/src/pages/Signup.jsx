import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Github, Globe, Zap } from 'lucide-react';

export default function Signup() {
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
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 bg-white order-2 lg:order-1">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-10 text-blue-600">
                        <ShieldCheck className="w-8 h-8" />
                        <span className="text-xl font-bold">Guardian</span>
                    </Link>

                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Create an account</h2>


                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                                <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                            </div>
                        </div>

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
                                    autoComplete="new-password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Must be at least 8 characters"
                                />
                                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>



                    <p className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image/Gradient */}
            <div className="hidden lg:block relative bg-slate-900 overflow-hidden order-1 lg:order-2">
                {/* Using a different gradient for Signup to distinguish it slightly */}
                <div className="absolute inset-0 bg-gradient-to-bl from-slate-900 via-blue-900 to-slate-900" />

                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-slate-900/0 to-transparent" />

                <div className="relative h-full flex flex-col justify-center px-16 text-white text-center sm:text-left">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl max-w-lg mx-auto">
                        <h3 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            Join 10,000+ companies
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><ShieldCheck className="w-5 h-5" /></div>
                                <p className="text-slate-300">Enterprise-grade security</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Zap className="w-5 h-5" /></div>
                                <p className="text-slate-300">Real-time data processing</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Github className="w-5 h-5" /></div>
                                <p className="text-slate-300">Seamless integration</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
