import React from 'react';
import { User, Bell, Shield, Database, LayoutGrid, LogOut } from 'lucide-react';

export default function Settings() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-1">
                    <NavButton active icon={User} label="Profile" />
                    <NavButton icon={Shield} label="Security" />
                    <NavButton icon={Bell} label="Notifications" />
                    <NavButton icon={Database} label="Data Management" />
                    <NavButton icon={LayoutGrid} label="Integrations" />
                    <div className="pt-4 mt-4 border-t border-slate-200">
                        <NavButton icon={LogOut} label="Sign Out" color="text-red-600 hover:bg-red-50" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="md:col-span-2 space-y-6">

                    {/* Profile Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Profile Information</h2>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                JD
                            </div>
                            <div>
                                <button className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                    Change Avatar
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="First Name" defaultValue="John" />
                            <Input label="Last Name" defaultValue="Doe" />
                            <Input label="Email Address" defaultValue="john.doe@example.com" type="email" />
                            <Input label="Role" defaultValue="Data Scientist" disabled />
                        </div>
                        <div className="mt-6 text-right">
                            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">App Preferences</h2>
                        <div className="space-y-4">
                            <Toggle label="Email Notifications" description="Receive updates about your data scans." defaultChecked />
                            <Toggle label="Dark Mode" description="Switch between light and dark themes." />
                            <Toggle label="Auto-Correction" description="Automatically fix minor formatting issues." defaultChecked />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function NavButton({ icon: Icon, label, active, color = "text-slate-600" }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : `hover:bg-slate-50 ${color}`}`}>
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );
}

function Input({ label, type = "text", defaultValue, disabled }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
            <input
                type={type}
                defaultValue={defaultValue}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            />
        </div>
    );
}

function Toggle({ label, description, defaultChecked }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
}
