import React from 'react';
import {BrowserRouter as Router, useLocation} from 'react-router-dom';
import {AuthProvider, useAuth} from '@/features/auth';
import AppRoutes from '@/routes';
import Sidebare from "@/common/components/Sidebare";
import GridLoader from '@/common/components/GridLoader';

const AppContent = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    // Only render loader while loading
    if (isLoading) {
        return <GridLoader />;
    }

    // If not authenticated, only allow login page
    if (!isAuthenticated) {
        if (!isLoginPage) {
            // If not on login, force redirect to login.
            window.location.replace('/login');
            return <GridLoader />;
        }
        // On login page
        return (
            <main className="w-full h-screen bg-[#eaf3ffd6]">
                <AppRoutes/>
            </main>
        );
    }

    // Authenticated: show sidebar and main content
    return (
        <div className="w-full flex h-screen fixed top-0 z-50 left-0 ">
            <Sidebare/>
            <main className="w-full h-screen bg-[#eaf3ffd6]">
                <AppRoutes/>
            </main>
        </div>
    );
};

const App = () => (
    <Router>
        <AuthProvider>
            <AppContent/>
        </AuthProvider>
    </Router>
);

export default App;


