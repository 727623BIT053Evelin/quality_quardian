import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Database, FileText, Settings, ShieldCheck, LogOut, Search, Bell, User } from 'lucide-react';
import { cn } from '../../lib/utils';

// Top Navbar Dashboard Layout to match "BuzzSumo" style (No Sidebar split)
export default function DashboardLayout() {
    const links = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Datasets', href: '/dashboard/datasets', icon: Database },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar - Blue Gradient Theme */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Left: Logo & Nav Links */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">Guardian</span>
                            </Link>

                            <nav className="hidden md:flex items-center space-x-1">
                                {links.map((link) => (
                                    <NavLink
                                        key={link.name}
                                        to={link.href}
                                        end={link.href === '/dashboard'}
                                        className={({ isActive }) => cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all",
                                            isActive
                                                ? "bg-white/20 text-white shadow-inner"
                                                : "text-blue-100 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.name}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        {/* Right: Search, Notifications, Profile */}
                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-200" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-64 bg-blue-700/50 border border-blue-400/30 rounded-full pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                />
                            </div>

                            <button className="p-2 rounded-full text-blue-100 hover:bg-white/10 transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-blue-600" />
                            </button>

                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>

                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
