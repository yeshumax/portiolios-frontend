import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ProjectList from '../../components/ProjectList';
import ContactForm from '../../components/ContactForm';
import HistoryPanel from '../../components/HistoryPanel';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

interface Message {
    _id: string;
    type: string;
    status: string;
    message: string;
    createdAt: string;
    adminResponse?: string;
}

const UserDashboard: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { theme, setTheme } = useTheme(); // Make sure setTheme is properly typed
    const { showToast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    // Settings state
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const stats = [
        { label: 'My Complaints', value: messages.length, icon: '', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        { label: 'Resolved', value: messages.filter(m => m.status === 'resolved').length, icon: '', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/40' },
        { label: 'Pending', value: messages.filter(m => m.status === 'pending').length, icon: '', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
    ];

    useEffect(() => {
        const fetchMyMessages = async () => {
            if (!user) {
                setMessages([]);
                setLoading(false);
                return;
            }
            
            try {
                const { data } = await api.get('/messages/my-messages');
                setMessages(data);
            } catch (error: any) {
                console.error('Failed to fetch user messages:', error);
                if (error.response?.status === 401) {
                    showToast('Please login to view your messages', 'error');
                } else {
                    showToast('Failed to load messages', 'error');
                }
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyMessages();
    }, [user]);

    const handleTabChange = (tab: string) => {
        if (tab === 'submit') {
            navigate('/contact');
        } else {
            setActiveTab(tab);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await updateProfile(profileData);
            showToast('Profile updated successfully', 'success');
        } catch (error) {
            showToast('Failed to update profile', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            await updateProfile({ 
                password: passwordData.newPassword,
                currentPassword: passwordData.currentPassword 
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showToast('Password changed successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
    };

    return (
        <DashboardLayout role="user" activeTab={activeTab} setActiveTab={handleTabChange}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and feedback</p>
            </motion.div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 min-h-[500px]">
                {/* Dashboard Home tab */}
                {activeTab === 'dashboard' && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveTab('history')}
                                    title="View Feedback History"
                                    className={`${stat.bg} p-6 rounded-3xl border border-white/20 dark:border-white/5 shadow-sm group hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-2xl">{stat.icon}</span>
                                        <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                        {stat.label}
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-500">View ➔</span>
                                    </h3>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/40 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hello, {user?.name}!</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-6">
                                Welcome to your personal dashboard. From here you can track your feedback history, submit new requests, and browse our latest projects.
                            </p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleTabChange('submit')} 
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                                >
                                    Submit Feedback
                                </button>
                                <Link 
                                    to="/projects" 
                                    className="px-6 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                                >
                                    View Projects
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="p-6 md:p-8 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">My Profile</h2>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-gray-400 font-bold uppercase">{user?.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{user?.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Role</label>
                                    <span className="inline-block mt-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium uppercase tracking-wider">
                                        {user?.role}
                                    </span>
                                </div>
                                <div className="pt-4">
                                    <p className="text-sm text-gray-500">To update your profile image, click on your avatar in the top right header.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">Account Settings</h2>

                        <div className="space-y-8">
                            {/* Profile Information */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                                    >
                                        {profileLoading ? (
                                            <>
                                                <LoadingSpinner size="sm" className="mr-2" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Profile'
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Change Password */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                                    >
                                        {passwordLoading ? (
                                            <>
                                                <LoadingSpinner size="sm" className="mr-2" />
                                                Changing...
                                            </>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Theme Preferences */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme Preferences</h3>
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700 dark:text-gray-300">Theme:</span>
                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            theme === 'light'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        Light
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            theme === 'dark'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <HistoryPanel 
                        messages={messages} 
                        loading={loading} 
                        onNewMessage={async () => {
                            try {
                                const { data } = await api.get('/messages/my-messages');
                                setMessages(data);
                            } catch (error) {
                                console.error('Failed to refresh messages');
                            }
                        }} 
                    />
                )}

                {activeTab === 'browse-projects' && (
                    <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-8">All Projects</h2>
                        <ProjectList />
                    </div>
                )}

                {activeTab === 'submit' && (
                    <div className="p-6 md:p-8 max-w-4xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-8">Submit Feedback or Request</h2>
                        <ContactForm embedded />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;