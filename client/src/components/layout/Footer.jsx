import React from 'react';
import { ShieldCheck, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-blue-600 to-blue-500 pt-16 pb-8 text-white">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-blue-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold">Quality Guardian</span>
                        </Link>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            AI-powered data quality assurance for modern enterprises. Clean, validate, and enhance your B2B datasets instantly.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li><Link to="#" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">API</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Integrations</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li><Link to="#" className="hover:text-white transition-colors">About</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-blue-100">
                        © {new Date().getFullYear()} Quality Guardian. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-blue-100 hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-blue-100 hover:text-white transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-blue-100 hover:text-white transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
