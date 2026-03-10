import axios from 'axios';

// Determine the API URL:
// - In production (VITE_API_URL starts with http): use the full deployed backend URL
// - In development (no http URL set): use '/api' which Vite proxies to http://localhost:5000
//   (This avoids CORS since browser treats it as same-origin)
const rawUrl = import.meta.env.VITE_API_URL || '';

let API_URL;
if (rawUrl && rawUrl.startsWith('http')) {
    // Production: full URL provided (e.g. https://habit-qed4.onrender.com/api)
    API_URL = rawUrl.replace(/\/$/, ''); // remove trailing slash
    if (!API_URL.endsWith('/api')) {
        API_URL = `${API_URL}/api`;
    }
} else {
    // Development: use Vite proxy (same-origin, no CORS issues)
    API_URL = '/api';
}

console.log(`🔌 API initialized at: ${API_URL}`);



// Axios Interceptor for Deactivation/Auth failures
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403 && error.response.data.message.includes("Deactivated")) {
            localStorage.removeItem('user');
            window.location.href = '/login?error=deactivated';
        }
        return Promise.reject(error);
    }
);

// Helper to get auth header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

// Local storage helpers for persistence when server is down
const getLocalHabits = () => JSON.parse(localStorage.getItem('habits_fallback')) || [];
const saveLocalHabits = (habits) => localStorage.setItem('habits_fallback', JSON.stringify(habits));

export const fetchHabits = async () => {
    try {
        const response = await axios.get(`${API_URL}/habits`, { headers: getAuthHeader() });
        saveLocalHabits(response.data); // Sync local with server
        return response.data;
    } catch (err) {
        console.warn("Backend unreachable, using local persistence");
        return getLocalHabits();
    }
};

export const createHabit = async (habitData) => {
    try {
        const response = await axios.post(`${API_URL}/habits`, habitData, { headers: getAuthHeader() });
        const habits = getLocalHabits();
        saveLocalHabits([...habits, response.data]);
        return response.data;
    } catch (err) {
        const habits = getLocalHabits();
        const newHabit = {
            _id: 'local_' + Date.now(),
            ...habitData,
            completedDates: [],
            streak: 0,
            isArchived: false,
            createdAt: new Date().toISOString()
        };
        saveLocalHabits([...habits, newHabit]);
        return newHabit;
    }
};

export const toggleHabit = async (id, date) => {
    try {
        const response = await axios.patch(`${API_URL}/habits/${id}/toggle`, { date }, { headers: getAuthHeader() });
        const habits = getLocalHabits().map(h => h._id === id ? response.data : h);
        saveLocalHabits(habits);
        return response.data;
    } catch (err) {
        const habits = getLocalHabits().map(h => {
            if (h._id === id) {
                const dates = [...h.completedDates];
                const index = dates.indexOf(date);
                if (index > -1) dates.splice(index, 1);
                else dates.push(date);
                return { ...h, completedDates: dates };
            }
            return h;
        });
        saveLocalHabits(habits);
        return habits.find(h => h._id === id);
    }
};

export const archiveHabit = async (id, status = true) => {
    try {
        const response = await axios.patch(`${API_URL}/habits/${id}/archive`, { isArchived: status }, { headers: getAuthHeader() });
        const habits = getLocalHabits().map(h => h._id === id ? response.data : h);
        saveLocalHabits(habits);
        return response.data;
    } catch (err) {
        const habits = getLocalHabits().map(h => h._id === id ? { ...h, isArchived: status } : h);
        saveLocalHabits(habits);
        return habits.find(h => h._id === id);
    }
};

export const deleteHabit = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/habits/${id}`, { headers: getAuthHeader() });
        const localHabits = getLocalHabits();
        const exists = localHabits.find(h => h._id === id);
        if (exists) {
            saveLocalHabits(localHabits.map(h => h._id === id ? response.data.habit : h));
        } else {
            saveLocalHabits([...localHabits, response.data.habit]);
        }
    } catch (err) {
        const habits = getLocalHabits().filter(h => h._id !== id);
        saveLocalHabits(habits);
    }
};

export const updateHabit = async (id, habitData) => {
    try {
        const response = await axios.put(`${API_URL}/habits/${id}`, habitData, { headers: getAuthHeader() });
        const habits = getLocalHabits().map(h => h._id === id ? response.data : h);
        saveLocalHabits(habits);
        return response.data;
    } catch (err) {
        const habits = getLocalHabits().map(h => h._id === id ? { ...h, ...habitData } : h);
        saveLocalHabits(habits);
        return habits.find(h => h._id === id);
    }
};

export const addHabitNote = async (id, date, note) => {
    try {
        const response = await axios.post(`${API_URL}/habits/${id}/note`, { date, note }, { headers: getAuthHeader() });
        const habits = getLocalHabits().map(h => h._id === id ? response.data : h);
        saveLocalHabits(habits);
        return response.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const fetchBinHabits = async () => {
    const response = await axios.get(`${API_URL}/habits/bin`, { headers: getAuthHeader() });
    return response.data;
};

export const restoreHabit = async (id) => {
    const response = await axios.post(`${API_URL}/habits/${id}/restore`, {}, { headers: getAuthHeader() });
    const localHabits = getLocalHabits();
    const exists = localHabits.find(h => h._id === id);
    let updatedHabits;
    if (exists) {
        updatedHabits = localHabits.map(h => h._id === id ? response.data : h);
    } else {
        updatedHabits = [...localHabits, response.data];
    }
    saveLocalHabits(updatedHabits);
    return response.data;
};

export const permanentDeleteHabit = async (id) => {
    await axios.delete(`${API_URL}/habits/${id}/permanent`, { headers: getAuthHeader() });
    const habits = getLocalHabits().filter(h => h._id !== id);
    saveLocalHabits(habits);
};

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

export const adminCreateUser = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/admin/create-user`, userData, { headers: getAuthHeader() });
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
};

export const resetPassword = async (data) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, data);
    return response.data;
};

export const adminFetchUsers = async () => {
    const response = await axios.get(`${API_URL}/auth/admin/users`, { headers: getAuthHeader() });
    return response.data;
};

export const adminUpdateUser = async (id, userData) => {
    const response = await axios.put(`${API_URL}/auth/admin/users/${id}`, userData, { headers: getAuthHeader() });
    return response.data;
};

export const adminDeleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/auth/admin/users/${id}`, { headers: getAuthHeader() });
    return response.data;
};

export const logoutUser = async (durationMinutes) => {
    const response = await axios.post(`${API_URL}/auth/logout`, { durationMinutes }, { headers: getAuthHeader() });
    return response.data;
};

export const recordSessionPulse = async (durationMinutes) => {
    const response = await axios.post(`${API_URL}/auth/session-pulse`, { durationMinutes }, { headers: getAuthHeader() });
    return response.data;
};

export const adminFetchUserIntelligence = async (id) => {
    const response = await axios.get(`${API_URL}/auth/admin/user-intelligence/${id}`, { headers: getAuthHeader() });
    return response.data;
};

// Web Push APIs
export const getVapidKey = async () => {
    const response = await axios.get(`${API_URL}/push/vapidPublicKey`, { headers: getAuthHeader() });
    return response.data;
};

export const subscribePush = async (subscription, reminderTime) => {
    const response = await axios.post(`${API_URL}/push/subscribe`, { subscription, reminderTime }, { headers: getAuthHeader() });
    return response.data;
};

export const unsubscribePush = async () => {
    const response = await axios.post(`${API_URL}/push/unsubscribe`, {}, { headers: getAuthHeader() });
    return response.data;
};

export const getPushSettings = async () => {
    const response = await axios.get(`${API_URL}/push/settings`, { headers: getAuthHeader() });
    return response.data;
};

// Demo User APIs
export const loginDemo = async () => {
    const response = await axios.post(`${API_URL}/demo/login`);
    return response.data;
};

export const clearDemoData = async () => {
    const response = await axios.post(`${API_URL}/demo/clear`, {}, { headers: getAuthHeader() });
    return response.data;
};

export const submitDemoRequest = async (requestData) => {
    const response = await axios.post(`${API_URL}/demo/request-admin`, requestData, { headers: getAuthHeader() });
    return response.data;
};

export const fetchDemoRequests = async () => {
    const response = await axios.get(`${API_URL}/demo/requests`, { headers: getAuthHeader() });
    return response.data;
};

export const approveDemoRequest = async (id) => {
    const response = await axios.put(`${API_URL}/demo/requests/${id}/approve`, {}, { headers: getAuthHeader() });
    return response.data;
};

export const rejectDemoRequest = async (id) => {
    const response = await axios.put(`${API_URL}/demo/requests/${id}/reject`, {}, { headers: getAuthHeader() });
    return response.data;
};
