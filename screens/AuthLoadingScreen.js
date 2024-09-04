import React, { useEffect, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const AuthLoadingScreen = () => {
  const { authToken, userId, logOut, validateToken } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      if (!authToken || !userId) {
        navigation.navigate('Welcome');
        return;
      }

      try {
        // Check if token is valid
        const isValid = await validateToken();
        if (isValid) {
          navigation.navigate('Home');
        } else {
          await logOut();
          navigation.navigate('Welcome');
        }
      } catch (error) {
        Alert.alert('Session Error', 'Failed to validate session. Please log in again.');
        await logOut();
        navigation.navigate('Welcome');
      }
    };

    checkAuthStatus();
  }, [authToken, userId, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthLoadingScreen;
