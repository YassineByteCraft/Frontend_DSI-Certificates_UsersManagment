// This file serves as the entry point for the auth feature
export { AuthProvider } from '@/features/auth/context/AuthContext';
export { default as useAuth } from '@/features/auth/hooks/useAuth';
// Export functions from authService that might be used directly by other features/components
export { getCurrentUser , getAuthHeaders } from '@/features/auth/services/authService';
// handleUnauthorized is typically only needed by api.js, so no need to re-export here
export { default as RequireAuth } from '@/features/auth/components/RequireAuth';