import React, { createContext, useState, useEffect } from 'react';
import { logIn, signUp, checkTokenValidity, fetchUserInfo, refreshAuthToken } from '../services/apiService';
import { getAuthToken, getRefreshToken, setAuthToken, getUserId as fetchUserId, clearAuthToken } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthTokenState] = useState('');
    const [userId, setUserId] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
      // Assuming you fetch user data and set the ID here
      const fetchUser = async () => {
        const userData = await getUserDataFromApi();
        if (userData) {
          setCurrentUserId(userData.id);
        }
      };

      fetchUser();
    }, []);

    useEffect(() => {
      const initializeAuth = async () => {
          const token = await getAuthToken();
          console.log('AuthProvider - Fetched auth token:', token);
          if (token) {
              const storedUserId = await getUserId(); // Fetch the userId correctly
              console.log('AuthProvider - Fetched userId:', storedUserId);
              if (storedUserId) {
                  setAuthTokenState(token);
                  setUserId(storedUserId);
                  const userInfo = await fetchUserInfo(storedUserId);
                  console.log('AuthProvider - Fetched userInfo:', userInfo);
                  setUserInfo(userInfo);
              } else {
                  console.error('AuthProvider - No userId found, logging out');
                  await logOut();
              }
          }
          setIsLoading(false);
      };
      initializeAuth();
    }, []);

    const logInUser = async (email, password) => {
        const response = await logIn(email, password);
        console.log('LogIn Response:', response); // Log the response to ensure userId is present
        if (response.userId) {
            await setAuthToken(response.token, response.refreshToken, response.userId);
            setAuthTokenState(response.token);
            setUserId(response.userId);
            const userInfo = await fetchUserInfo(response.userId);
            setUserInfo(userInfo);
        } else {
            console.error('User ID is missing in the login response');
        }
    };

    const signUpUser = async (email, password, username, fullname) => {
        const response = await signUp(email, password, username, fullname);
        await setAuthToken(response.token, response.refreshToken, response.userId);
        setAuthTokenState(response.token);
        setUserId(response.userId); // Set userId from response
        const userInfo = await fetchUserInfo(response.userId);
        setUserInfo(userInfo);
    };

    const logOut = async () => {
        await clearAuthToken();
        setAuthTokenState('');
        setUserId(null);
        setUserInfo(null);
    };

    const validateToken = async () => {
        if (authToken) {
            const isValid = await checkTokenValidity();
            if (!isValid) {
                const newToken = await refreshAuthToken(await getRefreshToken());
                if (newToken) {
                    await setAuthToken(newToken.token, newToken.refreshToken, newToken.userId);
                    setAuthTokenState(newToken.token);
                    setUserId(newToken.userId); // Set userId from new token
                    const userInfo = await fetchUserInfo(newToken.userId);
                    setUserInfo(userInfo);
                    return true;
                }
                await logOut();
                return false;
            }
            return true;
        }
        return false;
    };

    const refreshTokens = async () => {
        const refreshToken = await getRefreshToken();
        const newTokens = await refreshAuthToken(refreshToken);
        if (newTokens) {
            await setAuthToken(newTokens.token, newTokens.refreshToken, newTokens.userId);
            setAuthTokenState(newTokens.token);
            setUserId(newTokens.userId); // Set userId from new tokens
            const userInfo = await fetchUserInfo(newTokens.userId);
            setUserInfo(userInfo);
        }
    };

    return (
        <AuthContext.Provider value={{ authToken, userId, userInfo, logInUser, signUpUser, logOut, validateToken, isLoading, refreshTokens }}>
            {children}
        </AuthContext.Provider>
    );
};
