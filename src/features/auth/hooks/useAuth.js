import { useContext } from 'react';
// Import the context directly from its source file
// This prevents a potential circular import if AuthContext needed to import useAuth
import { AuthContext } from '@/features/auth/context/AuthContext';

// Define and export the custom hook
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;