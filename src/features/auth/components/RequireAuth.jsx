// src/features/auth/components/RequireAuth.jsx
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '@/features/auth/hooks/useAuth';
import GridLoader from '@/common/components/GridLoader';
import { useAuthContext } from '@/features/auth/context/AuthContext';

const LoadingSpinner = () => <GridLoader />;

// Accept allowedRoles as prop
const RequireAuth = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />; // or an Unauthorized page
  }

  return <Outlet />;
};

export default RequireAuth;
