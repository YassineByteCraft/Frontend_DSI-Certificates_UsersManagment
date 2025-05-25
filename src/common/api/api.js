import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Axios Interceptor: Response error:', error);
        if (error.response && error.response.status === 401) {
            console.log('Axios Interceptor: 401 detected. Cleaning up and redirecting.');
            localStorage.removeItem('token');
            api.defaults.headers.common['Authorization'] = '';

            // If backend sends a message, keep it. Otherwise, set a fallback message.
            if (!error.response.data) error.response.data = {};
            if (!error.response.data.message || typeof error.response.data.message !== 'string') {
                error.response.data.message = 'Session expirée, accès non autorisé, ou identifiants invalides.';
            }
            // Always set error.message for frontend error handling
            error.message = error.response.data.message;
            return Promise.reject(error);
        }
        // For other errors, just reject the promise
        return Promise.reject(error);
    }
);
export default api;