import React, { useState, useEffect, useRef } from 'react';
import { User, Bell, Shield, Database, LayoutGrid, LogOut, Camera, Loader, Check, AlertTriangle, Download, Trash2, Github, Slack, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');

    // User State
    const [profile, setProfile] = useState({
        name: '',
        splitName: { first: '', last: '' },
        email: '',
        role: 'Data Scientist',
        avatar: ''
    });

    const [preferences, setPreferences] = useState({
        notifications: true,
        darkMode: false,
        autoCorrection: true
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Update active tab when location state changes
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // Fetch Profile
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:4000/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok) {
                    const names = data.name ? data.name.split(' ') : ['User', ''];
                    setProfile({
                        name: data.name,
                        splitName: { first: names[0], last: names.slice(1).join(' ') },
                        email: data.email,
                        role: data.role || 'Data Scientist',
                        avatar: data.avatar ? `http://localhost:4000${data.avatar}` : ''
                    });
                    if (data.preferences) {
                        setPreferences(data.preferences);
                    }
                } else {
                    setMessage({ type: 'error', text: 'Failed to load profile' });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setMessage({ type: 'error', text: 'Server error' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // Handlers
    const handleNameChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            splitName: { ...prev.splitName, [name]: value }
        }));
    };

    const handlePreferenceChange = async (key) => {
        const newPreferences = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPreferences);

        // Auto-save preferences
        const token = localStorage.getItem('token');
        try {
            await fetch('http://localhost:4000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ preferences: newPreferences })
            });
        } catch (err) {
            console.error("Failed to save preference", err);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:4000/api/auth/avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                const newAvatarUrl = `http://localhost:4000${data.avatar}`;
                setProfile(prev => ({ ...prev, avatar: newAvatarUrl }));

                // Update Local Storage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...user, avatar: data.avatar };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Dispatch event for Navbar update
                window.dispatchEvent(new Event('userUpdated'));

                setMessage({ type: 'success', text: 'Avatar updated successfully' });
            } else {
                setMessage({ type: 'error', text: 'Avatar upload failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error uploading avatar' });
        }
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        const token = localStorage.getItem('token');

        const fullName = `${profile.splitName.first} ${profile.splitName.last}`.trim();

        try {
            const response = await fetch('http://localhost:4000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: fullName,
                    email: profile.email,
                    preferences
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully' });
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...user, name: fullName, email: profile.email }));
            } else {
                setMessage({ type: 'error', text: 'Failed to save changes' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:4000/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" /></div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Profile Information</h2>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative w-20 h-20">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-slate-100" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                        {profile.splitName.first?.[0]}{profile.splitName.last?.[0]}
                                    </div>
                                )}
                                <button onClick={handleAvatarClick} className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors border-2 border-white">
                                    <Camera className="w-3.5 h-3.5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div>
                                <button onClick={handleAvatarClick} className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                    Change Avatar
                                </button>
                                <p className="text-xs text-slate-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="First Name" name="first" value={profile.splitName.first} onChange={handleNameChange} />
                            <Input label="Last Name" name="last" value={profile.splitName.last} onChange={handleNameChange} />
                            <Input label="Email Address" name="email" value={profile.email} disabled={true} onChange={() => { }} type="email" />
                            <Input label="Role" value={profile.role} disabled={true} />
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2 ml-auto">
                                {saving && <Loader className="w-4 h-4 animate-spin" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Security Settings</h2>
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <Input
                                label="Current Password"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2">
                                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Notifications</h2>
                        <div className="space-y-4">
                            <Toggle
                                label="Email Notifications"
                                description="Receive updates about your data scans and improvements."
                                checked={preferences.notifications}
                                onChange={() => handlePreferenceChange('notifications')}
                            />
                            <Toggle
                                label="Product Updates"
                                description="Receive news about new features and updates."
                                checked={preferences.autoCorrection} // Reusing autoCorrection logic for demo
                                onChange={() => handlePreferenceChange('autoCorrection')}
                            />
                        </div>
                    </div>
                );
            case 'data':
                return (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-2">Export Data</h2>
                            <p className="text-sm text-slate-500 mb-4">Download a copy of your personal data and datasets.</p>
                            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                                <Download className="w-4 h-4" />
                                Export Personal Data
                            </button>
                        </div>
                        <div className="pt-8 border-t border-slate-100">
                            <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
                            <p className="text-sm text-slate-500 mb-4">Permanently delete your account and all associated data.</p>
                            <button className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                            </button>
                        </div>
                    </div>
                );
            case 'integrations':
                return (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Integrations</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-100 rounded-lg"><Github className="w-6 h-6" /></div>
                                    <div>
                                        <h4 className="font-semibold">GitHub</h4>
                                        <p className="text-xs text-slate-500">Connect repositories</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Connect</button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-100 rounded-lg"><Slack className="w-6 h-6" /></div>
                                    <div>
                                        <h4 className="font-semibold">Slack</h4>
                                        <p className="text-xs text-slate-500">Receive alerts</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Connect</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Settings</h1>

            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-1">
                    <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile" />
                    <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield} label="Security" />
                    <NavButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={Bell} label="Notifications" />
                    <NavButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={Database} label="Data Management" />
                    <NavButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={LayoutGrid} label="Integrations" />
                    <div className="pt-4 mt-4 border-t border-slate-200">
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-50">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="md:col-span-2 space-y-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

function NavButton({ icon: Icon, label, active, onClick, color = "text-slate-600" }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : `hover:bg-slate-50 ${color}`}`}>
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );
}

function Input({ label, type = "text", value, defaultValue, disabled, onChange, name }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            />
        </div>
    );
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
}
