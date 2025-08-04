import React from 'react';

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import DashboardPage from './pages/DashboardPage';
import TryoutPage from './tryout/TryoutPage.jsx';
import TryoutTestPage from './tryout/TryoutTestPage.jsx';
import TryoutResultPage from './tryout/TryoutResultPage.jsx';
import ProtectedRoute from './ProtectedRoute';
import NotFound from './NotFound';
import AppLayout from './layouts/AppLayout';

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Auth Routes - No Layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes with Layout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }>
                    <Route index element={<DashboardPage />} />
                    <Route path="/tryouts" element={<TryoutPage />} />
                    <Route path="/tryouts/start" element={<TryoutTestPage />} />
                    <Route path="/tryouts/result" element={<TryoutResultPage />} />
                </Route>

                {/* Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
