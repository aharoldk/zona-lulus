import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd';

export default function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // If user is not authenticated, redirect to login with the current location
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is authenticated, render the protected component
    return children;
}
