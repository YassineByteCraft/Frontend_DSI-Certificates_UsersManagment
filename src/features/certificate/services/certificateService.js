import api from '@/common/api/api.js';

const API_URL = `/api/certificats`;

// Fetch all certificates
export const getAllCertificates = async (params = {}) => {
  try {
    const response = await api.get(API_URL, { params });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    } else {
      console.error('Error fetching certificates:', error.response?.data || error.message);
    }
    throw error.response?.data || error;
  }
};

// Fetch a single certificate by ID
export const getCertificateById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching certificate with ID ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Create a new certificate
export const createCertificate = async (certificateData) => {
  try {
    const response = await api.post(API_URL, certificateData);
    return response.data;
  } catch (error) {
    console.error('Error creating certificate:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update an existing certificate
export const updateCertificate = async (id, certificateData) => {
  console.log("ID passed to updateCertificate:", id);
  console.log("Certificate data being updated:", certificateData);
  try {
    const response = await api.put(`${API_URL}/${id}`, certificateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating certificate with ID ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


// Delete a certificate
export const deleteCertificate = async (certificateId) => {
  try {
    const response = await api.delete(`${API_URL}/${certificateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting certificate with ID ${certificateId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

const certificateService = {
  getAllCertificates,
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};

export default certificateService;
