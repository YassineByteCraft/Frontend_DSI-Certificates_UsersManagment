import api from '@/common/api/api.js';

const API_URL = '/api/users';

// Fetch all users
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get(API_URL, { params });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    } else {
      console.error('Error fetching users:', error.response?.data || error.message);
    }
    throw error.response?.data || error;
  }
};

// Fetch a single user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Fetch a single user by ID Number
export const getUserByIdNumber = async (idNumber) => {
  try {
    const response = await api.get(`${API_URL}/by-id-number/${idNumber}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID number ${idNumber}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    if (!userData.password || userData.password.trim() === '') {
      throw new Error('Password is required for creating a new user.');
    }
    const response = await api.post(API_URL, userData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`${API_URL}/${userId}`, userData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId, userIdNumber) => {
  try {
    const response = await api.delete(`${API_URL}/${userId}`, {
      data: { userIdNumber },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


// Fetch current user details
export const getCurrentUser = async () => {
  try {
    const response = await api.get(`${API_URL}/me`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Revoke tokens for a user (Admin)
export const revokeUserTokens = async (userId) => {
  try {
    const response = await api.post(`${API_URL}/${userId}/revoke-tokens`);
    return response.data;
  } catch (error) {
    console.error(`Error revoking tokens for user ID ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

const userService = {
  getAllUsers,
  getUserById,
  getUserByIdNumber,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  revokeUserTokens,
};

export default userService;