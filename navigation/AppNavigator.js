import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import SocialScreen from '../screens/SocialScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StartChallengeScreen from '../screens/StartChallengeScreen';
import NewChallengeScreen from '../screens/NewChallengeScreen';
import EditChallengeScreen from '../screens/EditChallengeScreen';
import ChallengeListScreen from '../screens/ChallengeListScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import FindFriendScreen from '../screens/FindFriendScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // Disable default header
          animationEnabled: false, // Disable animations
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Challenge" component={ChallengeScreen} />
        <Stack.Screen name="Social" component={SocialScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="StartChallenge" component={StartChallengeScreen} />
        <Stack.Screen name="NewChallenge" component={NewChallengeScreen} />
        <Stack.Screen name="EditChallenge" component={EditChallengeScreen} />
        <Stack.Screen name="ChallengeList" component={ChallengeListScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="FindFriend" component={FindFriendScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
