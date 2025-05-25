import api from '@/common/api/api.js';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            Authorization: `${token}`,
        };
    }
    return {};
};

export const handleUnauthorized = () => {
    console.log('401 Unauthorized received. Redirecting to login...');
    window.location.href = '/login';
};

export const getCurrentUser = async () => {
    try {
        const headers = getAuthHeaders();
        if (!headers.Authorization) {
            console.warn('No authorization token found. Redirecting to login...');
            handleUnauthorized();
            return null;
        }

        const response = await api.get('/api/users/me', { headers });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.warn('401 Unauthorized response received. Redirecting to login...');
            handleUnauthorized();
        } else {
            console.error('Error fetching current user:', error);
        }
        throw error;
    }
};

export const authService = {
    getAuthHeaders,
    handleUnauthorized,
    getCurrentUser
};
