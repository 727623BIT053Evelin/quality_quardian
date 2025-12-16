import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false);
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
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-border/50 py-3"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Quality Guardian
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-border/50" />
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-white hover:text-white/80 transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/dashboard"
                            className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-primary px-6 font-medium text-neutral-50 shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/40 hover:scale-105"
                        >
                            <span className="mr-2">Get Started</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-muted-foreground hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-base font-medium text-muted-foreground hover:text-white"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <hr className="border-border/50 my-2" />
                            <Link
                                to="/login"
                                className="text-base font-medium text-muted-foreground hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Log in
                            </Link>
                            <Link
                                to="/dashboard"
                                className="flex items-center justify-center h-10 rounded-full bg-primary text-white font-medium w-full"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
