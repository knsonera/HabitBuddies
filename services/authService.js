import AsyncStorage from '@react-native-async-storage/async-storage';

let authToken = '';
let userId = '';
let refreshToken = '';

export const setAuthToken = async (token, refresh, user) => {
    authToken = token;
    refreshToken = refresh;
    userId = user; // Ensure userId is set here
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('refreshToken', refresh);
    await AsyncStorage.setItem('userId', JSON.stringify({ userId })); // Correctly store the userId
    console.log('Tokens set:', { userId, authToken, refreshToken });
};

export const getAuthToken = async () => {
    if (!authToken) {
        authToken = await AsyncStorage.getItem('authToken');
    }
    console.log('get auth token: ', authToken);
    return authToken;
};

export const getRefreshToken = async () => {
    if (!refreshToken) {
        refreshToken = await AsyncStorage.getItem('refreshToken');
    }
    console.log('get refresh token: ', refreshToken);
    return refreshToken;
};

export const clearAuthToken = async () => {
    authToken = '';
    refreshToken = '';
    userId = '';
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userId');
    console.log('clear token');
};

export const getUserId = async () => {
    if (!userId) {
        const userIdString = await AsyncStorage.getItem('userId');
        console.log('AsyncStorage returned userIdString:', userIdString);
        if (userIdString) {
            userId = JSON.parse(userIdString).userId;
            console.log('Parsed userId:', userId);
        } else {
            console.log('No userId found in AsyncStorage');
        }
    }
    console.log('get user id: ', userId);
    return userId;
};
