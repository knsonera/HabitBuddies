import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';

import { useNavigation } from '@react-navigation/native';

const Header = () => {
  // Placeholder functions and values
  const toggleSidebar = () => alert('Sidebar toggled');
  const userScore = 100; // Placeholder score
  const currentStreak = 5; // Placeholder streak
  const currentChallenge = 'Workout'; // Placeholder challenge

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={toggleSidebar}>
          <MaterialCommunityIcons name="menu" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.text}>Score: {userScore}</Text>
        <Text style={styles.text}>Streak: {currentStreak}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <MaterialCommunityIcons name="rocket" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
});

export default Header;
