import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const { data } = await axios.get('/api/me');
                    setUser(data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/api/login', credentials);
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
            setUser(data.user);
            return { success: true, data };
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post('/api/register', userData);
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
            setUser(data.user);
            return { success: true, data };
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
