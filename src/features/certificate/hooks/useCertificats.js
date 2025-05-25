import { useState, useEffect, useCallback } from 'react';
import certificateService from '../services/certificateService';

export const useCertificats = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to normalize certificates data to always be an array from the Page object
  const normalizeCertificates = (pageData) => {
    // Assuming Spring Page object structure where 'content' holds the array
    if (pageData && Array.isArray(pageData.content)) return pageData.content;
    // Fallbacks if the structure is different (though 'content' is standard for Spring Page)
    if (Array.isArray(pageData)) return pageData;
    if (pageData && Array.isArray(pageData.certificates)) return pageData.certificates;
    if (pageData && Array.isArray(pageData.data)) return pageData.data;
    return [];
  };

  const fetchAllCertificates = useCallback(async (params = {}, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // 'responsePage' will be the Spring Page object (e.g., { content: [...], last: true, totalPages: 5, ... })
      const responsePage = await certificateService.getAllCertificates(params);
      const newCertificatesArray = normalizeCertificates(responsePage);

      setCertificates(prevCerts => append ? [...prevCerts, ...newCertificatesArray] : newCertificatesArray);

      return {
        content: newCertificatesArray,          // The actual array of items for the current page
        isLastPage: responsePage.last,          // Boolean indicating if it's the last page
        pageNumber: responsePage.number,        // Current page number (0-indexed)
        totalPages: responsePage.totalPages,    // Total pages
        pageSize: responsePage.size,            // Page size used by server
        numberOfElements: responsePage.numberOfElements // Items on this specific page
      };
    } catch (err) {
      setError(err.message || 'Failed to fetch certificates');
      if (!append) {
        setCertificates([]); // Clear certificates on initial load error
      }
      // Return a structure indicating error and that there's no more data to load
      return { content: [], isLastPage: true, error: true };
    } finally {
      setIsLoading(false);
    }
  }, []); // Ensure dependencies are correct, e.g., if normalizeCertificates isn't defined inside or stable


  const addCertificate = async (certificateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await certificateService.createCertificate(certificateData);
      await fetchAllCertificates();
      return { success: true, message: result.message, certificate: result };
    } catch (err) {
      setError(err.message || 'Failed to create certificate');
      return { success: false, message: err.message || 'Failed to create certificate' };
    } finally {
      setIsLoading(false);
    }
  };

/*   const editCertificate = async (certificateId, certificateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await certificateService.updateCertificate(certificateId, certificateData);
      await fetchAllCertificates();
      return { success: true, message: result.message, certificate: result };
    } catch (err) {
      setError(err.message || 'Failed to update certificate');
      return { success: false, message: err.message || 'Failed to update certificate' };
    } finally {
      setIsLoading(false);
    }
  }; */
  const editCertificate = async (id, data) => {
  if (typeof id !== 'number' || isNaN(id)) {
    console.error('Invalid ID passed to updateCertificate:', id);
    return;
  }

  try {
    await certificateService.updateCertificate(id, data);
    await fetchAllCertificates(); // Or handle update locally if preferred
  } catch (error) {
    console.error(`Error updating certificate with ID ${id}:`, error);
  }
};


  const removeCertificate = async (certificateId) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await certificateService.deleteCertificate(certificateId);
      await fetchAllCertificates();
      return { success: true, message: result.message };
    } catch (err) {
      setError(err.message || 'Failed to delete certificate');
      return { success: false, message: err.message || 'Failed to delete certificate' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    certificates,
    isLoading,
    error,
    fetchAllCertificates,
    addCertificate,
    editCertificate,
    removeCertificate,
    getCertificateById: certificateService.getCertificateById,
    getCertificateByIdNumber: certificateService.getCertificateByIdNumber,
  };
};