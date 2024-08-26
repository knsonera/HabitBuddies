import React, { createContext, useState, useEffect } from 'react';
import { logIn, signUp, fetchUserInfo,checkTokenValidity } from '../services/apiService';
import { getAuthToken, refreshAuthToken, setAuthToken, getUserId, clearAuthToken } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthTokenState] = useState('');
    const [userId, setUserId] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = await getAuthToken();
            console.log('AuthProvider - Fetched auth token:', token);
            if (token) {
                const storedUserId = await getUserId();
                console.log('AuthProvider - Fetched userId:', storedUserId);
                if (storedUserId) {
                    setAuthTokenState(token);
                    setUserId(storedUserId);
                    try {
                        const userInfo = await fetchUserInfo(storedUserId);
                        console.log('AuthProvider - Fetched userInfo:', userInfo);
                        setUserInfo(userInfo);
                    } catch (error) {
                        console.error('AuthProvider - Error fetching user info:', error);
                        await logOut();
                    }
                } else {
                    console.error('AuthProvider - No userId found, logging out');
                    await logOut();
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const logInUser = async (email, password) => {
        try {
            const response = await logIn(email, password);
            console.log('LogIn Response:', response);
            if (response.userId) {
                await setAuthToken(response.token, response.refreshToken, response.userId);
                setAuthTokenState(response.token);
                setUserId(response.userId);
                const userInfo = await fetchUserInfo(response.userId);
                setUserInfo(userInfo);
            } else {
                console.error('User ID is missing in the login response');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const signUpUser = async (email, password, username, fullname) => {
        try {
            const response = await signUp(email, password, username, fullname);
            await setAuthToken(response.token, response.refreshToken, response.userId);
            setAuthTokenState(response.token);
            setUserId(response.userId);
            const userInfo = await fetchUserInfo(response.userId);
            setUserInfo(userInfo);
        } catch (error) {
            console.error('Sign-up failed:', error);
            throw error;
        }
    };

    const logOut = async () => {
        await clearAuthToken();
        setAuthTokenState('');
        setUserId(null);
        setUserInfo(null);
    };

    const validateToken = async () => {
        if (authToken) {
            const isValid = await checkTokenValidity();
            if (!isValid) {
                try {
                    const newToken = await refreshAuthToken();
                    if (newToken) {
                        await setAuthToken(newToken.token, newToken.refreshToken, newToken.userId);
                        setAuthTokenState(newToken.token);
                        setUserId(newToken.userId);
                        const userInfo = await fetchUserInfo(newToken.userId);
                        setUserInfo(userInfo);
                        return true;
                    } else {
                        throw new Error('Session expired. Please log in again.');
                    }
                } catch (error) {
                    await logOut();
                    console.error('Token validation failed:', error);
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    const refreshTokens = async () => {
        const newTokens = await refreshAuthToken();
        if (newTokens) {
            await setAuthToken(newTokens.token, newTokens.refreshToken, newTokens.userId);
            setAuthTokenState(newTokens.token);
            setUserId(newTokens.userId);
            const userInfo = await fetchUserInfo(newTokens.userId);
            setUserInfo(userInfo);
        } else {
            await logOut();
        }
    };

    return (
        <AuthContext.Provider value={{ authToken, userId, userInfo, logInUser, signUpUser, logOut, validateToken, isLoading, refreshTokens }}>
            {children}
        </AuthContext.Provider>
    );
};
