import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('dt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercept responses for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, {
                    withCredentials: true
                });

                localStorage.setItem('dt_token', data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                return api(originalRequest);
            } catch (err) {
                // Refresh failed - logout user
                localStorage.removeItem('dt_token');
                localStorage.removeItem('dt_user');
                window.location.href = '/auth';
                return Promise.reject(err);
            }
        }

        // Extract real error message from backend
        const message = error.response?.data?.error || error.message || 'Something went wrong';
        error.message = message;

        return Promise.reject(error);
    }
);

export default api;
