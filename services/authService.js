import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRequest } from './requestService';

let authToken = null;
let refreshToken = null;
let userId = null;

//const BASE_URL = 'https://www.uzhvieva.com:443';
const BASE_URL = 'http://localhost:3000';

export const setAuthToken = async (token, refresh, user) => {
    authToken = token;
    refreshToken = refresh;
    userId = user;
    try {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('refreshToken', refresh);
        await AsyncStorage.setItem('userId', user.toString());
        //console.log('Tokens set:', { userId, authToken, refreshToken });
    } catch (error) {
        //console.error('Failed to set tokens:', error);
    }
};

export const getAuthToken = async () => {
    if (!authToken) {
        authToken = await AsyncStorage.getItem('authToken');
    }
    //console.log('get auth token:', authToken);
    return authToken;
};

export const getRefreshToken = async () => {
    if (!refreshToken) {
        refreshToken = await AsyncStorage.getItem('refreshToken');
    }
    //console.log('get refresh token:', refreshToken);
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
        //console.log('Tokens cleared');
    } catch (error) {
        //console.error('Failed to clear tokens:', error);
    }
};

export const getUserId = async () => {
    if (!userId) {
        try {
            userId = await AsyncStorage.getItem('userId');
            if (userId) {
                //console.log('Parsed userId:', userId);
                return parseInt(userId, 10);  // Return as an integer
            } else {
                //console.log('No userId found in AsyncStorage');
                return null;
            }
        } catch (error) {
            //console.error('Error retrieving userId from AsyncStorage:', error);
            return null;
        }
    }
    return userId;
};

export const refreshAuthToken = async () => {
    //console.log('auth service: refreshAuthToken');
    try {
        const refreshToken = await getRefreshToken();
        //console.log('refresh token from authService:', refreshToken);
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        const response = await makeRequest('/auth/refresh-token', 'POST', { refreshToken });
        //console.log('POST /auth/refresh-token:', response);
        const data = await response.json();

        await setAuthToken(data.token, data.refreshToken, data.userId);
        return data;
    } catch (error) {
        //console.error('Failed to refresh auth token:', error);
        await clearAuthToken();
        return null;  // Clear tokens and return null if refresh fails
    }
};
