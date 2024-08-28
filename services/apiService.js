import { getAuthToken, setAuthToken, clearAuthToken, getRefreshToken, getUserId, refreshAuthToken } from './authService';
import { makeRequest } from './requestService';

//const BASE_URL = 'https://www.uzhvieva.com:443';
const BASE_URL = 'http://localhost:3000';

// Function to handle unauthenticated requests
export const requestWithoutAuth = async (endpoint, method = 'POST', body = null) => {
    try {
        const response = await makeRequest(endpoint, method, body);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            return response.json();
        } else {
            return response.text();
        }
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

// Request function with token handling and retry logic
export const requestWithAuth = async (endpoint, method = 'GET', body = null, retry = true) => {
    let token = await getAuthToken();

    try {
        let response = await makeRequest(endpoint, method, body, token);
        if (response.status === 401 && retry) {
            const refreshed = await refreshAuthToken();
            if (refreshed) {
                token = await getAuthToken();
                response = await makeRequest(endpoint, method, body, token);
            } else {
                // Refresh token failed, clear the token, and force re-login
                await clearAuthToken();
                throw new Error('Session expired. Please log in again.');
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

export const checkTokenValidity = async () => {
    try {
        const response = await requestWithAuth('/auth/check-token', 'POST');
        return response.status === 200;
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
};

export const signUp = async (email, password, username, fullname) => {
    console.log('api service: signUp');
    try {
        const data = await requestWithoutAuth('/auth/signup', 'POST', { email, password, username, fullname });
        return data;
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
    console.log('api service: logIn');
    try {
        const data = await requestWithoutAuth('/auth/login', 'POST', { email, password });
        return data;
    } catch (error) {
        if (error.message.includes('Invalid email or password')) {
            throw new Error('Invalid email or password');
        } else {
            throw error;
        }
    }
};

// Get user info
export const fetchUserInfo = async (userId = null) => {
    const id = userId || await getUserId();
    if (!id) {
        throw new Error('User ID is required');
    }
    return requestWithAuth(`/users/${id}`, 'GET');
};

export const createQuest = async (questData, refreshQuests) => {
    try {
        const newQuest = await requestWithAuth('/quests', 'POST', questData);
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
    return requestWithAuth(`/quests/${userQuestId}`, 'PUT', data);
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

        return requestWithAuth(`/quests/${questId}`, 'PUT', updatedQuestData);
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
    return requestWithAuth(`/users/${id}/quests`, 'GET');
};

// Fetch users for quest
export const fetchQuestParticipants = async (questId) => {
    return requestWithAuth(`/quests/${questId}/users`, 'GET');
};

// Fetch owner for quest
export const fetchQuestOwner = async (questId) => {
    return requestWithAuth(`/quests/${questId}/owner`, 'GET');
};

// Fetch category for a specific quest
export const fetchQuestCategory = async (questId, owner_id) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }
    return requestWithAuth(`/quests/${questId}/category?ownerId=${owner_id}`, 'GET');
};

// Chat
export const fetchMessages = async (questId, authToken) => {
    return requestWithAuth(`/quests/${questId}/messages`, 'GET', null, authToken);
};

// Chat
export const sendMessage = async (questId, message, authToken) => {
    return requestWithAuth(`/quests/${questId}/messages`, 'POST', message, authToken);
};

export const searchUsers = async (query) => {
    if (!query) {
        throw new Error('Search query is required');
    }
    return requestWithAuth(`/users/search?query=${encodeURIComponent(query)}`, 'GET');
};

// Friendship Functions
export const requestFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    console.log("Sending friend request from:", userId, "to:", friendId);
    return requestWithAuth('/friendships/request', 'POST', { userId, friendId });
};

export const approveFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth('/friendships/approve', 'PUT', { userId, friendId });
};

export const removeFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth('/friendships/remove', 'DELETE', { userId, friendId });
};

export const fetchFriendshipStatus = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth(`/friendships/status?userId=${userId}&friendId=${friendId}`, 'GET');
};

export const fetchFriendshipSender = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth(`/friendships/sender?userId=${userId}&friendId=${friendId}`, 'GET');
};

export const fetchUserFriends = async (userId) => {
  const response = await requestWithAuth(`/users/${userId}/friends`, 'GET');
  console.log('users friends:');
  console.log(response);
  return response;
};

export const requestToJoinQuest = async (questId) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }

    return requestWithAuth(`/quests/${questId}/request`, 'POST');
};

// Approve a participant
export const approveParticipant = async (questId, participantId, authToken) => {
  return requestWithAuth(`/quests/${questId}/request-approve`, 'POST', { userId: participantId }, authToken);
};

// Remove a participant
export const removeParticipant = async (questId, participantId, authToken) => {
  return requestWithAuth(`/quests/${questId}/request-delete`, 'DELETE', { userId: participantId }, authToken);
};

export const inviteFriendToQuest = async (questId, friendId, currentUserId) => {
    if (!questId || !friendId || !currentUserId) {
        throw new Error('Quest ID and Friend ID are required');
    }

    return requestWithAuth(`/quests/${questId}/invite`, 'POST', { userId: friendId, inviterId: currentUserId });
};

export const acceptQuestInvite = async (questId) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }

    return requestWithAuth(`/quests/${questId}/invite-accept`, 'POST');
};

export const declineQuestInvite = async (questId) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }

    return requestWithAuth(`/quests/${questId}/invite-delete`, 'DELETE');
};

export const createCheckIn = async (questId, comment = '') => {
    const userId = await getUserId();
    if (!questId || !userId) {
        throw new Error('Quest ID and User ID are required');
    }
    return requestWithAuth(`/quests/${questId}/checkins`, 'POST', { user_id: userId, comment });
};

export const fetchQuestCheckIns = async (questId) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }
    return requestWithAuth(`/quests/${questId}/checkins`, 'GET');
};

export const fetchUserCheckInsForQuest = async (questId, userId) => {
    if (!questId || !userId) {
        throw new Error('Quest ID and User ID are required');
    }
    return requestWithAuth(`/quests/${questId}/users/${userId}/checkins`, 'GET');
};

export const fetchUserCheckInsForQuestToday = async (questId, userId) => {
    if (!questId || !userId) {
        throw new Error('Quest ID and User ID are required');
    }
    return requestWithAuth(`/quests/${questId}/users/${userId}/checkins/today`, 'GET');
};

export const fetchUserCheckIns = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    return requestWithAuth(`/users/${userId}/checkins`, 'GET');
};

export const fetchUserCheckInsToday = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    return requestWithAuth(`/users/${userId}/checkins/today`, 'GET');
};

export const fetchQuestsFeed = async () => {
    return requestWithAuth('/feeds/quests', 'GET');
};

export const fetchCheckinsFeed = async () => {
    return requestWithAuth('/feeds/checkins', 'GET');
};

export const sendPowerUp = async (receiverId, eventType, eventId, message) => {
    if (!receiverId || !eventType || !eventId || !message) {
        throw new Error('All parameters are required to send a power-up');
    }

    return requestWithAuth('/powerups', 'POST', {
        receiver_id: receiverId,
        event_type: eventType, // 'UserQuest' or 'CheckIn'
        event_id: eventId,
        message,
    });
};

export const fetchPowerUps = async () => {
    return requestWithAuth('/powerups/unread', 'GET');
};
