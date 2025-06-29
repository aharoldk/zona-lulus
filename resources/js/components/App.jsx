import React from 'react';

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
// import Home from '../pages/Home';
// import CourseList from './courses/CourseList';
// import CourseDetail from './courses/CourseDetail';
// import TestSimulator from './tests/TestSimulator';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import NotFound from './NotFound';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                {/* Protected routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* 404 page */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
