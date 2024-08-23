import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import avatarsData from '../assets/avatars.json'; // Import the local JSON file

import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchUserInfo, fetchUserQuests, requestFriendship, approveFriendship, removeFriendship, fetchFriendshipStatus, fetchFriendshipSender } from '../services/apiService';


const ProfileScreen = ({ route, navigation }) => {
  const { userId: routeUserId } = route.params || {};
  const { userId: currentUserId } = useContext(AuthContext);

  const userIdToFetch = routeUserId || currentUserId;

  const [userProfile, setUserProfile] = useState(null);
  const [userQuests, setUserQuests] = useState({ current: [], past: [] });
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [isFriendRequestToCurrentUser, setIsFriendRequestToCurrentUser] = useState(false);

  useEffect(() => {
    //console.log('AuthContext currentUserId:', currentUserId);
    console.log('Route userId:', routeUserId);
    console.log('UserId to Fetch:', userIdToFetch);

    if (!userIdToFetch) {
      console.error('Error: User ID is undefined');
    }

    const checkFriendshipStatus = async () => {
      try {
        const response = await fetchFriendshipStatus(userIdToFetch);
        const status = response.status;
        setFriendshipStatus(status);

        if (status === 'pending') {
          const senderResponse = await fetchFriendshipSender(userIdToFetch);
          const senderId = senderResponse.senderId;

          // Determine if the current user is the recipient of the friend request
          const isFriendRequestToCurrentUser = senderId !== currentUserId;
          setIsFriendRequestToCurrentUser(isFriendRequestToCurrentUser);

          console.log('Friendship status:', status, 'Sender ID:', senderId, 'Is request to current user:', isFriendRequestToCurrentUser);
        }
      } catch (error) {
        console.error('Error fetching friendship status:', error);
      }
    };

    checkFriendshipStatus();

    const getUserData = async () => {
      try {
        console.log('Fetching user data for userId:', userIdToFetch);
        if (!userIdToFetch) {
          throw new Error('User ID is required');
        }
        const data = await fetchUserInfo(userIdToFetch);
        console.log('Fetched user profile:', data);

        // Assign a random avatar if the user doesn't have one
        if (!data.avatar_id) {
          const randomAvatar = avatarsData.avatars[Math.floor(Math.random() * avatarsData.avatars.length)].url;
          data.avatar_id = randomAvatar;
        }

        setUserProfile(data);
        setIsCurrentUser(routeUserId == currentUserId);

        // Fetch user's quests
        console.log('Fetching user quests for userId:', userIdToFetch);
        const questsData = await fetchUserQuests(userIdToFetch);

        const currentQuests = questsData.filter(quest => quest.status === 'active');
        const pastQuests = questsData.filter(quest => quest.status === 'completed' || quest.status === 'dropped');

        console.log('Fetched user quests:', questsData);
        setUserQuests({
          current: currentQuests || [],
          past: pastQuests || [],
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        setUserQuests({ current: [], past: [] }); // Ensure it's an object with arrays in case of error
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    getUserData();
  }, [userIdToFetch, currentUserId]);

  // Function to get avatar URL by avatar ID
  const getAvatarUrl = (avatarId) => {
    const avatar = avatarsData.avatars.find((a) => a.id === avatarId);
    return avatar ? avatar.url : null;
  };

  const handleAddFriend = async () => {
    try {
      console.log("Sending friend request from:", currentUserId, "to:", userIdToFetch);
      const response = await requestFriendship(userIdToFetch);
      if (response.status === 200) {
        setFriendshipStatus('pending');
      }
    } catch (error) {
      console.error('Error requesting friendship:', error);
    }
  };

  const handleApproveFriend = async () => {
    try {
      const response = await approveFriendship(userIdToFetch);
      if (response.status === 200) {
        setFriendshipStatus('active');
      }
    } catch (error) {
      console.error('Error approving friendship:', error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const response = await removeFriendship(userIdToFetch);
      if (response.status === 200) {
        setFriendshipStatus('none');
      }
    } catch (error) {
      console.error('Error removing friendship:', error);
    }
  };

  const renderFriendshipButton = () => {
    if (isCurrentUser) {
      return (
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.addButtonText}>
            <Icon name="user-plus" size={16} color="#000000" /> Find Friends
          </Text>
        </TouchableOpacity>
      );
    }

    if (friendshipStatus === 'none') {
      return (
        <TouchableOpacity style={styles.followButton} onPress={handleAddFriend}>
          <Text style={styles.followButtonText}>
            <Icon name="user-plus" size={16} color="#000000" /> Add to Friends
          </Text>
        </TouchableOpacity>
      );
    }

    if (friendshipStatus === 'pending' && !isFriendRequestToCurrentUser) {
      console.log('Friendship pending');
      return <Text style={styles.pendingText}>Friend Request Sent</Text>;
    }

    if (friendshipStatus === 'active') {
      return (
        <TouchableOpacity style={styles.unfollowButton} onPress={handleRemoveFriend}>
          <Text style={styles.unfollowButtonText}>
            <Icon name="user-times" size={16} color="#000000" /> Bye-Bye Friend
          </Text>
        </TouchableOpacity>
      );
    }

    if (friendshipStatus === 'pending' && isFriendRequestToCurrentUser) {
      return (
        <TouchableOpacity style={styles.approveButton} onPress={handleApproveFriend}>
          <Text style={styles.approveButtonText}>
            <Icon name="user-check" size={16} color="#000000" /> Become Friends
          </Text>
        </TouchableOpacity>
      );
    }

    return null; // Default case if no conditions are met
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text>Failed to load user profile.</Text>
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  console.log('Rendering ProfileScreen with userProfile:', userProfile);
  console.log('Current quests:', userQuests.current);
  console.log('Past quests:', userQuests.past);

  const avatarUrl = getAvatarUrl(userProfile.avatar_id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <Text style={styles.fullName}>{userProfile.fullname}</Text>
            <Text style={styles.login}>{userProfile.username}</Text>
            {isCurrentUser && <Text style={styles.currentUserText}>Current User</Text>}
          </View>

          {renderFriendshipButton()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summarySection}>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="trophy" size={24} color="#000000" />
                <Text style={styles.summaryTitle}>Quests</Text>
                <Text style={styles.summaryValue}>{userQuests.current.length}</Text>
              </View>
              <TouchableOpacity style={styles.summaryItem} onPress={() => setModalVisible(true)}>
                <Icon name="users" size={24} color="#000000" />
                <Text style={styles.summaryTitle}>Friends</Text>
                <Text style={styles.summaryValue}>{userProfile.friends}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsSection}>
              {/* Display achievements here */}
            </View>
          </View>
          {!isCurrentUser && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Quests</Text>
                <View style={styles.questsSection}>
                  {userQuests.current.map((quest) => (
                    <TouchableOpacity
                      key={quest.id}
                      style={styles.questItem}
                      onPress={() => navigation.navigate('QuestDetails', { questId: quest.id })}
                    >
                      <Text style={styles.questText}>{quest.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past Quests</Text>
                <View style={styles.questsSection}>
                  {userQuests.past.map((quest) => (
                    <View key={quest.id} style={styles.questItem}>
                      <Text style={styles.questText}>{quest.title}</Text>
                    </View>
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
              data={userProfile.friendsList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.friendItem}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Profile', { userId: item.id });
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
    backgroundColor: '#FFFFFF',
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
  currentUserText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
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
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    marginBottom: 10,
    backgroundColor: '#ffcc00', // Bright yellow for visibility
  },
  followButtonText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
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
  questsSection: {
    alignItems: 'flex-start',
    width: '100%',
  },
  questItem: {
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
  questText: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    marginBottom: 10,
    backgroundColor: '#e0f7fa',
  },
  unfollowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    marginBottom: 10,
    backgroundColor: '#ffebee',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    marginBottom: 10,
    backgroundColor: '#c8e6c9',
  },
  pendingText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 10,
  },
});

export default ProfileScreen;
