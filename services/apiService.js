// src/services/apiService.js

const BASE_URL = 'http://localhost:3000/';

// Helper function to handle API requests
const request = async (endpoint, method = 'GET', body = null) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

// API functions

export const signUp = (username, email, password) => {
    return request('/signup', 'POST', { username, email, password });
};

export const logIn = (email, password) => {
    return request('/login', 'POST', { email, password });
};

export const fetchUserBadges = (userId) => {
    return request(`/user/${userId}/badges`);
};

export const fetchUserChallenges = (userId) => {
    return request(`/user/${userId}/challenges`);
};

export const fetchUserFriends = (userId) => {
    return request(`/user/${userId}/friends`);
};

export const fetchUserCheckins = (userId) => {
    return request(`/user/${userId}/checkins`);
};
