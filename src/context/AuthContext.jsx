import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const AuthCtx = createContext(null);

// Loads the projects list and sets the active project if one is saved
async function syncProjectsFromDB() {
    const { setProjects, setActiveBusiness, setScenarios, activeProjectId } = useAppStore.getState();
    try {
        const res = await api.get('/business');
        if (res.data?.success) {
            const projects = res.data.data || [];
            const serverActiveId = res.data.activeProjectId;
            setProjects(projects);

            // Determine which project to load:
            // 1. The server's saved activeProjectId
            // 2. The client's persisted activeProjectId (from localStorage)
            // 3. If neither — do NOT auto-load anything (show ProjectSelector)
            const resolvedId = serverActiveId || activeProjectId;
            if (resolvedId && projects.length > 0) {
                const active = projects.find(p => p._id === resolvedId);
                if (active) {
                    setActiveBusiness(active.config);
                    setScenarios(active.scenarios || []);
                    useAppStore.getState().setActiveProjectId(active._id);
                    return { hasProject: true, projects };
                }
            }
            // No active project to restore — let App show ProjectSelector
            setActiveBusiness(null);
            setScenarios([]);
            useAppStore.getState().setActiveProjectId(null);
            return { hasProject: false, projects };
        }
    } catch (err) {
        console.warn('[Auth] Could not sync projects:', err.message);
    }
    return { hasProject: false, projects: [] };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ─── Session Restore ────────────────────────────────────
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('dt_token');
            const savedUser = localStorage.getItem('dt_user');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get('/auth/me');
                if (res.data?.success && res.data.data) {
                    const userData = res.data.data;
                    setUser(userData);
                    localStorage.setItem('dt_user', JSON.stringify(userData));
                    await syncProjectsFromDB();
                } else {
                    throw new Error('Invalid session');
                }
            } catch (err) {
                console.warn('[Auth] Session restoration failed:', err.message);
                try {
                    const parsed = JSON.parse(savedUser);
                    if (parsed?.email) {
                        setUser(parsed);
                    } else {
                        localStorage.removeItem('dt_token');
                        localStorage.removeItem('dt_user');
                    }
                } catch {
                    localStorage.removeItem('dt_token');
                    localStorage.removeItem('dt_user');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // ─── Save auth to storage ───────────────────────────────
    const saveAuth = useCallback((accessToken, userData) => {
        localStorage.setItem('dt_token', accessToken);
        localStorage.setItem('dt_user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    // ─── Signup ─────────────────────────────────────────────
    const signup = useCallback(async (email, password, name, phone) => {
        const res = await api.post('/auth/signup', { email, password, name, phone });
        if (!res.data.success) throw new Error(res.data.error || 'Signup failed');

        if (res.data.requiresOTP) {
            return { requiresOTP: true, email: res.data.email, code: res.data.code, message: res.data.message };
        }

        if (res.data.accessToken) {
            saveAuth(res.data.accessToken, res.data.user);
        }
        return res.data;
    }, [saveAuth]);

    // ─── Login ──────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (!res.data.success) throw new Error(res.data.error || 'Login failed');

        if (res.data.requiresOTP) {
            return { requiresOTP: true, email: res.data.email, code: res.data.code, message: res.data.message };
        }

        saveAuth(res.data.accessToken, res.data.user);
        await syncProjectsFromDB();
        return res.data;
    }, [saveAuth]);

    // ─── Verify OTP ─────────────────────────────────────────
    const verifyOTP = useCallback(async (email, code) => {
        const res = await api.post('/auth/verify-otp', { email, code });
        if (!res.data.success) throw new Error(res.data.error || 'Verification failed');

        saveAuth(res.data.accessToken, res.data.user);
        await syncProjectsFromDB();
        return res.data;
    }, [saveAuth]);

    // ─── Resend OTP ─────────────────────────────────────────
    const resendOTP = useCallback(async (email) => {
        const res = await api.post('/auth/resend-otp', { email });
        if (!res.data.success) throw new Error(res.data.error || 'Could not resend code');
        return res.data;
    }, []);

    // ─── Google Login ───────────────────────────────────────
    const googleLogin = useCallback(async () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId || clientId === 'your_google_client_id_here') {
            throw new Error('Google Client ID not configured. Please add it to your .env file.');
        }

        if (!window.google?.accounts?.id) {
            throw new Error('Google Sign-In script not loaded. Check your index.html.');
        }

        return new Promise((resolve, reject) => {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response) => {
                    try {
                        const res = await api.post('/auth/google', { credential: response.credential });
                        if (!res.data.success) throw new Error(res.data.error);
                        saveAuth(res.data.accessToken, res.data.user);
                        await syncProjectsFromDB();
                        resolve(res.data);
                    } catch (err) {
                        reject(new Error(err.response?.data?.error || err.message));
                    }
                },
                auto_select: false,
                ux_mode: 'popup'
            });

            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    reject(new Error('Google popup blocked or not displayed.'));
                }
            });
        });
    }, [saveAuth]);

    // ─── Forgot Password ────────────────────────────────────
    const forgotPassword = useCallback(async (email) => {
        const res = await api.post('/auth/forgot-password', { email });
        if (!res.data.success) throw new Error(res.data.error || 'Request failed');
        return res.data;
    }, []);

    // ─── Reset Password ──────────────────────────────────────
    const resetPassword = useCallback(async (token, password) => {
        const res = await api.post(`/auth/reset-password/${token}`, { password });
        if (!res.data.success) throw new Error(res.data.error || 'Reset failed');
        if (res.data.accessToken) {
            saveAuth(res.data.accessToken, res.data.user);
        }
        return res.data;
    }, [saveAuth]);

    // ─── Social Login (legacy) ──────────────────────────────
    const socialLogin = useCallback(async (provider) => {
        const res = await api.post('/auth/social-login', { provider });
        if (!res.data.success) throw new Error(res.data.error || 'Social login failed');
        saveAuth(res.data.accessToken, res.data.user);
        return res.data;
    }, [saveAuth]);

    // ─── Logout ─────────────────────────────────────────────
    const logout = useCallback(async () => {
        api.post('/auth/logout').catch(() => { });

        const { resetStore } = useAppStore.getState();
        resetStore();

        localStorage.removeItem('dt_token');
        localStorage.removeItem('dt_user');

        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        socialLogin,
        verifyOTP,
        resendOTP,
        isAuthenticated: !!user,
        googleLogin,
        forgotPassword,
        resetPassword,
        syncProjectsFromDB,
    };

    return (
        <AuthCtx.Provider value={value}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
