import React from 'react';

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import Dashboard from './Dashboard';
import CoinWallet from './coins/CoinWallet';
import TryoutTest from './tryout/TryoutTest';
import ProtectedRoute from './ProtectedRoute';
import NotFound from './NotFound';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wallet"
                    element={
                        <ProtectedRoute>
                            <CoinWallet />
                        </ProtectedRoute>
                    }
                />
                <Route path="/tryouts/start" element={<TryoutTest />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
