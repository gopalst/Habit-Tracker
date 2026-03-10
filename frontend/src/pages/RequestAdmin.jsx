import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitDemoRequest } from '../services/api';

const RequestAdmin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        dob: '',
        contactNumber: '',
        state: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const indianStates = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
        "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'contactNumber' && !/^\d{0,10}$/.test(value)) return;

        let newFormData = { ...formData, [name]: value };

        if (name === 'dob' && value) {
            const birthDate = new Date(value);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }

            newFormData.age = calculatedAge >= 0 ? calculatedAge.toString() : '';
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.contactNumber.length !== 10) {
            setStatus({ type: 'error', message: 'Contact number must be exactly 10 digits.' });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await submitDemoRequest(formData);
            setStatus({ type: 'success', message: 'Request submitted successfully! Waiting for admin approval.' });
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to submit request.' });
            setIsSubmitting(false);
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
                padding: '3rem 3rem',
                background: 'rgba(13, 13, 15, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
                width: '100%',
                maxWidth: '500px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--primary-gradient)',
                        borderRadius: '1.2rem',
                        margin: '0 auto 1.5rem auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: '#000',
                        fontWeight: '900',
                        boxShadow: '0 10px 30px rgba(var(--primary-rgb), 0.3)'
                    }}>HT</div>
                    <h1 style={{ marginBottom: '0.8rem', fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Request Admin Access</h1>
                    <p style={{ marginBottom: '2rem', color: '#888', fontSize: '0.9rem', fontWeight: '500' }}>Submit your details to gain full access.</p>
                </div>

                {status.message && (
                    <div style={{
                        background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: status.type === 'error' ? '#ef4444' : '#10b981',
                        padding: '1rem',
                        borderRadius: '14px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                        textAlign: 'center'
                    }}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#555', marginBottom: '6px', display: 'block' }}>FULL NAME</label>
                            <input required name="name" type="text" value={formData.name} onChange={handleChange} style={inputStyles} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#555', marginBottom: '6px', display: 'block' }}>EMAIL</label>
                            <input required name="email" type="email" value={formData.email} onChange={handleChange} style={inputStyles} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#555', marginBottom: '6px', display: 'block' }}>DATE OF BIRTH</label>
                            <input required name="dob" type="date" value={formData.dob} onChange={handleChange} style={inputStyles} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#555', marginBottom: '6px', display: 'block' }}>AGE (AUTO)</label>
                            <input readOnly name="age" type="number" value={formData.age} style={{ ...inputStyles, opacity: 0.6, cursor: 'not-allowed' }} placeholder="Select DOB" />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#555', marginBottom: '6px', display: 'block' }}>CONTACT (+91)</label>
                        <div style={{ display: 'flex' }}>
                            <div style={{ background: '#111', padding: '0.9rem', border: '1px solid rgba(255,255,255,0.05)', borderRight: 'none', borderRadius: '12px 0 0 12px', color: '#888', fontWeight: '600', display: 'flex', alignItems: 'center' }}>+91</div>
                            <input required name="contactNumber" type="text" placeholder="10 Digits" value={formData.contactNumber} onChange={handleChange} style={{ ...inputStyles, borderRadius: '0 12px 12px 0', borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#555', marginBottom: '6px', display: 'block' }}>STATE</label>
                        <select required name="state" value={formData.state} onChange={handleChange} style={{ ...inputStyles, appearance: 'none', cursor: 'pointer' }}>
                            <option value="" disabled>Select your state</option>
                            {indianStates.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '1.2rem', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '1.2rem', background: 'var(--primary-gradient)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const inputStyles = {
    width: '100%',
    padding: '0.9rem',
    borderRadius: '12px',
    background: '#0a0a0c',
    border: '1px solid rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box'
};

export default RequestAdmin;
