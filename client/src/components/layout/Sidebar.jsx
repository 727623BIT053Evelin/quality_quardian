import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, FileText, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar() {
    const links = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Datasets', href: '/dashboard/datasets', icon: Database },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 border-r border-border/50 bg-card hidden md:flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 flex items-center gap-2 border-b border-border/50 h-16">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-violet-500">
                    <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Guardian</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.href}
                        end={link.href === '/dashboard'}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border/50">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
