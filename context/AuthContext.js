import React, { createContext, useState } from 'react';
import { logIn as apiLogIn } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);
    const [userId, setUserId] = useState(null);

    const logIn = async (email, password) => {
        try {
            const result = await apiLogIn(email, password);
            if (result) {
                setAuthToken(result.token);
                setUserId(result.userId);
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logOut = () => {
        setAuthToken(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, userId, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};
