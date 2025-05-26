import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeUsers = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.users)) return data.users;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  };

  // Accept params in fetchAllUsers and pass to userService.getAllUsers
  const fetchAllUsers = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers(params);
      setUsers(normalizeUsers(data));
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError({ general: errorMessage, fields: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getCurrentUser();
      setCurrentUser(data);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch current user';
      setError({ general: errorMessage, fields: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUser = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.createUser(userData);
      await fetchAllUsers();
      return { success: true, message: result.message, user: result.username };
    } catch (err) {
      const errorMessage = err.message || 'Failed to create user';
      const fieldErrors = err.errors || null;
      setError({ general: errorMessage, fields: fieldErrors });
      return { success: false, message: errorMessage, errors: fieldErrors };
    } finally {
      setIsLoading(false);
    }
  };

  const editUser = async (userId, userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.updateUser(userId, userData);
      await fetchAllUsers();
      return { success: true, message: result.message, user: result.user };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update user';
      const fieldErrors = err.errors || null;
      setError({ general: errorMessage, fields: fieldErrors });
      return { success: false, message: errorMessage, errors: fieldErrors };
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (userId, userIdNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.deleteUser(userId, userIdNumber);
      await fetchAllUsers();
      return { success: true, message: result.message };
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      return { success: false, message: err.message || 'Failed to delete user' };
    } finally {
      setIsLoading(false);
    }
  };

  const adminRevokeTokens = async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const message = await userService.revokeUserTokens(userId);
      return { success: true, message };
    } catch (err) {
      setError(err.message || 'Failed to revoke tokens');
      return { success: false, message: err.message || 'Failed to revoke tokens' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    currentUser,
    isLoading,
    error,
    fetchAllUsers,
    fetchCurrentUser,
    addUser,
    editUser,
    removeUser,
    adminRevokeTokens,
    getUserById: userService.getUserById,
    getUserByIdNumber: userService.getUserByIdNumber,
  };
};