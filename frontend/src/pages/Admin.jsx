import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import * as api from '../services/api';

const MetricTile = ({ value, label, color = '#fff' }) => (
    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.8rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', minWidth: '100px' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: '900', color }}>{value}</div>
        <div style={{ fontSize: '0.6rem', color: '#444', fontWeight: '800', textTransform: 'uppercase' }}>{label}</div>
    </div>
);

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState(null);
    const [intelligence, setIntelligence] = useState(null);
    const [intLoading, setIntLoading] = useState(false);
    const [editData, setEditData] = useState({ username: '', email: '', role: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const reqs = await api.fetchDemoRequests();
            setRequests(reqs);
        } catch (err) {
            console.error("Failed to load demo requests", err);
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const loadUsers = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.adminFetchUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchIntelligence = async (id) => {
        setIntLoading(true);
        try {
            const data = await api.adminFetchUserIntelligence(id);
            setIntelligence(data);
        } catch (err) {
            alert("Could not retrieve intelligence profile.");
        } finally {
            setIntLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUserId(user._id);
        setEditData({ username: user.username, email: user.email, role: user.role, password: '' });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const updatePayload = { ...editData };
            if (!updatePayload.password) delete updatePayload.password;

            await api.adminUpdateUser(editingUserId, updatePayload);
            setMessage('Account attributes synchronized successfully.');
            setEditingUserId(null);
            loadUsers(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await api.adminUpdateUser(user._id, { isActive: !user.isActive });
            setUsers(users.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
            setMessage(`Account ${!user.isActive ? 'Reactivated' : 'Deactivated'} successfully.`);
        } catch (err) {
            alert("Status synchronization failed.");
        }
    };

    const handleDeleteUser = async (id, name) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser._id === id) {
            alert("Security Protocol: You cannot purge your own administrative account.");
            return;
        }

        if (!window.confirm(`SECURITY ALERT: Permanently purge all data for user: ${name}?`)) return;
        try {
            await api.adminDeleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            setMessage('User record permanently removed.');
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    const filteredUsers = users.filter(u =>
        u.role !== 'demo' &&
        (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleApproveRequest = async (reqId, name, email) => {
        try {
            await api.approveDemoRequest(reqId);
            setMessage(`Request for ${name} approved. Redirecting to Add User...`);
            loadRequests();
            setTimeout(() => {
                navigate('/admin/add-user', { state: { name, email } });
            }, 1500);
        } catch (err) {
            alert(err.response?.data?.message || 'Approval failed');
        }
    };

    const handleRejectRequest = async (reqId, name) => {
        if (!window.confirm(`Are you sure you want to deny admin access for ${name}?`)) return;
        try {
            await api.rejectDemoRequest(reqId);
            setMessage(`Access request for ${name} has been denied.`);
            loadRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Rejection failed');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />

            {/* User Intelligence Modal */}
            {intelligence && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div className="animate-fade-in" style={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2.5rem', width: '100%', maxWidth: '900px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="mobile-padding-sm" style={{ padding: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div className="mobile-text-center" style={{ flex: '1 1 auto' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0 }}>{intelligence.user.username} <span style={{ color: 'var(--primary-color)', fontSize: '0.7rem', verticalAlign: 'middle', marginLeft: '5px' }}>INTEL PROFILE</span></h2>
                                <p style={{ margin: '5px 0 0 0', color: '#555', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>ID: {intelligence.user._id}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', flex: '1 1 auto' }} className="mobile-full-width">
                                <MetricTile value={`${intelligence.totalTimeSpent}m`} label="Time" color="var(--primary-color)" />
                                <MetricTile value={intelligence.habits.length} label="Habits" />
                                <MetricTile value={new Date(intelligence.user.createdAt).toLocaleDateString()} label="Joined" />
                                <MetricTile
                                    value={intelligence.intelligence.markedToday ? "DONE" : "PENDING"}
                                    label="Today"
                                    color={intelligence.intelligence.markedToday ? "#22c55e" : "#eab308"}
                                />
                            </div>
                            <button onClick={() => setIntelligence(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', transition: '0.3s', marginLeft: 'auto' }} onMouseOver={e => e.target.style.background = 'rgba(255,0,0,0.2)'} onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.05)'}>×</button>
                        </div>

                        {/* Behavior Metrics Bar */}
                        <div className="mobile-stack" style={{ background: 'rgba(var(--primary-rgb), 0.03)', padding: '1rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ flex: 1, width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#555', textTransform: 'uppercase' }}>Discipline Score</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary-color)' }}>{intelligence.intelligence.monthlyPerformance}%</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${intelligence.intelligence.monthlyPerformance}%`, height: '100%', background: 'var(--primary-gradient)' }}></div>
                                </div>
                            </div>
                            <div className="mobile-text-center" style={{ textAlign: 'right', minWidth: '150px' }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: '900', color: '#444', textTransform: 'uppercase', marginBottom: '2px' }}>Last Automated Nudge</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: intelligence.intelligence.lastEmailSent ? '#fff' : '#333' }}>
                                    {intelligence.intelligence.lastEmailSent ? new Date(intelligence.intelligence.lastEmailSent).toLocaleString() : 'None'}
                                </div>
                            </div>
                        </div>

                        <div className="mobile-slider" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: 'rgba(255,255,255,0.05)', flex: 1, overflowY: 'auto' }}>
                            <div style={{ padding: '2.5rem', background: '#0a0a0c', overflowY: 'auto' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#333', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>Registered Habits</h3>
                                {intelligence.habits.length === 0 ? (
                                    <p style={{ color: '#444', fontStyle: 'italic' }}>No active habits found.</p>
                                ) : intelligence.habits.map(h => (
                                    <div key={h._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '14px', marginBottom: '1rem', borderLeft: '3px solid var(--primary-color)' }}>
                                        <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{h.title}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '5px' }}>Current Streak: {h.streak} days</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: '2.5rem', background: '#08080a', overflowY: 'auto' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#333', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>Activity Intelligence</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {intelligence.logs.map((log, i) => (
                                        <div key={i} style={{ borderLeft: '1px solid rgba(var(--primary-rgb),0.1)', paddingLeft: '1.5rem', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-5px', top: '0', width: '9px', height: '9px', background: log.type === 'login' ? 'var(--primary-color)' : '#222', borderRadius: '50%' }}></div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#444', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#ddd' }}>{log.details}</div>
                                            {log.metadata && (
                                                <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '4px', fontStyle: 'italic', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    <span>🌐 {log.metadata.browser}</span>
                                                    <span>💻 {log.metadata.os}</span>
                                                    <span>📍 {log.metadata.ip}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem' }}>
                <div className="animate-fade-in mobile-stack" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '2rem',
                    borderRadius: '2rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                }}>
                    <div className="mobile-text-center">
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-2px' }}>Account <span style={{ color: 'var(--primary-color)' }}>Ledger</span></h1>
                        <p style={{ color: '#555', fontWeight: '700', marginTop: '10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Administrative Authority • Secure Node
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>{users.length}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#444', textTransform: 'uppercase' }}>Records</div>
                        </div>
                        <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1.5rem' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary-color)' }}>{users.filter(u => u.role === 'admin').length}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#444', textTransform: 'uppercase' }}>Admins</div>
                        </div>
                    </div>
                </div>

                <div className="animate-fade-in mobile-stack" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    padding: '0 1rem'
                }}>
                    <div style={{ position: 'relative' }} className="mobile-full-width">
                        <input
                            type="text"
                            placeholder="Filter ledger records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mobile-full-width"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                padding: '0.8rem 1.2rem',
                                paddingLeft: '3rem',
                                color: '#fff',
                                width: '350px',
                                outline: 'none',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: '0.3s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>🔍</span>
                    </div>

                    <div className="mobile-stack" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setActiveTab('users')} className="mobile-full-width" style={{ background: activeTab === 'users' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.03)', color: activeTab === 'users' ? '#000' : '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' }}>
                            Users
                        </button>
                        <button onClick={() => setActiveTab('requests')} className="mobile-full-width" style={{ background: activeTab === 'requests' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.03)', color: activeTab === 'requests' ? '#000' : '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' }}>
                            Requests
                            {(requests.filter(r => r.status === 'pending').length > 0) && (
                                <span style={{ marginLeft: '6px', background: '#ff4d4d', color: '#fff', borderRadius: '50px', padding: '2px 6px', fontSize: '0.7rem' }}>{requests.filter(r => r.status === 'pending').length}</span>
                            )}
                        </button>
                        <button onClick={() => navigate('/admin/add-user')} className="mobile-full-width" style={{ background: 'var(--primary-gradient)', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0, 210, 255, 0.1)' }}>
                            Register User
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="mobile-full-width" style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                            Exit Console
                        </button>
                    </div>
                </div>

                {message && (
                    <div className="animate-fade-in" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-color)', padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(var(--primary-rgb), 0.2)', fontWeight: 'bold', textAlign: 'center' }}>
                        ✨ {message}
                    </div>
                )}

                <div style={{ overflowX: 'auto', background: 'rgba(13, 13, 15, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.5rem', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                    {activeTab === 'users' ? (
                        <table className="mobile-admin-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#444', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <th style={{ padding: '0 2rem' }}>Identity</th>
                                    <th style={{ padding: '0 1rem' }}>Status</th>
                                    <th style={{ padding: '0 1rem' }}>Privileges</th>
                                    <th className="mobile-hide" style={{ padding: '0 1rem' }}>Registered</th>
                                    <th style={{ padding: '0 2rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && users.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: '#555', fontWeight: '800' }}>INITIALIZING DATABASE HANDLER...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: '#444', fontWeight: '800' }}>NO MATCHING RECORDS FOUND</td></tr>
                                ) : filteredUsers.map(user => (
                                    <tr key={user._id} style={{ background: 'rgba(255,255,255,0.01)', transition: '0.2s', borderRadius: '14px', opacity: user.isActive === false ? 0.6 : 1 }}>
                                        {editingUserId === user._id ? (
                                            <>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <input value={editData.username} onChange={e => setEditData({ ...editData, username: e.target.value })} style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '10px 15px', borderRadius: '10px', width: '100%', outline: 'none' }} placeholder="Username" />
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '10px 15px', borderRadius: '10px', width: '100%', outline: 'none' }} placeholder="Email" />
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <select value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })} style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '10px', width: '100%', outline: 'none', marginBottom: '8px' }}>
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <input type="password" placeholder="New Password (optional)" onChange={e => setEditData({ ...editData, password: e.target.value })} style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '10px 15px', borderRadius: '10px', width: '100%', outline: 'none' }} />
                                                </td>
                                                <td className="mobile-hide" style={{ padding: '1.5rem 2rem', color: '#444', fontStyle: 'italic', fontSize: '0.8rem' }}>Syncing...</td>
                                                <td className="mobile-actions-cell" style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                                    <button onClick={handleUpdateUser} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '900', margin: '0 5px', cursor: 'pointer' }}>Commit</button>
                                                    <button onClick={() => setEditingUserId(null)} style={{ background: 'transparent', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>Abort</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ padding: '1.5rem 2rem', fontWeight: '800', fontSize: '1rem', minWidth: '150px' }}>
                                                    <span onClick={() => fetchIntelligence(user._id)} style={{ cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'underline' }}>
                                                        {user.username}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <span style={{
                                                        background: user.isActive === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                        color: user.isActive === false ? '#ef4444' : '#22c55e',
                                                        padding: '6px 12px',
                                                        borderRadius: '50px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '900',
                                                        textTransform: 'uppercase',
                                                        whiteSpace: 'nowrap',
                                                        border: `1px solid ${user.isActive === false ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
                                                    }}>
                                                        {user.isActive === false ? 'Restricted' : 'Active'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <span style={{ background: user.role === 'admin' ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.03)', color: user.role === 'admin' ? 'var(--primary-color)' : '#666', padding: '6px 12px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase' }}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="mobile-hide" style={{ padding: '1.5rem 2rem', color: '#444', fontSize: '0.8rem', fontWeight: '700' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="mobile-actions-cell" style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                                    <div className="mobile-actions-cell">
                                                        <button onClick={() => handleToggleStatus(user)} style={{ background: user.isActive === false ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.02)', color: user.isActive === false ? '#22c55e' : '#fff', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', marginRight: '10px', cursor: 'pointer', fontWeight: '800' }}>
                                                            {user.isActive === false ? 'Activate' : 'Deactivate'}
                                                        </button>
                                                        <button onClick={() => handleEditClick(user)} style={{ background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', marginRight: '10px', cursor: 'pointer', fontWeight: '800' }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.02)'}>Modify</button>
                                                        {user.role !== 'admin' && (
                                                            <button onClick={() => handleDeleteUser(user._id, user.username)} style={{ background: 'rgba(255, 77, 77, 0.05)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.1)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800' }} onMouseOver={e => { e.target.style.background = '#ff4d4d'; e.target.style.color = '#fff' }} onMouseOut={e => { e.target.style.background = 'rgba(255, 77, 77, 0.05)'; e.target.style.color = '#ff4d4d' }}>Purge</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="mobile-admin-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#444', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <th style={{ padding: '0 2rem' }}>Name / Info</th>
                                    <th style={{ padding: '0 1rem' }}>Contact</th>
                                    <th style={{ padding: '0 1rem' }}>Status</th>
                                    <th style={{ padding: '0 2rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '5rem', color: '#444', fontWeight: '800' }}>NO DEMO REQUESTS YET</td></tr>
                                ) : requests.map(req => (
                                    <tr key={req._id} style={{ background: 'rgba(255,255,255,0.01)', transition: '0.2s', borderRadius: '14px' }}>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '800', fontSize: '1rem' }}>
                                            <div style={{ color: '#fff' }}>{req.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 600 }}>{req.email}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#555', fontWeight: 600 }}>Age: {req.age} | {req.state}</div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ color: '#fff', fontSize: '0.85rem' }}>+91 {req.contactNumber}</div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{
                                                background: req.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : req.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#22c55e' : '#ef4444',
                                                padding: '6px 12px',
                                                borderRadius: '50px',
                                                fontSize: '0.65rem',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                border: `1px solid ${req.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : req.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                            }}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="mobile-actions-cell" style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            {req.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleApproveRequest(req._id, req.name, req.email)} style={{ background: 'var(--primary-gradient)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800' }}>
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleRejectRequest(req._id, req.name)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800' }}>
                                                        Deny
                                                    </button>
                                                </div>
                                            )}
                                            {req.status === 'approved' && (
                                                <span style={{ fontSize: '0.8rem', color: '#555', fontStyle: 'italic', fontWeight: '700' }}>Approved & Redirected</span>
                                            )}
                                            {req.status === 'rejected' && (
                                                <span style={{ fontSize: '0.8rem', color: '#ef4444', fontStyle: 'italic', fontWeight: '700' }}>Access Denied</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;
