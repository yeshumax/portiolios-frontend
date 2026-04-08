import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import ProjectList from '../../components/ProjectList';
import ContactForm from '../../components/ContactForm';
import HistoryPanel from '../../components/HistoryPanel';
import AdminDashboardHome from '../../components/admin/AdminDashboardHome';
import AdminSkillManagement from '../../components/admin/AdminSkillManagement';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Message {
    _id: string;
    userId: { _id?: string; name: string; email: string };
    status: string;
    type: string;
    message: string;
    adminResponse?: string;
    createdAt: string;
}

interface Project {
    _id: string;
    title: string;
    description: string;
    techStack: string[];
    image: string;
    githubLink?: string;
    liveLink?: string;
    type: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isBlocked: boolean;
    isActive: boolean;
}

interface Skill {
    _id: string;
    name: string;
    level: number;
    category: string;
    years: number;
    color: string;
}

const MessageItem: React.FC<{
    msg: Message;
    onRespond: (id: string, status: string, response: string) => Promise<void>
}> = React.memo(({ msg, onRespond }) => {
    const [isResponding, setIsResponding] = useState(false);
    const [response, setResponse] = useState(msg.adminResponse || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (status: string) => {
        setLoading(true);
        await onRespond(msg._id, status, response);
        setLoading(false);
        setIsResponding(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400';
            case 'rejected': return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400';
            case 'resolved': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400';
            default: return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400';
        }
    };

    return (
        <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 bg-white dark:bg-[#1a1a1a]">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {msg.userId?.name || 'Unknown User'}
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({msg.userId?.email || 'N/A'})</span>
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1 block">{msg.type}</span>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${getStatusColor(msg.status)}`}>
                    {msg.status}
                </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#121212] p-4 rounded-xl text-sm leading-relaxed border border-gray-100 dark:border-gray-800/50">
                {msg.message}
            </p>

            {msg.adminResponse && !isResponding && (
                <div className="mt-4 pl-4 border-l-2 border-green-500 dark:border-green-400">
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block mb-1">Admin Feedback</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{msg.adminResponse}"</p>
                </div>
            )}

            <div className="mt-4 flex justify-end gap-3">
                {!isResponding ? (
                    <button
                        onClick={() => setIsResponding(true)}
                        className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-sm"
                    >
                        {msg.adminResponse ? 'Update Response' : 'Respond'}
                    </button>
                ) : (
                    <div className="w-full space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Enter your feedback or reason for approval/rejection..."
                            className="w-full p-3 text-sm bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsResponding(false)}
                                className="text-xs px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            {msg.type === 'complaint' ? (
                                <>
                                    <button
                                        onClick={() => handleSubmit('rejected')}
                                        className="text-xs px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 font-bold rounded-lg transition"
                                        disabled={loading}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleSubmit('approved')}
                                        className="text-xs px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md shadow-green-500/20"
                                        disabled={loading}
                                    >
                                        Approve
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleSubmit('resolved')}
                                    className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-md shadow-blue-500/20"
                                    disabled={loading}
                                >
                                    Mark Resolved
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [messages, setMessages] = useState<Message[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [newProject, setNewProject] = useState<{
        title: string;
        description: string;
        techStack: string;
        image: string;
        imageFile: File | null;
        githubLink: string;
        liveLink: string;
        type: string;
    }>({ title: '', description: '', techStack: '', image: '', imageFile: null, githubLink: '', liveLink: '', type: 'Frontend' });

    // System Settings State
    const [systemSettings, setSystemSettings] = useState({
        maintenanceMode: false,
        allowRegistrations: true,
        sessionTimeout: 60,
        twoFactorAuth: false,
        emailNotifications: true,
        welcomeEmails: true,
        autoApproveUsers: false,
        maxUsersPerDay: 10
    });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

    const [skills, setSkills] = useState<Skill[]>([]);
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [isEditingSkill, setIsEditingSkill] = useState(false);
    const [editSkillId, setEditSkillId] = useState<string | null>(null);
    const [skillProcessing, setSkillProcessing] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: '', level: 0, category: 'frontend', years: 0, color: 'bg-blue-500' });

    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('All');
    const [projectSearch, setProjectSearch] = useState('');
    const [projectTypeFilter, setProjectTypeFilter] = useState('All');
    const [skillSearch, setSkillSearch] = useState('');
    const [skillCategoryFilter, setSkillCategoryFilter] = useState('All');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const [uRes, pRes, sRes, mRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/projects'),
                    api.get('/skills'),
                    api.get('/messages')
                ]);
                setUsers(uRes.data);
                setProjects(pRes.data);
                setSkills(sRes.data);
                setMessages(mRes.data);
            } else if (activeTab === 'messages') {
                try {
                    const { data } = await api.get('/messages');
                    setMessages(data);
                } catch (err: any) {
                    console.error('Error fetching messages:', err);
                    if (err.response?.status === 401) {
                        showToast('Please login as admin to view messages', 'error');
                    } else if (err.response?.status === 403) {
                        showToast('Admin access required to view messages', 'error');
                    } else {
                        showToast('Failed to load messages', 'error');
                    }
                    setMessages([]);
                }
            } else if (activeTab === 'projects') {
                try {
                    const { data } = await api.get('/projects');
                    setProjects(data);
                } catch (err: any) {
                    console.error('Error fetching projects:', err);
                    showToast('Failed to load projects', 'error');
                    setProjects([]);
                }
            } else if (activeTab === 'users') {
                try {
                    const { data } = await api.get('/users');
                    setUsers(data);
                } catch (err: any) {
                    console.error('Error fetching users:', err);
                    if (err.response?.status === 401) {
                        showToast('Please login as admin to view users', 'error');
                    } else if (err.response?.status === 403) {
                        showToast('Admin access required to view users', 'error');
                    } else {
                        showToast('Failed to load users', 'error');
                    }
                    setUsers([]);
                }
            } else if (activeTab === 'skills') {
                try {
                    const { data } = await api.get('/skills');
                    setSkills(data);
                } catch (err: any) {
                    console.error('Error fetching skills:', err);
                    showToast('Failed to load skills', 'error');
                    setSkills([]);
                }
            }
        } catch (error) {
            console.error('Error fetching admin data', error);
            showToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab, showToast]);
    const stats = [
        { label: 'Total Users', value: users.length, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', tab: 'users' },
        { label: 'Projects', value: projects.length, icon: '📁', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30', tab: 'projects' },
        { label: 'Skills', value: skills.length, icon: '⚡', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30', tab: 'skills' },
        { label: 'Complaints', value: messages.length, icon: '💬', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', tab: 'messages' },
    ];

    useEffect(() => {
        // Default to dashboard on first load if it's currently profile and we haven't fetched yet
        if (activeTab === 'profile' && !users.length && !loading) {
            setActiveTab('dashboard');
        }

        const tabsWithoutData = ['profile', 'settings', 'history', 'submit'];
        if (!tabsWithoutData.includes(activeTab)) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [activeTab]);

    const handleEditUser = (user: User) => {
        setNewUser({ name: user.name, email: user.email, password: '', role: user.role });
        setIsEditingUser(true);
        setEditUserId(user._id);
        setIsAddingUser(true);
    };

    const handleUserRole = async (id: string, newRole: string) => {
        try {
            await api.put(`/users/${id}`, { role: newRole });
            showToast('User role updated');
            fetchData();
        } catch (error) {
            showToast('Failed to update role', 'error');
        }
    };

    const handleUserApproval = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/users/${id}`, { isActive: !currentStatus });
            showToast(currentStatus ? 'User unapproved' : 'User approved');
            fetchData();
        } catch (error) {
            showToast('Failed to update approval', 'error');
        }
    };

    const handleUserBlock = async (id: string, currentBlocked: boolean) => {
        try {
            await api.put(`/users/${id}`, { isBlocked: !currentBlocked });
            showToast(currentBlocked ? 'User unblocked' : 'User blocked');
            fetchData();
        } catch (error) {
            showToast('Failed to update block status', 'error');
        }
    };

    const handleUserDelete = async (id: string, role: string) => {
        if (role === 'admin') return showToast('Cannot delete admin', 'error');
        if (window.confirm('Delete user?')) {
            try {
                await api.delete(`/users/${id}`);
                showToast('User deleted');
                fetchData();
            } catch (error) {
                showToast('Failed to delete user', 'error');
            }
        }
    };

    const handleSkillAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        // validation
        if (!newSkill.name.trim()) {
            return showToast('Skill name is required', 'error');
        }
        if (newSkill.level < 0 || newSkill.level > 100) {
            return showToast('Skill level must be 0-100', 'error');
        }
        if (newSkill.years < 0) {
            return showToast('Years of experience cannot be negative', 'error');
        }

        setSkillProcessing(true);
        try {
            if (isEditingSkill && editSkillId) {
                await api.put(`/skills/${editSkillId}`, newSkill);
                showToast('Skill updated', 'success');
            } else {
                await api.post('/skills', newSkill);
                showToast('Skill added', 'success');
            }
            setIsAddingSkill(false);
            setIsEditingSkill(false);
            setEditSkillId(null);
            setNewSkill({ name: '', level: 0, category: 'frontend', years: 0, color: 'bg-blue-500' });
            await fetchData();
        } catch (error) {
            showToast('Skill operation failed', 'error');
            console.error('Skill operation error:', error);
        } finally {
            setSkillProcessing(false);
        }
    };

    const handleEditSkill = (skill: Skill) => {
        setActiveTab('skills'); // Ensure admin is in Skills panel when editing
        setNewSkill({
            name: skill.name,
            level: skill.level,
            category: skill.category,
            years: skill.years,
            color: skill.color
        });
        setEditSkillId(skill._id);
        setIsEditingSkill(true);
        setIsAddingSkill(true);
    };

    const handleSkillDelete = async (id: string) => {
        if (window.confirm('Delete skill?')) {
            try {
                setActiveTab('skills');
                await api.delete(`/skills/${id}`);
                showToast('Skill deleted');
                fetchData();
            } catch (error) {
                showToast('Failed to delete', 'error');
            }
        }
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return 'https://via.placeholder.com/100x100';
        if (imagePath.startsWith('http')) return imagePath;
        const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `http://localhost:5000${normalizedPath}`.replace(/\\/g, '/');
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditingUser && editUserId) {
                await api.put(`/users/${editUserId}`, newUser);
                showToast('User updated successfully');
                setIsEditingUser(false);
                setEditUserId(null);
            } else {
                await api.post('/users/register', newUser);
                showToast('User created successfully');
            }
            setIsAddingUser(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            fetchData();
        } catch (error: any) {
            console.error('Failed to save user:', error.response?.data || error.message);
            showToast(error.response?.data?.message || 'Failed to save user', 'error');
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use FormData for file upload
        const formData = new FormData();
        formData.append('title', newProject.title);
        formData.append('description', newProject.description);
        formData.append('techStack', newProject.techStack); // Controller handles string or object
        formData.append('type', newProject.type);
        formData.append('githubLink', newProject.githubLink);
        formData.append('liveLink', newProject.liveLink);

        if (newProject.imageFile) {
            formData.append('image', newProject.imageFile);
        } else {
            formData.append('image', newProject.image); // Fallback to existing URL
        }

        try {
            if (isEditing && editId) {
                await api.put(`/projects/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setIsEditing(false);
                setEditId(null);
            } else {
                await api.post('/projects', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setNewProject({ title: '', description: '', techStack: '', image: '', imageFile: null, githubLink: '', liveLink: '', type: 'Frontend' });
            fetchData();
            showToast(isEditing ? 'Project updated' : 'Project added');
        } catch (error: any) {
            console.error('Failed to save project:', error.response?.data || error.message);
            showToast(error.response?.data?.message || 'Failed to save project', 'error');
        }
    };

    const handleEditProject = (project: Project) => {
        setNewProject({
            title: project.title,
            description: project.description,
            techStack: project.techStack.join(', '),
            image: project.image,
            imageFile: null,
            githubLink: project.githubLink || '',
            liveLink: project.liveLink || '',
            type: project.type
        });
        setIsEditing(true);
        setEditId(project._id);
    };

    const handleDeleteProject = async (id: string) => {
        if (window.confirm('Delete project?')) {
            await api.delete(`/projects/${id}`);
            fetchData();
        }
    };

    // Settings handler
    const handleSaveSettings = async () => {
        setSettingsLoading(true);
        try {
            // In a real app, this would save to backend
            // For now, we'll just simulate saving
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast('Settings saved successfully', 'success');
        } catch (error) {
            showToast('Failed to save settings', 'error');
        } finally {
            setSettingsLoading(false);
        }
    };

    return (
        <>
            <DashboardLayout role="admin" activeTab={activeTab} setActiveTab={setActiveTab}>
                <div className="w-full rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-6 md:p-8">
                        {loading ? (
                            <LoadingSpinner message="Loading data..." className="py-12" />
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                {/* Dashboard welcome block only on dashboard tab */}
                                {activeTab === 'dashboard' && (
                                    <div className="bg-gray-50 dark:bg-gray-900/40 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Welcome back, {user?.name}!</h2>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                                            You have full control over the portfolio. Use the sidebar to manage your projects, skills, and user interactions.
                                            Messages from users will appear in the "User Complaints" section.
                                        </p>
                                    </div>
                                )}

                                {/* Dashboard Home tab */}
                                {activeTab === 'dashboard' && (
                                    <AdminDashboardHome
                                        stats={stats}
                                        user={user ? { name: user.name } : undefined}
                                        onCardClick={(tab) => setActiveTab(tab)}
                                        loading={loading}
                                    />
                                )}

                                {/* Profile Panel */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Admin Profile</h2>
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-100 dark:border-purple-900/30 bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                {user?.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-4xl text-gray-400 font-bold uppercase">{user?.name.charAt(0)}</span>
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
                                                    <span className="inline-block mt-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium uppercase tracking-wider">{user?.role}</span>
                                                </div>
                                                <div className="pt-4">
                                                    <p className="text-sm text-gray-500">To update your profile image, click on your avatar in the top right header.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Settings Panel */}
                                {activeTab === 'settings' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">System Settings</h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* System Maintenance */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                                    <span className="mr-2">🔧</span>
                                                    System Maintenance
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-700 dark:text-gray-300">Maintenance Mode</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={systemSettings.maintenanceMode}
                                                                onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-700 dark:text-gray-300">Allow Registrations</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={systemSettings.allowRegistrations}
                                                                onChange={(e) => setSystemSettings({...systemSettings, allowRegistrations: e.target.checked})}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Security Settings */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                                    <span className="mr-2">🔒</span>
                                                    Security Settings
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
                                                        <input
                                                            type="number"
                                                            value={systemSettings.sessionTimeout}
                                                            onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value) || 60})}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            min="15"
                                                            max="480"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-700 dark:text-gray-300">Two-Factor Authentication</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={systemSettings.twoFactorAuth}
                                                                onChange={(e) => setSystemSettings({...systemSettings, twoFactorAuth: e.target.checked})}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Email Settings */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                                    <span className="mr-2">📧</span>
                                                    Email Settings
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={systemSettings.emailNotifications}
                                                                onChange={(e) => setSystemSettings({...systemSettings, emailNotifications: e.target.checked})}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-700 dark:text-gray-300">Welcome Emails</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={systemSettings.welcomeEmails}
                                                                onChange={(e) => setSystemSettings({...systemSettings, welcomeEmails: e.target.checked})}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Management Settings */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                                    <span className="mr-2">👥</span>
                                                    User Management
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-700 dark:text-gray-300">Auto-approve Users</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={systemSettings.autoApproveUsers}
                                                                onChange={(e) => setSystemSettings({...systemSettings, autoApproveUsers: e.target.checked})}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Users per Day</label>
                                                        <input
                                                            type="number"
                                                            value={systemSettings.maxUsersPerDay}
                                                            onChange={(e) => setSystemSettings({...systemSettings, maxUsersPerDay: parseInt(e.target.value) || 10})}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            min="1"
                                                            max="100"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Save Settings Button */}
                                        <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={handleSaveSettings}
                                                disabled={settingsLoading}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
                                            >
                                                {settingsLoading ? (
                                                    <>
                                                        <LoadingSpinner size="sm" className="mr-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save Settings'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Messages Panel (Manage User Complaints) */}
                                {activeTab === 'messages' && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Contact Center (User Complaints)</h2>
                                        <div className="space-y-6">
                                            {messages.length === 0 ? (
                                                <div className="text-center py-10 text-gray-500">No user messages found.</div>
                                            ) : (
                                                messages.map((msg) => (
                                                    <MessageItem
                                                        key={msg._id}
                                                        msg={msg}
                                                        onRespond={async (id, status, response) => {
                                                            await api.put(`/messages/${id}/respond`, { status, adminResponse: response });
                                                            fetchData();
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* History Panel (Admin's own submitted complaints) */}                {activeTab === 'history' && (
                                    <div className="space-y-6">
                                        <HistoryPanel
                                            messages={messages.filter(m => m.userId?._id === user?._id)}
                                            loading={loading}
                                            onNewMessage={fetchData}
                                            title="My Personal Complaints"
                                        />
                                    </div>
                                )}

                                {/* Projects Panel */}
                                {activeTab === 'projects' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-gray-900 dark:text-white">
                                        <div className="lg:col-span-1 border-r border-gray-100 dark:border-gray-700 pr-0 lg:pr-8">
                                            <h2 className="text-xl font-bold mb-6">{isEditing ? 'Edit Project' : 'Add New Project'}</h2>
                                            <form onSubmit={handleCreateProject} className="space-y-4">
                                                <input type="text" placeholder="Title" required value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-blue-500 text-gray-900 dark:text-white" />
                                                <textarea placeholder="Description" required value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-blue-500 text-gray-900 dark:text-white" />
                                                <input type="text" placeholder="Tech Stack (comma separated)" required value={newProject.techStack} onChange={e => setNewProject({ ...newProject, techStack: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-blue-500 text-gray-900 dark:text-white" />
                                                <select
                                                    required
                                                    value={newProject.type}
                                                    onChange={e => setNewProject({ ...newProject, type: e.target.value })}
                                                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-blue-500 text-gray-900 dark:text-white"
                                                >
                                                    <option value="Frontend">Frontend</option>
                                                    <option value="Backend">Backend</option>
                                                    <option value="Fullstack">Fullstack</option>
                                                    <option value="Design">Design</option>
                                                    <option value="Mobile App">Mobile App</option>
                                                </select>
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Project Image</label>
                                                    <div className="flex flex-col gap-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={e => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    setNewProject({ ...newProject, imageFile: e.target.files[0] });
                                                                }
                                                            }}
                                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                                                        />
                                                        {(newProject.imageFile || newProject.image) && (
                                                            <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                                                {newProject.imageFile ? `Selected: ${newProject.imageFile.name}` : `Existing: ${newProject.image.split('/').pop()}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <input type="text" placeholder="GitHub Link (optional)" value={newProject.githubLink} onChange={e => setNewProject({ ...newProject, githubLink: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-blue-500 text-gray-900 dark:text-white" />
                                                <input type="text" placeholder="Live Link (optional)" value={newProject.liveLink} onChange={e => setNewProject({ ...newProject, liveLink: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-blue-500 text-gray-900 dark:text-white" />
                                                <div className="flex gap-2">
                                                    <button type="submit" className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">
                                                        {isEditing ? 'Update Project' : 'Add Project'}
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsEditing(false);
                                                                setEditId(null);
                                                                setNewProject({ title: '', description: '', techStack: '', image: '', imageFile: null, githubLink: '', liveLink: '', type: 'Frontend' });
                                                            }}
                                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-xl font-bold">Manage Projects</h2>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Search projects..."
                                                        value={projectSearch}
                                                        onChange={(e) => setProjectSearch(e.target.value)}
                                                        className="px-3 py-2 text-sm border dark:border-gray-700 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    />
                                                    <select
                                                        value={projectTypeFilter}
                                                        onChange={(e) => setProjectTypeFilter(e.target.value)}
                                                        className="px-3 py-2 text-sm border dark:border-gray-700 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    >
                                                        <option value="All">All Types</option>
                                                        <option value="Frontend">Frontend</option>
                                                        <option value="Backend">Backend</option>
                                                        <option value="Fullstack">Fullstack</option>
                                                        <option value="Design">Design</option>
                                                        <option value="Mobile App">Mobile App</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {projects
                                                    .filter(p => (projectTypeFilter === 'All' || p.type === projectTypeFilter) &&
                                                        (p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
                                                            p.description.toLowerCase().includes(projectSearch.toLowerCase())))
                                                    .map(p => (
                                                        <div key={p._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition gap-4">
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                                    <img src={getImageUrl(p.image)} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                                                                        {p.title}
                                                                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold uppercase tracking-wider">{p.type}</span>
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{p.description}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleEditProject(p)} className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 p-2 rounded transition">Edit</button>
                                                                <button onClick={() => handleDeleteProject(p._id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 p-2 rounded transition">Delete</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Skills Panel */}
                                {activeTab === 'skills' && (
                                    <AdminSkillManagement
                                        skills={skills}
                                        skillSearch={skillSearch}
                                        setSkillSearch={setSkillSearch}
                                        skillCategoryFilter={skillCategoryFilter}
                                        setSkillCategoryFilter={setSkillCategoryFilter}
                                        isAddingSkill={isAddingSkill}
                                        setIsAddingSkill={setIsAddingSkill}
                                        isEditingSkill={isEditingSkill}
                                        setIsEditingSkill={setIsEditingSkill}
                                        editSkillId={editSkillId}
                                        setEditSkillId={setEditSkillId}
                                        newSkill={newSkill}
                                        setNewSkill={setNewSkill}
                                        skillProcessing={skillProcessing}
                                        onSubmit={handleSkillAdd}
                                        onEdit={handleEditSkill}
                                        onDelete={handleSkillDelete}
                                    />
                                )}

                                {activeTab === 'users' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
                                            <button
                                                onClick={() => {
                                                    if (isAddingUser) {
                                                        setIsEditingUser(false);
                                                        setEditUserId(null);
                                                        setNewUser({ name: '', email: '', password: '', role: 'user' });
                                                    }
                                                    setIsAddingUser(!isAddingUser);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${isAddingUser ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                                            >
                                                {isAddingUser ? 'Cancel' : '+ Add User'}
                                            </button>
                                        </div>

                                        {isAddingUser && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-4">{isEditingUser ? 'Edit User' : 'Create New User'}</h3>
                                                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                                                        <input type="text" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                                                        <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Password {isEditingUser && '(Leave blank to keep current)'}</label>
                                                        <input type="password" required={!isEditingUser} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Role</label>
                                                            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50">
                                                                <option value="user">User</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </div>
                                                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition self-end h-[42px]">Save</button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}

                                        <div className="mb-6 flex gap-4 items-center bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search by name or email..."
                                                    value={userSearch}
                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-2.5 border dark:border-gray-700 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                            </div>
                                            <select
                                                value={userRoleFilter}
                                                onChange={(e) => setUserRoleFilter(e.target.value)}
                                                className="px-4 py-2.5 border dark:border-gray-700 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-sm"
                                            >
                                                <option value="All">All Roles</option>
                                                <option value="admin">Admins</option>
                                                <option value="user">Users</option>
                                            </select>
                                            <button
                                                onClick={() => { setUserSearch(''); setUserRoleFilter('All'); }}
                                                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition"
                                            >
                                                Reset
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 text-sm border-b dark:border-gray-700">
                                                        <th className="p-4 rounded-tl-xl font-bold uppercase tracking-wider text-[10px]">User Info</th>
                                                        <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Role</th>
                                                        <th className="p-4 text-center font-bold uppercase tracking-wider text-[10px]">Status</th>
                                                        <th className="p-4 text-right rounded-tr-xl font-bold uppercase tracking-wider text-[10px]">Management Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users
                                                        .filter(u => (userRoleFilter === 'All' || u.role === userRoleFilter) &&
                                                            (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                                u.email.toLowerCase().includes(userSearch.toLowerCase())))
                                                        .map((u) => (
                                                            <tr key={u._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-200 group">
                                                                <td className="p-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-gray-900 dark:text-white">{u.name}</span>
                                                                        <span className="text-[10px] text-gray-500 font-medium">{u.email}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg tracking-wide border ${u.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800/50' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                                                                        {u.role}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <button
                                                                        onClick={() => handleUserBlock(u._id, u.isBlocked)}
                                                                        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-xl tracking-wide transition-all border ${!u.isBlocked ? 'bg-green-50 dark:bg-green-900/30 text-green-600 border-green-100 dark:border-green-800/50 hover:bg-green-100' : 'bg-red-50 dark:bg-red-900/30 text-red-600 border-red-100 dark:border-red-800/50 hover:bg-red-100'}`}
                                                                    >
                                                                        {!u.isBlocked ? '● Active' : '○ Deactive'}
                                                                    </button>
                                                                </td>
                                                                <td className="p-4 text-right space-x-2">
                                                                    <div className="flex justify-end gap-2">
                                                                        {u.role === 'admin' && !u.isActive && (
                                                                            <button onClick={() => handleUserApproval(u._id, u.isActive)} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg transition uppercase tracking-wide hover:bg-blue-700 shadow-sm">
                                                                                Approve Request
                                                                            </button>
                                                                        )}
                                                                        <button onClick={() => handleEditUser(u)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold rounded-lg transition uppercase tracking-wide border border-gray-200 dark:border-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700">
                                                                            Edit
                                                                        </button>
                                                                        <button onClick={() => handleUserDelete(u._id, u.role)} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg transition uppercase tracking-wide border border-red-100 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50">
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'submit' && (
                                    <div className="max-w-4xl">
                                        <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Send System Notice or Feedback</h2>
                                        <ContactForm embedded />
                                    </div>
                                )}

                                {activeTab === 'browse-projects' && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Browse All Projects</h2>
                                        <ProjectList />
                                    </div>
                                )}



                            </motion.div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default AdminDashboard;