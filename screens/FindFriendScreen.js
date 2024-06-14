import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { friendsList } from '../assets/mockData';

const users = friendsList;

const FindFriendScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(users);

  const handleSearch = () => {
    if (searchText === '') {
      setFilteredData(users);
    } else {
      setFilteredData(users.filter(user =>
        user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.login.toLowerCase().includes(searchText.toLowerCase())
      ));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Find Friends</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listContainer}>
          {filteredData.map((user, index) => (
            <TouchableOpacity
              key={index}
              style={styles.userItem}
              onPress={() => navigation.navigate('Profile', { user })}
            >
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userLogin}>{user.login}</Text>
              </View>
              <TouchableOpacity style={styles.addButton}>
                <FontAwesome name="user-plus" size={24} color="grey" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#666666',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  searchButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userLogin: {
    color: '#888',
  },
  addButton: {
    padding: 10,
  },
});

export default FindFriendScreen;
