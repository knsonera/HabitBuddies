import { getAuthToken, setAuthToken, clearAuthToken, getRefreshToken, getUserId } from './authService';

const BASE_URL = 'http://localhost:3000';

const request = async (endpoint, method = 'GET', body = null, retry = true) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const token = await getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        let response = await fetch(`${BASE_URL}${endpoint}`, config);
        if (response.status === 401 && retry) {
            // Token might be expired, try to refresh it
            const refreshed = await refreshAuthToken();
            if (refreshed) {
                // Try the request again with the new token
                headers['Authorization'] = `Bearer ${await getAuthToken()}`;
                response = await fetch(`${BASE_URL}${endpoint}`, config);
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = errorText;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || response.statusText;
            } catch (e) {
                // Do nothing, use the errorText as is
            }
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        const text = await response.text();

        if (contentType && contentType.indexOf('application/json') !== -1) {
            return JSON.parse(text);
        } else {
            return text;
        }
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

export const signUp = async (email, password, username, fullname) => {
    try {
        console.log('signing up...');
        const response = await request('/auth/signup', 'POST', { email, password, username, fullname });
        await setAuthToken(response.token, response.refreshToken, response.userId);
        return response;
    } catch (error) {
        if (error.message.includes('Email already in use')) {
            throw new Error('Email already in use');
        } else if (error.message.includes('Username already in use')) {
            throw new Error('Username already in use');
        } else {
            throw error;
        }
    }
};

export const logIn = async (email, password) => {
    try {
        console.log('logging in...');
        const data = await request('/auth/login', 'POST', { email, password });
        await setAuthToken(data.token, data.refreshToken, data.userId);
        return data;
    } catch (error) {
        if (error.message.includes('Invalid email or password')) {
            throw new Error('Invalid email or password');
        } else {
            throw error;
        }
    }
};

export const refreshAuthToken = async () => {
    try {
        console.log('refreshing auth token...');
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        const response = await request('/auth/refresh-token', 'POST', { refreshToken }, false);
        await setAuthToken(response.token, response.refreshToken, response.userId);
        return response;
    } catch (error) {
        console.error('Failed to refresh auth token:', error);
        await clearAuthToken();
        return null;
    }
};

export const checkTokenValidity = async () => {
    try {
        console.log('checking token validity...');
        const response = await request('/auth/check-token', 'POST');
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

// Fetch user info
export const fetchUserInfo = async () => {
    console.log('fetching user info...');
    const userId = await getUserId();
    return request(`/users/${userId}`, 'GET');
};
