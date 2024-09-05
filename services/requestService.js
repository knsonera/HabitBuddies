const BASE_URL = 'https://www.uzhvieva.com:443';
//const BASE_URL = 'http://localhost:3000';

// Helper function for all the API requests
export const makeRequest = async (endpoint, method, body, token = null) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const config = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
    };

    return fetch(`${BASE_URL}${endpoint}`, config);
};
