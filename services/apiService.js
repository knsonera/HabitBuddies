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
                const newToken = await getAuthToken();
                headers['Authorization'] = `Bearer ${newToken}`;
                config.headers = headers;
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
        const response = await request('/auth/check-token', 'POST');
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

// Get user info
export const fetchUserInfo = async (userId = null) => {
    const id = userId || await getUserId();
    if (!id) {
        throw new Error('User ID is required');
    }
    return request(`/users/${id}`, 'GET');
};

export const createQuest = async (questData, refreshQuests) => {
    try {
        const newQuest = await request('/quests', 'POST', questData);
        // Optionally trigger a re-fetch of quests after creation
        if (refreshQuests) {
            await refreshQuests();
        }
        return newQuest;
    } catch (error) {
        console.error('Failed to create quest:', error);
        throw error;
    }
};

// Edit an existing quest
export const editQuest = async (questData) => {
    const { userQuestId, ...data } = questData;
    return request(`/quests/${userQuestId}`, 'PUT', data);
};

export const endQuest = async (questId) => {
    try {
        // Fetch the current quest data
        const questData = await request(`/quests/${questId}`, 'GET');

        // Update the status and updated_at fields
        const updatedQuestData = {
            ...questData,
            status: 'completed',
            updated_at: new Date().toISOString(),
        };

        return request(`/quests/${questId}`, 'PUT', updatedQuestData);
    } catch (error) {
        console.error('Failed to end the quest:', error);
        throw error;
    }
};

// Fetch user quests
export const fetchUserQuests = async (userId = null) => {
    const id = userId || await getUserId();
    if (!id) {
        throw new Error('User ID is required');
    }
    console.log('fetching user quests');
    return request(`/users/${id}/quests`, 'GET');
};

// Fetch users for quest
export const fetchQuestParticipants = async (questId) => {
    return request(`/quests/${questId}/users`, 'GET');
};

// Fetch owner for quest
export const fetchQuestOwner = async (questId) => {
    return request(`/quests/${questId}/owner`, 'GET');
};

// Fetch category for a specific quest
export const fetchQuestCategory = async (questId, owner_id) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }
    return request(`/quests/${questId}/category?ownerId=${owner_id}`, 'GET');
};

// Chat
export const fetchMessages = async (questId, authToken) => {
    return request(`/quests/${questId}/messages`, 'GET', null, authToken);
};

// Chat
export const sendMessage = async (questId, message, authToken) => {
    return request(`/quests/${questId}/messages`, 'POST', message, authToken);
};

export const searchUsers = async (query) => {
    if (!query) {
        throw new Error('Search query is required');
    }
    return request(`/users/search?query=${encodeURIComponent(query)}`, 'GET');
};

// Friendship Functions
export const requestFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    console.log("Sending friend request from:", userId, "to:", friendId);
    return request('/friendships/request', 'POST', { userId, friendId });
};

export const approveFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return request('/friendships/approve', 'PUT', { userId, friendId });
};

export const removeFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return request('/friendships/remove', 'DELETE', { userId, friendId });
};

export const fetchFriendshipStatus = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return request(`/friendships/status?userId=${userId}&friendId=${friendId}`, 'GET');
};

export const fetchFriendshipSender = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return request(`/friendships/sender?userId=${userId}&friendId=${friendId}`, 'GET');
};

export const fetchUserFriends = async (userId) => {
  const response = await request(`/users/${userId}/friends`, 'GET');
  console.log('users friends:');
  console.log(response);
  return response;
};

export const requestToJoinQuest = async (questId) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }

    return request(`/quests/${questId}/request`, 'POST');
};

// Approve a participant
export const approveParticipant = async (questId, participantId, authToken) => {
  return request(`/quests/${questId}/request-approve`, 'POST', { userId: participantId }, authToken);
};

// Remove a participant
export const removeParticipant = async (questId, participantId, authToken) => {
  return request(`/quests/${questId}/request-delete`, 'DELETE', { userId: participantId }, authToken);
};
