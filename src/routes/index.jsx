import React, { lazy, Suspense } from 'react'; // Added lazy and Suspense
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

import RequireAuth from '@/features/auth/components/RequireAuth';
import useAuth from '@/features/auth/hooks/useAuth';
import GridLoader from '@/common/components/GridLoader';
import { USER_ROLES } from '@/features/users/utils/userConstants'; // Import role constants

// Lazy load components
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'));
const CertificatesPage = lazy(() => import('@/features/certificate/components/CertificatsPage'));


const LazyUserPage = lazy(() =>
  import('@/features/users').then(module => ({ default: module.UsersPage }))
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen w-full">
        <GridLoader />
    </div>
);

const AppRoutes = () => {
    const { isAuthenticated, isLoading, user } = useAuth(); // user might be useful for direct checks if needed
    const location = useLocation();

    console.log('[AppRoutes] Current Location:', location.pathname);
    console.log('[AppRoutes] isLoading:', isLoading);
    console.log('[AppRoutes] isAuthenticated:', isAuthenticated);
    console.log('[AppRoutes] User role:', user?.role);


    if (isLoading) {
        console.log('[AppRoutes] Rendering LoadingSpinner because isLoading is true.');
        return <LoadingSpinner />;
    }

    console.log('[AppRoutes] Proceeding to render routes because isLoading is false.');
    const defaultAuthenticatedRoute = "/certificates";

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {/* Login Page */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated
                            ? <Navigate to={location.state?.from?.pathname || defaultAuthenticatedRoute} replace />
                            : <LoginPage />
                    }
                />

                {/* Root path redirection */}
                <Route
                    path="/"
                    element={
                        isAuthenticated
                            ? <Navigate to={defaultAuthenticatedRoute} replace />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* General Protected Routes - Accessible by any authenticated user */}
                <Route element={<RequireAuth allowedRoles={[USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]} />}>
                    {/* If /certificates truly is for *any* authenticated user, you can omit allowedRoles,
                        but explicitly stating them is clearer. Update based on your requirements. */}
                    <Route path="/certificates" element={<CertificatesPage />} />
                </Route>

                {/* Admin-Specific Protected Routes */}
                <Route element={<RequireAuth allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]} />}>
                    {/* Add SUPER_ADMIN if that role should also access this */}
                    <Route path="/admin/usersManagement" element={<LazyUserPage />} />
                </Route>

                {/* Optional: Unauthorized page */}
                {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}

                {/* Catch-all: Redirects to a sensible default based on auth status */}
                <Route path="*" element={
                    isAuthenticated
                        ? <Navigate to={defaultAuthenticatedRoute} replace />
                        : <Navigate to="/login" replace />
                } />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;