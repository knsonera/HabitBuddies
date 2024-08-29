import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import avatarsData from '../assets/avatars.json'; // Import the local JSON file

import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchUserInfo, fetchUserQuests, requestFriendship, approveFriendship, removeFriendship, fetchFriendshipStatus, fetchFriendshipSender, fetchUserFriends, acceptQuestInvite, declineQuestInvite } from '../services/apiService';


const ProfileScreen = ({ route, navigation }) => {
  const { userId: routeUserId } = route.params || {};
  const { userId: currentUserId } = useContext(AuthContext);

  const userIdToFetch = routeUserId || currentUserId;

  const [userProfile, setUserProfile] = useState(null);
  const [userQuests, setUserQuests] = useState({ current: [], past: [] });
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [isFriendRequestToCurrentUser, setIsFriendRequestToCurrentUser] = useState(false);
  const [friendsList, setFriendsList] = useState([]);

  const checkFriendshipStatus = async () => {
    try {
      const response = await fetchFriendshipStatus(userIdToFetch);
      const status = response.status;
      setFriendshipStatus(status);

      if (status === 'pending') {
        const senderResponse = await fetchFriendshipSender(userIdToFetch);
        const senderId = senderResponse.senderId;

        const isFriendRequestToCurrentUser = senderId !== currentUserId;
        setIsFriendRequestToCurrentUser(isFriendRequestToCurrentUser);
      }
    } catch (error) {
      console.error('Error fetching friendship status:', error);
    }
  };

  const getFriendsData = async () => {
    try {
      const friends = await fetchUserFriends(userIdToFetch);
      console.log('Friends List:', friends); 
      setFriendsList(friends);
    } catch (error) {
      console.error('Failed to fetch friends list:', error);
    }
  };

  const getUserData = async () => {
    try {
      const data = await fetchUserInfo(userIdToFetch);

      if (!data.avatar_id) {
        const randomAvatar = avatarsData.avatars[Math.floor(Math.random() * avatarsData.avatars.length)].url;
        data.avatar_id = randomAvatar;
      }

      setUserProfile(data);
      setIsCurrentUser(routeUserId == currentUserId);

      const questsData = await fetchUserQuests(userIdToFetch);
      console.log(questsData);

      const currentQuests = questsData.filter(quest => quest.status === 'active');
      const pastQuests = questsData.filter(quest => quest.status === 'completed' || quest.status === 'dropped');

      setUserQuests({
        current: currentQuests || [],
        past: pastQuests || [],
      });

    } catch (error) {
      console.error('Failed to load user data:', error);
      setUserQuests({ current: [], past: [] });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!userIdToFetch) {
      console.error('Error: User ID is undefined');
    }
    checkFriendshipStatus();
    getUserData();
    getFriendsData();

  }, [userIdToFetch, currentUserId]);

  useEffect(() => {
    if (modalVisible) {
      getFriendsData();
    }
  }, [modalVisible, userIdToFetch]);

  const getAvatarUrl = (avatarId) => {
    const avatar = avatarsData.avatars.find((a) => a.id === avatarId);
    return avatar ? avatar.url : null;
  };

  const handleAddFriend = async () => {
    try {
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.addButtonText}>
              <Icon name="user-plus" size={16} color="#000000" /> Find Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <Icon name="cog" size={16} color="#000000" />
          </TouchableOpacity>
        </View>
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
            <Icon name="user-plus" size={16} color="#000000" /> Become Friends
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
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

  const avatarUrl = getAvatarUrl(userProfile.avatar_id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <FlatList
        data={userQuests.current}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.questItem}
            onPress={() => navigation.navigate('Quest', { questDetails: item })}
          >
            <View style={styles.questInfo}>
              <Text style={styles.questTitle}>{item.quest_name}</Text>
            </View>
          </TouchableOpacity>
        )}

        ListHeaderComponent={() => (
          <View>
            <View style={styles.topSection}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <Text style={styles.fullName}>{userProfile.fullname}</Text>
              <Text style={styles.login}>{userProfile.username}</Text>

              {renderFriendshipButton()}

            </View>
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
                  <Text style={styles.summaryValue}>{friendsList.length}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Current Quests</Text>
          </View>
        )}

        ListFooterComponent={() => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Quests</Text>
            {userQuests.past.length === 0 ? (
              <Text style={styles.noQuestsText}>No past quests</Text>
            ) : (
              <FlatList
                data={userQuests.past}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.questItem}
                    onPress={() => navigation.navigate('QuestDetails', { questId: item.id })}
                  >
                    <Text style={styles.questText}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
      />
      <Footer />

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Friends</Text>
            {friendsList.length === 0 ? (
              <Text style={styles.noFriendsText}>No active friends found.</Text>
            ) : (
              <FlatList
                data={friendsList}
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.friendItem}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('Profile', { userId: item.user_id });
                    }}
                  >
                    <Image
                      source={{ uri: getAvatarUrl(item.avatar_id) }}
                      style={styles.friendAvatar}
                    />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.fullname}</Text>
                      <Text style={styles.friendLogin}>{item.username}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
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
    width: '90%',
    paddingHorizontal: 10,
  },
  topSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#000',
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
    marginBottom: 10,
  },
  currentUserText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 5,
  },
  buttonContainer: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    flex: 4,
    marginHorizontal: 5,
    justifyContent: 'center',
    elevation: 3,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
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
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  followButtonText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    width: '100%',
    color: '#000',
  },
  questsSection: {
    alignItems: 'flex-start',
    width: '100%',
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  questText: {
    fontSize: 18,
    color: '#000',
    marginHorizontal: 20,
  },
  summarySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '90%'
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  friendInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  friendLogin: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  unfollowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  pendingText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 10,
  },
  noQuestsText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'left',
    marginHorizontal: 20,
  },
  noFriendsText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginVertical: 20,
  },
});


export default ProfileScreen;
