import { getAuthToken, setAuthToken, clearAuthToken, getRefreshToken, getUserId, refreshAuthToken } from './authService';
import { makeRequest } from './requestService';
import NetInfo from '@react-native-community/netinfo'; // Add this for network check

const BASE_URL = 'https://www.uzhvieva.com:443';
//const BASE_URL = 'http://localhost:3000';

// Check if user is connected to the Internet
const checkNetworkConnection = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
        throw new Error('No internet connection. Please check your network connection and try again.');
    }
};

// Function to handle unauthenticated requests
export const requestWithoutAuth = async (endpoint, method = 'POST', body = null) => {
    // Check network connectivity
    await checkNetworkConnection();
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
        if (error.message === 'Failed to fetch' || error.message.includes('Network request failed')) {
            // Handle network errors
            throw new Error('No internet connection. Please check your connection and try again.');
        } else {
            throw error;
        }
    }
};

// Request function with token handling and retry logic
export const requestWithAuth = async (endpoint, method = 'GET', body = null, retry = true) => {
    // Check network connectivity
    await checkNetworkConnection();
    // Get the token
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
        // Handle errors
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = errorText;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || response.statusText;
            } catch (e) {
                throw e;
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
        if (error.message === 'Failed to fetch' || error.message.includes('Network request failed')) {
            // Handle network errors
            throw new Error('No internet connection. Please check your connection and try again.');
        } else {
            throw error;
        }
    }
};

// Check if token is still valid
export const checkTokenValidity = async () => {
    try {
        const response = await requestWithAuth('/auth/check-token', 'POST');
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

// User sign-up
export const signUp = async (email, password, username, fullname) => {
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

// User log in
export const logIn = async (email, password) => {
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

// Update user info
export const updateUserProfile = async (userId, updatedData) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    try {
        const response = await requestWithAuth(`/users/${userId}`, 'PUT', updatedData);
        return response;
    } catch (error) {
        throw error;
    }
};

// QUESTS
// Create new quest
export const createQuest = async (questData, refreshQuests) => {
    try {
        const newQuest = await requestWithAuth('/quests', 'POST', questData);
        // re-fetch of quests after creation
        if (refreshQuests) {
            await refreshQuests();
        }
        return newQuest;
    } catch (error) {
        throw error;
    }
};

// Edit an existing quest
export const editQuest = async (questData) => {
    const { userQuestId, ...data } = questData;
    return requestWithAuth(`/quests/${userQuestId}`, 'PUT', data);
};

// End quest aka change status to dropped
export const endQuest = async (questId) => {
    try {
        // Send the request to the new endpoint that marks the quest as completed
        const response = await requestWithAuth(`/quests/${questId}/end`, 'PUT');
        return response;
    } catch (error) {
        throw error;
    }
};

// Complete quest aka change status to complete
export const completeQuest = async (questId) => {
    try {
        // Send the request to the new endpoint that marks the quest as completed
        const response = await requestWithAuth(`/quests/${questId}/complete`, 'PUT');
        return response;
    } catch (error) {
        throw error;
    }
};

// Fetch user quests
export const fetchUserQuests = async (userId = null) => {
    const id = userId || await getUserId();
    if (!id) {
        throw new Error('User ID is required');
    }
    return requestWithAuth(`/users/${id}/quests`, 'GET');
};

// Fetch past user quests
export const fetchPastUserQuests = async (userId = null) => {
    const id = userId || await getUserId();
    if (!id) {
        throw new Error('User ID is required');
    }
    return requestWithAuth(`/users/${id}/quests/past`, 'GET');
};

// Fetch all quest participants
export const fetchQuestParticipants = async (questId) => {
    return requestWithAuth(`/quests/${questId}/users`, 'GET');
};

// Fetch owner of the quest
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

// CHAT
// Get messages by quest id
export const fetchMessages = async (questId, authToken) => {
    return requestWithAuth(`/quests/${questId}/messages`, 'GET', null, authToken);
};

// Send message to chat
export const sendMessage = async (questId, message, authToken) => {
    return requestWithAuth(`/quests/${questId}/messages`, 'POST', message, authToken);
};

// SEARCH
// User search
export const searchUsers = async (query) => {
    if (!query) {
        throw new Error('Search query is required');
    }
    return requestWithAuth(`/users/search?query=${encodeURIComponent(query)}`, 'GET');
};

// FRIENDSHIPS
// Request friendship
export const requestFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth('/friendships/request', 'POST', { userId, friendId });
};

// Approve friendship request
export const approveFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth('/friendships/approve', 'PUT', { userId, friendId });
};

// Remove friendship
export const removeFriendship = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth('/friendships/remove', 'DELETE', { userId, friendId });
};

// Check friendship status
export const fetchFriendshipStatus = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth(`/friendships/status?userId=${userId}&friendId=${friendId}`, 'GET');
};

// Check friendship initiator (sender)
export const fetchFriendshipSender = async (friendId) => {
    const userId = await getUserId();
    if (!userId || !friendId) {
        throw new Error('Both user ID and friend ID are required');
    }
    return requestWithAuth(`/friendships/sender?userId=${userId}&friendId=${friendId}`, 'GET');
};

// Get all user's friends
export const fetchUserFriends = async (userId) => {
  const response = await requestWithAuth(`/users/${userId}/friends`, 'GET');
  return response;
};

// MORE QUESTS
// Request to Join the quest
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

// Invite a friend to quest
export const inviteFriendToQuest = async (questId, friendId, currentUserId) => {
    if (!questId || !friendId || !currentUserId) {
        throw new Error('Quest ID and Friend ID are required');
    }

    return requestWithAuth(`/quests/${questId}/invite`, 'POST', { userId: friendId, inviterId: currentUserId });
};

// Approve invite to quest
export const acceptQuestInvite = async (questId) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }

    return requestWithAuth(`/quests/${questId}/invite-accept`, 'POST');
};

// Decline invite to quest
export const declineQuestInvite = async (questId) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }

    return requestWithAuth(`/quests/${questId}/invite-delete`, 'DELETE');
};

// CHECK-INS
// Create new check-in
export const createCheckIn = async (questId, comment = '') => {
    const userId = await getUserId();
    if (!questId || !userId) {
        throw new Error('Quest ID and User ID are required');
    }
    return requestWithAuth(`/quests/${questId}/checkins`, 'POST', { user_id: userId, comment });
};

// Get all checkins by quest id
export const fetchQuestCheckIns = async (questId) => {
    if (!questId) {
        throw new Error('Quest ID is required');
    }
    return requestWithAuth(`/quests/${questId}/checkins`, 'GET');
};

// Get user checkins in a quest by user id and quest id
export const fetchUserCheckInsForQuest = async (questId, userId) => {
    if (!questId || !userId) {
        throw new Error('Quest ID and User ID are required');
    }
    return requestWithAuth(`/quests/${questId}/users/${userId}/checkins`, 'GET');
};

// Get user checkins in a quest TODAY by user id and quest id
export const fetchUserCheckInsForQuestToday = async (questId, userId) => {
    if (!questId || !userId) {
        throw new Error('Quest ID and User ID are required');
    }
    return requestWithAuth(`/quests/${questId}/users/${userId}/checkins/today`, 'GET');
};

// Get checkins by user id
export const fetchUserCheckIns = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    return requestWithAuth(`/users/${userId}/checkins`, 'GET');
};

// Get user checkins TODAY by user id
export const fetchUserCheckInsToday = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }
    return requestWithAuth(`/users/${userId}/checkins/today`, 'GET');
};

// NEWS

// Get all quest news
export const fetchQuestsFeed = async () => {
    return requestWithAuth('/feeds/quests', 'GET');
};

// Get all checkin news
export const fetchCheckinsFeed = async () => {
    return requestWithAuth('/feeds/checkins', 'GET');
};

// POWER-UPS
// Send power-up to a user
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

// Get user's power-ups
export const fetchPowerUps = async () => {
    return requestWithAuth('/powerups/unread', 'GET');
};

// Mark power-up as read
export const markAsReadPowerUp = async (powerUpId) => {
    if (!powerUpId) {
        throw new Error('PowerUp ID is required');
    }
    return requestWithAuth(`/powerups/${powerUpId}/read`, 'PUT');
};
