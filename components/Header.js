import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
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

  const screenWidth = Dimensions.get('window').width;
  const titleWidth = 0;
  const iconWidth = 65;

  const marginLeft = screenWidth / 2 - iconWidth;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeftContainer}>
          {route.name !== 'Home' ? (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={30} color="black" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity disabled={true}>
              <MaterialCommunityIcons name="account-group" size={30} color="black" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.headerTitle, { marginLeft }]}
          onPress={route.name !== 'Home' ? goToHome : null}
          disabled={route.name === 'Home'}
        >
          <Text style={styles.headerTitleText}>Habit Buddies</Text>
        </TouchableOpacity>

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
    position: 'absolute',
    left: 0,
    right: 0,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Header;
