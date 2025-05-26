// This file defines a centralized Axios instance for making HTTP requests to the backend API.
// It includes a base URL configuration and an interceptor for handling responses and errors.

import axios from 'axios';

// Create an Axios instance with a base URL sourced from environment variables.
// The base URL point to the backend API endpoint.
const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
});

// Add a response interceptor to handle API responses and errors globally.
api.interceptors.response.use(
    // On successful response, simply return the response object.
    (response) => response,

    // On error, handle specific cases such as unauthorized access (401).
    (error) => {
        console.error('Axios Interceptor: Response error:', error);

        // Handle 401 Unauthorized errors by clearing the token and redirecting the user.
        if (error.response && error.response.status === 401) {
            console.log('Axios Interceptor: 401 detected. Cleaning up and redirecting.');

            // Remove the token from local storage to log the user out.
            localStorage.removeItem('token');

            // Clear the Authorization header for future requests.
            api.defaults.headers.common['Authorization'] = '';

            // Ensure the error response contains a meaningful message.
            if (!error.response.data) error.response.data = {};
            if (!error.response.data.message || typeof error.response.data.message !== 'string') {
                error.response.data.message = 'Session expired, unauthorized access, or invalid credentials.';
            }

            // Set the error message for frontend error handling.
            error.message = error.response.data.message;

            // Reject the promise with the error object.
            return Promise.reject(error);
        }

        // For other errors, reject the promise without additional handling.
        return Promise.reject(error);
    }
);

// Export the Axios instance for use throughout the application.
// This ensures consistent API communication and centralized error handling.
export default api;