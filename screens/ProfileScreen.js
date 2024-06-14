import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { currentUserProfile, friendsList } from '../assets/mockData';

const ProfileScreen = ({ route, navigation }) => {

  const { userProfile, isCurrentUser } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            <Text style={styles.fullName}>{userProfile.fullName}</Text>
            <Text style={styles.login}>{userProfile.login}</Text>
          </View>
          {isCurrentUser ? (
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('FindFriend')}>
              <Text style={styles.addButtonText}>
                <Icon name="user-plus" size={16} color="#000000" /> Add Friends
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.followButton} onPress={() => {}}>
              <Text style={styles.followButtonText}>
                <Icon name="user-plus" size={16} color="#000000" /> Follow
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summarySection}>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="fire" size={24} color="#000000" />
                <Text style={styles.summaryTitle}>Current Streak</Text>
                <Text style={styles.summaryValue}>{userProfile.currentStreak}</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="trophy" size={24} color="#000000" />
                <Text style={styles.summaryTitle}>Challenges</Text>
                <Text style={styles.summaryValue}>{userProfile.challenges}</Text>
              </View>
              <TouchableOpacity style={styles.summaryItem} onPress={() => setModalVisible(true)}>
                <Icon name="users" size={24} color="#000000" />
                <Text style={styles.summaryTitle}>Friends</Text>
                <Text style={styles.summaryValue}>{userProfile.friends}</Text>
              </TouchableOpacity>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="star-circle" size={24} color="#000000" />
                <Text style={styles.summaryTitle}>Score</Text>
                <Text style={styles.summaryValue}>{userProfile.score}</Text>
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsSection}>
              {userProfile.badges.map((badge, index) => (
                <Image key={index} source={{ uri: badge }} style={styles.badge} />
              ))}
            </View>
          </View>
          {!isCurrentUser && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Challenges</Text>
                <View style={styles.challengesSection}>
                  {userProfile.currentChallenges.map((challenge, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.challengeItem}
                      onPress={() => navigation.navigate('Challenge', { challengeDetails: challenge })}
                    >
                      <View style={styles.challengeContent}>
                        {challenge.library === 'FontAwesome' ? (
                          <Icon name={challenge.icon} size={24} style={styles.challengeIcon} />
                        ) : (
                          <MaterialCommunityIcons name={challenge.icon} size={24} style={styles.challengeIcon} />
                        )}
                        <Text style={styles.challengeText}>{challenge.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                </View>
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past Challenges</Text>
                <View style={styles.challengesSection}>
                  {userProfile.pastChallenges.map((challenge, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.challengeItem}
                      onPress={() => navigation.navigate('Challenge', { challengeDetails: challenge })}
                    >
                      <View style={styles.challengeContent}>
                        {challenge.library === 'FontAwesome' ? (
                          <Icon name={challenge.icon} size={24} style={styles.challengeIcon} />
                        ) : (
                          <MaterialCommunityIcons name={challenge.icon} size={24} style={styles.challengeIcon} />
                        )}
                        <Text style={styles.challengeText}>{challenge.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <Footer />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Friends</Text>
            <FlatList
              data={friendsList}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.friendItem}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Profile', { userProfile: item, isCurrentUser: false });
                  }}
                >
                  <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{item.fullName}</Text>
                    <Text style={styles.friendLogin}>{item.login}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background 
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingHorizontal: 20,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  login: {
    fontSize: 16,
    color: '#888888',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 10,
  },
  followButtonText: {
    color: '#000000',
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'left',
    width: '100%',
  },
  challengesSection: {
    alignItems: 'flex-start',
    width: '100%',
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIcon: {
    marginRight: 10,
  },
  challengeText: {
    fontSize: 18,
    color: '#000',
  },
  summarySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  summaryValue: {
    fontSize: 20,
    color: '#000000',
  },
  achievementsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  badge: {
    width: 50,
    height: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendInfo: {
    flexDirection: 'column',
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendLogin: {
    fontSize: 14,
    color: '#888',
  },
  closeButton: {
    backgroundColor: '#444444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ProfileScreen;
