import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await registerUser({ username, email, password });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="mobile-padding-sm" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top left, #111, #050505)',
            padding: '2rem'
        }}>
            <div className="animate-fade-in mobile-padding-sm" style={{
                padding: '3.5rem 3rem',
                background: 'rgba(13, 13, 15, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '480px'
            }}>
                <div style={{
                    width: '70px',
                    height: '70px',
                    background: 'var(--primary-gradient)',
                    borderRadius: '1.2rem',
                    margin: '0 auto 2rem auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    color: '#000',
                    fontWeight: '900',
                    boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.3)'
                }}>HT</div>

                <h1 style={{ marginBottom: '0.8rem', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>Create Account</h1>
                <p style={{ marginBottom: '3rem', color: '#888', fontSize: '1rem', fontWeight: '500' }}>Start your journey to consistency.</p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '14px',
                        marginBottom: '2rem',
                        fontSize: '0.9rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>USERNAME</label>
                        <input
                            type="text"
                            placeholder="Unique Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                borderRadius: '14px',
                                background: '#0a0a0c',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                borderRadius: '14px',
                                background: '#0a0a0c',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                borderRadius: '14px',
                                background: '#0a0a0c',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: '1.2rem',
                            borderRadius: '16px',
                            background: 'var(--primary-gradient)',
                            color: '#000',
                            fontWeight: '900',
                            fontSize: '1.05rem',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            boxShadow: '0 15px 40px rgba(0, 114, 255, 0.2)'
                        }}
                    >
                        Create My Account
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '700' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
