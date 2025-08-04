import React from 'react';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../ProtectedRoute';

// Higher-order component to wrap pages with layout and protection
export default function withLayout(WrappedComponent) {
    return function LayoutWrapper(props) {
        return (
            <ProtectedRoute>
                <AppLayout>
                    <WrappedComponent {...props} />
                </AppLayout>
            </ProtectedRoute>
        );
    };
}
