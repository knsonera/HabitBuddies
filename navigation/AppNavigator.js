import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import StartQuestScreen from '../screens/StartQuestScreen';
import QuestTemplatesScreen from '../screens/QuestTemplatesScreen';
import NewQuestScreen from '../screens/NewQuestScreen';
import EditQuestScreen from '../screens/EditQuestScreen';
import QuestScreen from '../screens/QuestScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DevelopmentScreen from '../screens/DevelopmentScreen';
import SocialScreen from '../screens/SocialScreen';


const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthLoading"
        screenOptions={{
          headerShown: false, // Disable default header
          animationEnabled: false, // Disable animations
        }}
      >
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="StartQuest" component={StartQuestScreen} />
        <Stack.Screen name="QuestTemplates" component={QuestTemplatesScreen} />
        <Stack.Screen name="NewQuest" component={NewQuestScreen} />
        <Stack.Screen name="EditQuest" component={EditQuestScreen} />
        <Stack.Screen name="Quest" component={QuestScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Development" component={DevelopmentScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Social" component={SocialScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
