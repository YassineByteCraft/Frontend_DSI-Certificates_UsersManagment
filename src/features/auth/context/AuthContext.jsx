import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/common/api/api.js';
import { getCurrentUser } from '@/features/auth/services/authService';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  checkAuthStatus: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `${token}`;
      return { isAuthenticated: false, user: null, token, isLoading: true, error: null };
    }
    api.defaults.headers.common['Authorization'] = '';
    return { isAuthenticated: false, user: null, token: null, isLoading: false, error: null };
  });

  // Keep axios header in sync
  useEffect(() => {
    if (auth.token) {
      api.defaults.headers.common['Authorization'] = `${auth.token}`;
    } else {
      api.defaults.headers.common['Authorization'] = '';
    }
  }, [auth.token]);

  // Verify token and load user data
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const userData = await getCurrentUser();
        setAuth({
          isAuthenticated: true,
          user: userData,
          token: auth.token,
          isLoading: false,
          error: null,
        });
        console.log('Token verified successfully.');
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = '';
        setAuth({ isAuthenticated: false, user: null, token: null, isLoading: false, error: null });
      }
    };

    if (auth.token && auth.isLoading) {
      verifyToken().then(r => {
        console.log('Token verification completed.');
      });
    }
  }, [auth.token, auth.isLoading]);

  const login = async (username, password) => {
    setAuth(prev => ({
        ...prev,
        isLoading: true,
        error: null // Clear previous errors from AuthContext before new attempt
    }));
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token } = response.data;

      // The backend sends success: false for suspended/deleted users,
      // so this 'if (token)' block won't be hit for those cases.
      // The error will be caught by the catch block below due to the 401.
      if (token) { // Assuming token is only present on actual success
        localStorage.setItem('token', token);
        // api.defaults.headers.common['Authorization'] = `${token}`; // Already handled by useEffect [auth.token]

        const userData = await getCurrentUser(); // This might also throw if user data can't be fetched post-login
        setAuth({ isAuthenticated: true, user: userData, token, isLoading: false, error: null });
        return response.data; // Or just return true / user data
      } else {
        // This else block might be redundant if backend always sends 401 for these cases.
        // If backend sends 200 OK with success:false, this would be hit.
        const errorMsg = response.data?.message || 'Login failed due to an unexpected response format.';
        setAuth(prev => ({ ...prev, isLoading: false, error: errorMsg }));
        throw new Error(errorMsg);
      }
    } catch (error) {
            console.error('AuthContext Login error:', error);
            let errorMsg = error.message || 'An unexpected error occurred during login.';
            if (typeof errorMsg !== 'string' || !errorMsg.trim()) {
                errorMsg = 'Login failed. Please try again.';
            }
            setAuth(prev => ({
                ...prev,
                isLoading: false,
                error: errorMsg // Set the error in AuthContext
            }));
            throw new Error(errorMsg); // Re-throw for LoginPage to catch and use its local dialog state
        }
    };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    setAuth({ isAuthenticated: false, user: null, token: null, isLoading: false, error: null });
  };

  const clearAuthError = () => {
      setAuth(prev => ({ ...prev, error: null }));
      console.log("AuthContext: Auth error cleared.");
  };

  const checkAuthStatus = async () => {
    if (!auth.token) {
      setAuth(prev => ({ ...prev, isAuthenticated: false, user: null, isLoading: false }));
      return false;
    }
    setAuth(prev => ({ ...prev, isLoading: true }));
    try {
      const userData = await getCurrentUser();
      setAuth(prev => ({ ...prev, isAuthenticated: true, user: userData, isLoading: false, error: null }));
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      api.defaults.headers.common['Authorization'] = '';
      setAuth({ isAuthenticated: false, user: null, token: null, isLoading: false, error: null });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, checkAuthStatus, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);