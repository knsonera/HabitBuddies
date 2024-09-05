import React, { createContext, useState, useEffect, useMemo } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { logIn, signUp, fetchUserInfo,checkTokenValidity } from '../services/apiService';
import { getAuthToken, refreshAuthToken, setAuthToken, getUserId, clearAuthToken } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthTokenState] = useState('');
    const [userId, setUserId] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(true); // Track network status

    // Initialize the authentication state when the app loads
    useEffect(() => {
        // Listen for network status changes
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        const initializeAuth = async () => {
            const token = await getAuthToken();
            if (token) {
                const storedUserId = await getUserId();
                if (storedUserId) {
                    setAuthTokenState(token);
                    setUserId(storedUserId);
                    try {
                        // Fetch and set user information
                        const userInfo = await fetchUserInfo(storedUserId);
                        setUserInfo(userInfo);
                    } catch (error) {
                        console.error('AuthProvider - Error fetching user info:', error);
                        await logOut(); // Log out if fetching user info fails
                    }
                } else {
                    console.error('AuthProvider - No userId found, logging out');
                    await logOut();
                }
            }
            setIsLoading(false);
        };
        initializeAuth();

        // Clean up the network listener when component unmounts
        return () => {
            unsubscribe();
        };
    }, []);

    // Handle user login
    const logInUser = async (email, password) => {
        if (!isConnected) {
            Alert.alert('No Internet Connection', 'Please check your network connection and try again.');
            return;
        }
        try {
            const response = await logIn(email, password);
            if (response.userId) {
                await setAuthToken(response.token, response.refreshToken, response.userId);
                setAuthTokenState(response.token);
                setUserId(response.userId);
                const userInfo = await fetchUserInfo(response.userId);
                setUserInfo(userInfo);
            } else {
                console.error('User ID is missing in the login response');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // Handle user sign up
    const signUpUser = async (email, password, username, fullname) => {
        if (!isConnected) {
            Alert.alert('No Internet Connection', 'Please check your network connection and try again.');
            return;
        }
        try {
            const response = await signUp(email, password, username, fullname);
            await setAuthToken(response.token, response.refreshToken, response.userId);
            setAuthTokenState(response.token);
            setUserId(response.userId);
            const userInfo = await fetchUserInfo(response.userId);
            setUserInfo(userInfo);
        } catch (error) {
            console.error('Sign-up failed:', error);
            throw error;
        }
    };

    // Handle user log out
    const logOut = async () => {
        await clearAuthToken();
        setAuthTokenState('');
        setUserId(null);
        setUserInfo(null);
    };

    // Validate the current token and refresh it if necessary
    const validateToken = async () => {
      if (!isConnected) {
          Alert.alert('No Internet Connection', 'Please check your network connection and try again.');
          return;
      }
      if (authToken) {
        try {
          const isValid = await checkTokenValidity();
          if (!isValid) {
            const newToken = await refreshAuthToken();
            if (newToken) {
              await setAuthToken(newToken.token, newToken.refreshToken, newToken.userId);
              setAuthTokenState(newToken.token);
              setUserId(newToken.userId);
              const userInfo = await fetchUserInfo(newToken.userId);
              setUserInfo(userInfo);
              return true;
            } else {
              throw new Error('Session expired.');
            }
          }
          return true;
        } catch (error) {
          await logOut(); // Log out if token refresh fails
          Alert.alert('Session expired', 'Please log in again.'); // Show an alert for better user feedback
          console.error('Token validation failed:', error);
          return false;
        }
      }
      return false;
    };

    // Function to refresh tokens manually
    const refreshTokens = async () => {
        if (!isConnected) {
            Alert.alert('No Internet Connection', 'Please check your network connection and try again.');
            return;
        }
        const newTokens = await refreshAuthToken();
        if (newTokens) {
            await setAuthToken(newTokens.token, newTokens.refreshToken, newTokens.userId);
            setAuthTokenState(newTokens.token);
            setUserId(newTokens.userId);
            const userInfo = await fetchUserInfo(newTokens.userId);
            setUserInfo(userInfo);
        } else {
            await logOut();
        }
    };

    const authContextValue = useMemo(() => ({
        authToken,
        userId,
        userInfo,
        logInUser,
        signUpUser,
        logOut,
        validateToken,
        isLoading,
        refreshTokens,
        isConnected
    }), [authToken, userId, userInfo, isLoading, isConnected]);

    // Provide the authentication state and functions to the app
    return (
        <AuthContext.Provider value={authContextValue}>
          {isLoading ? (
              <SafeAreaView style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#444" />
                  <Text>Loading...</Text>
              </SafeAreaView>
          ) : (
              children
          )}
        </AuthContext.Provider>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
