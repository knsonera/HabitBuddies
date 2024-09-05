import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRequest } from './requestService';

let authToken = null;
let refreshToken = null;
let userId = null;

const BASE_URL = 'https://www.uzhvieva.com:443';
//const BASE_URL = 'http://localhost:3000';

// Set authentication token
export const setAuthToken = async (token, refresh, user) => {
    authToken = token;
    refreshToken = refresh;
    userId = user;
    try {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('refreshToken', refresh);
        await AsyncStorage.setItem('userId', user.toString());
    } catch (error) {
        throw error;
    }
};

// Get authentication token
export const getAuthToken = async () => {
    if (!authToken) {
        authToken = await AsyncStorage.getItem('authToken');
    }
    return authToken;
};

// Get refresh token
export const getRefreshToken = async () => {
    if (!refreshToken) {
        refreshToken = await AsyncStorage.getItem('refreshToken');
    }
    return refreshToken;
};

export const clearAuthToken = async () => {
    authToken = null;
    refreshToken = null;
    userId = null;
    try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('userId');
    } catch (error) {
        throw error;
    }
};

export const getUserId = async () => {
    if (!userId) {
        try {
            userId = await AsyncStorage.getItem('userId');
            if (userId) {
                return parseInt(userId, 10);  // Return as an integer
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }
    return userId;
};

export const refreshAuthToken = async () => {
    try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        const response = await makeRequest('/auth/refresh-token', 'POST', { refreshToken });
        const data = await response.json();

        await setAuthToken(data.token, data.refreshToken, data.userId);
        return data;
    } catch (error) {
        await clearAuthToken();
        return null;  // Clear tokens and return null if refresh fails
    }
};
