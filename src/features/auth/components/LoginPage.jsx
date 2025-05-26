// src/features/auth/loginPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/features/auth/context/AuthContext';
import { Button, Card, Input, Typography } from "@material-tailwind/react";
import { FaLock, FaUser } from 'react-icons/fa';
import AuthMessageDialog from '@/features/auth/components/AuthMessageDialog';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    // GET error directly from AuthContext
    const { login, error: authError, clearAuthError } = useAuthContext(); // authError is the error from context

    // Add a local state for dialogOpen, but control it based on authError
    const [localDialogOpen, setLocalDialogOpen] = useState(false);
    const [inputErrors, setInputErrors] = useState({ username: '', password: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        setInputErrors({ ...inputErrors, [name]: '' }); // Clear error on change
    };

    const validateInputs = () => {
        let valid = true;
        const errors = { username: '', password: '' };
        if (!credentials.username.trim()) {
            errors.username = 'Username is required.';
            valid = false;
        }
        if (!credentials.password.trim()) {
            errors.password = 'Password is required.';
            valid = false;
        }
        setInputErrors(errors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalDialogOpen(false);
        if (!validateInputs()) return;
        setIsLoading(true);
        console.log("LoginPage handleSubmit: States reset, attempting login.");

        try {
            console.log("LoginPage handleSubmit: About to call login().");
            await login(credentials.username, credentials.password);
            console.log("LoginPage handleSubmit: login() call finished (SUCCESS).");
            // If login is successful, AuthContext handles navigation
        } catch (err) {
            console.log("LoginPage handleSubmit: >>> CAUGHT AN ERROR IN LOGINPAGE <<<");
            console.error('LoginPage handleSubmit CATCH: Login error object:', err);
            console.log("LoginPage handleSubmit CATCH: Setting localDialogOpen to true");
            setLocalDialogOpen(true);
        } finally {
            console.log("LoginPage handleSubmit FINALLY: Setting isLoading to false");
            setIsLoading(false);
        }
    };

    const handleDialogClose = () => {
        console.log("LoginPage handleDialogClose: Closing dialog, clearing error.");
        setLocalDialogOpen(false);
        clearAuthError();
    };

    // Use a useEffect to react to authError changes and open the dialog
    useEffect(() => {
        console.log(`LoginPage useEffect[authError] triggered. Current authError: "${authError}"`);
        if (authError && authError.trim()) {
            console.log("LoginPage useEffect[authError]: Auth error is present, setting localDialogOpen to true.");
            setLocalDialogOpen(true);
        } else {
            console.log("LoginPage useEffect[authError]: Auth error is cleared, setting localDialogOpen to false.");
            setLocalDialogOpen(false);
        }
    }, [authError]); // Dependency on authError from context

    // --- CRITICAL DEBUG LOGS ---
    //console.log(`LoginPage RENDER cycle. Current state - authError: "${authError}", localDialogOpen: ${localDialogOpen}`);
    const isErrorPresent = !!(authError && authError.trim()); // Check authError
    const finalOpenPropValue = localDialogOpen && isErrorPresent; // Use localDialogOpen
    //console.log(`LoginPage RENDER cycle. isErrorPresent: ${isErrorPresent}, finalOpenPropValue for dialog: ${finalOpenPropValue}`);
    // --- END CRITICAL DEBUG LOGS ---

    return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-full h-full flex items-center justify-center p-4">
            <Card className="w-full max-w-md px-12 py-8 shadow-lg rounded-lg bg-white">
                <Typography variant="h4" color="blue-gray" className="mb-6 text-center font-bold">
                    DGAPR - DSI
                </Typography>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    {/* Username Input */}
                    <div className="relative w-full">
                        <FaUser className="absolute left-3 top-3.5 text-gray-500 z-10" />
                        <Input
                            type="text"
                            name="username"
                            label="Username"
                            size="lg"
                            icon={null}
                            value={credentials.username}
                            onChange={handleInputChange}
                            crossOrigin="anonymous"
                            className="pl-10"
                            labelProps={{ className: "peer-placeholder-shown:translate-x-6 peer-focus:translate-x-0 transition-transform duration-200" }}
                        />
                        {inputErrors.username && (
                            <span className="text-red-500 text-xs absolute left-0 -bottom-5">{inputErrors.username}</span>
                        )}
                    </div>
                    {/* Password Input */}
                    <div className="relative w-full">
                        <FaLock className="absolute left-3 top-3.5 text-gray-500 z-10" />
                        <Input
                            type="password"
                            name="password"
                            label="Password"
                            size="lg"
                            icon={null}
                            value={credentials.password}
                            onChange={handleInputChange}
                            crossOrigin="anonymous"
                            className="pl-10"
                            labelProps={{ className: "peer-placeholder-shown:translate-x-6 peer-focus:translate-x-0 transition-transform duration-50" }}
                        />
                        {inputErrors.password && (
                            <span className="text-red-500 text-xs absolute left-0 -bottom-5">{inputErrors.password}</span>
                        )}
                    </div>
                    <Button type="submit" className="mt-6" fullWidth loading={isLoading}>
                        {isLoading ? 'Logging In...' : 'Login'}
                    </Button>
                </form>
            </Card>
            <AuthMessageDialog
                open={finalOpenPropValue}
                onClose={handleDialogClose}
                message={isErrorPresent ? authError : 'Login failed. Please try again.'}
            />
        </div>
    );
};
export default LoginPage;