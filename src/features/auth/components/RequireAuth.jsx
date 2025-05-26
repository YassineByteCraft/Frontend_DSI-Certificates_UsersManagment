import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
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
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
