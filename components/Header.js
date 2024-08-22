import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const Header = ({ userInfo }) => {
  const { logOut } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();

  const handleLogout = async () => {
    navigation.navigate('Welcome');
    await logOut();
  };

  const goToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {route.name !== 'Home' ? (
          <View style={styles.headerLeftContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerTitle} onPress={goToHome}>
              <Text style={styles.headerTitle}>Habit Buddies</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerLeftContainer}>
            <MaterialCommunityIcons name="account-group" size={30} color="black" />
            <Text style={styles.headerTitle}>Habit Buddies</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={30} color="black" />
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
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 50,  // TODO: change to width/2 - C
  },
});

export default Header;
