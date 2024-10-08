import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const Footer = ({ hasUnreadPowerUps, powerUps }) => {
  const navigation = useNavigation();
  const { userId } = useContext(AuthContext); // Get the current user's ID from AuthContext

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.footerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="home" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Social')}>
          <MaterialCommunityIcons name="account-group" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('StartQuest')}>
          <MaterialCommunityIcons name="plus" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('PowerUp', { powerUps: powerUps ?? null })}>
          <MaterialCommunityIcons name="heart" size={30} color={hasUnreadPowerUps ? "red" : "#000"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => userId && navigation.navigate('Profile', { userId })}>
          <MaterialCommunityIcons name="account" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8f8f8',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});

export default Footer;
