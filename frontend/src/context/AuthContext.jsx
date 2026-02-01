import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Пытаемся получить профиль по сессии в cookies
                const data = await authApi.getMe();
                setUser(data);
            } catch (error) {
                // Если нет сессии или ошибка - проверяем localstorage как fallback
                const savedUser = localStorage.getItem('yakjo_user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const sendOtp = async (phone) => {
        try {
            return await authApi.sendOtp(phone);
        } catch (error) {
            console.error('Send OTP error:', error);
            throw error;
        }
    };

    const verifyOtp = async (phone, code) => {
        try {
            const data = await authApi.verifyOtp(phone, code);
            setUser(data);
            localStorage.setItem('yakjo_user', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Verify OTP error:', error);
            throw error;
        }
    };

    const register = async (data) => {
        try {
            const updatedUser = await authApi.register(data);
            setUser(updatedUser);
            localStorage.setItem('yakjo_user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('yakjo_user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, sendOtp, verifyOtp, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
