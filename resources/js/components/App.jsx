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
import TopUp from './coins/TopUp';
import ProtectedRoute from './ProtectedRoute';
import NotFound from './NotFound';
import AppLayout from './layouts/AppLayout';
import PaymentPage from "./payment/PaymentPage.jsx";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

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
                    <Route path="/topup" element={<TopUp />} />
                </Route>

                <Route path="/payment" element={<PaymentPage />} />

                {/* Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
