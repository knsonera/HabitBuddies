import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Modal, FlatList, ActivityIndicator, TextInput, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import avatarsData from '../assets/avatars.json';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchUserInfo, updateUserProfile, fetchUserQuests, fetchPastUserQuests, requestFriendship, approveFriendship, removeFriendship, fetchFriendshipStatus, fetchFriendshipSender, fetchUserFriends, acceptQuestInvite, declineQuestInvite } from '../services/apiService';


const ProfileScreen = ({ route, navigation }) => {
  const { userId: routeUserId } = route.params || {};
  const { userId: currentUserId } = useContext(AuthContext);

  const userIdToFetch = routeUserId || currentUserId;

  const [userProfile, setUserProfile] = useState(null);
  const [userQuests, setUserQuests] = useState({ current: [], past: [] });
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [isFriendRequestToCurrentUser, setIsFriendRequestToCurrentUser] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [updatedFullname, setUpdatedFullname] = useState('');
  const [updatedUsername, setUpdatedUsername] = useState('');

  const checkFriendshipStatus = async () => {
    try {
      // Load friendship status from server
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
      Alert.alert('Error', 'Failed to fetch friendship status');
    }
  };

  const getFriendsData = async () => {
    setLoading(true);
    try {
      // Load friends from server
      const friends = await fetchUserFriends(userIdToFetch);
      setFriendsList(friends);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch friends list');
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    try {
      // Get user info from server
      const data = await fetchUserInfo(userIdToFetch);

      // Random avatar as a default
      if (!data.avatar_id) {
        const randomAvatar = avatarsData.avatars[Math.floor(Math.random() * avatarsData.avatars.length)].url;
        data.avatar_id = randomAvatar;
      }

      setUserProfile(data);
      setIsCurrentUser(routeUserId == currentUserId);

      setUpdatedFullname(data.fullname);
      setUpdatedUsername(data.username);

      const questsData = await fetchUserQuests(userIdToFetch);
      const pastQuestsData = await fetchPastUserQuests(userIdToFetch);

      setUserQuests({
        current: questsData || [],
        past: pastQuestsData || [],
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
      setUserQuests({ current: [], past: [] });
    } finally {
      setLoading(false);
    }
  };

  const isValidName = (name) => {
    return name.length > 4;
  };

  // Callbacks to handle text input changes
  const handleFullnameChange = useCallback((text) => {
    if(isValidName(text)) {
      setUpdatedFullname(text);
    } else {
      Alert.alert('Error', 'Full name must be longer than 4 characters.');
    }
  }, []);

  const handleUsernameChange = useCallback((text) => {
    if(isValidName(text)) {
      setUpdatedFullname(text);
    } else {
      Alert.alert('Error', 'Username must be longer than 4 characters.');
    }
  }, []);

  // Save changes to database
  const handleSaveProfile = async () => {
      try {
          const updatedData = {
              fullname: updatedFullname,
              username: updatedUsername,
              email: userProfile.email,
              avatar_id: userProfile.avatar_id,
          };

          // Call the API to update the profile
          const response = await updateUserProfile(userIdToFetch, updatedData);

          // Update the local state with the new profile data
          setUserProfile((prevState) => ({
              ...prevState,
              fullname: response.fullname,
              username: response.username,
          }));

          // Update the input fields to reflect the new profile data
          setUpdatedFullname(response.fullname);
          setUpdatedUsername(response.username);

          setEditMode(false);

      } catch (error) {
          Alert.alert('Error', 'Failed to update profile');
      }
    };

  // Buttons
  const renderEditButton = () => (
    <TouchableOpacity style={styles.settingsButton} onPress={() => setEditMode(true)}>
      <Icon name="cog" size={16} color="#000000" />
    </TouchableOpacity>
  );

  const renderSaveButton = () => (
    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
      <Icon name="check" size={16} color="#000000" />
    </TouchableOpacity>
  );

  // Combined all requests to server
  const getProfileContent = async () => {
    try {
        // Set loading to true at the beginning
        setLoading(true);

        // Await all data-loading functions
        await Promise.all([
          checkFriendshipStatus(),
          getUserData(),
          getFriendsData()
        ]);
    } catch (error) {
        Alert.alert('Error', 'Failed to load data');
    } finally {
        setLoading(false);
    }
  }

  // Reloading screen when user data changes
  useEffect(() => {
    if (!userIdToFetch) {
      Alert.alert('Error', 'User ID is undefined');
    }
    getProfileContent();

  }, [userIdToFetch, currentUserId]);

  // Friendship modal data
  useEffect(() => {
    if (modalVisible) {
      getFriendsData();
    }
  }, [modalVisible, userIdToFetch]);

  // Friendship status updates
  useEffect(() => {
    if (friendshipStatus) {
      getProfileContent();
    }
  }, [friendshipStatus]);

  const getAvatarUrl = (avatarId) => {
    const avatar = avatarsData.avatars.find((a) => a.id === avatarId);
    return avatar ? avatar.url : null;
  };

  // Friendship handlers
  const handleAddFriend = async () => {
    try {
      const response = await requestFriendship(userIdToFetch);
      if (response.status === 200) {
        setFriendshipStatus('pending');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request friendship');
    } finally {
      getProfileContent();
    }
  };

  const handleApproveFriend = async () => {
    try {
      const response = await approveFriendship(userIdToFetch);
      if (response.status === 200) {
        setFriendshipStatus('active');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve friendship');
    } finally {
      getProfileContent();
    }
  };

  const handleRemoveFriend = () => {
    setConfirmationVisible(true);
  };

  const confirmRemoveFriend = async () => {
    try {
      const response = await removeFriendship(userIdToFetch);
      if (response.status === 200) {
        setFriendshipStatus('none');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove friendship');
    } finally {
      setConfirmationVisible(false);
      getProfileContent();
    }
  };

  // Friendship Button UI
  const renderFriendshipButton = () => {
    if (isCurrentUser) {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.addButtonText}>
              <Icon name="user-plus" size={16} color="#000000" /> Find Friends
            </Text>
          </TouchableOpacity>
          {editMode ? (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Icon name="check" size={16} color="#000000" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.settingsButton} onPress={() => setEditMode(true)}>
              <Icon name="cog" size={16} color="#000000" />
            </TouchableOpacity>
          )}
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
          <ActivityIndicator size="large" color="#444" />
          <Text>Loading...</Text>
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.errorContainer}>
          <Text>Something went wrong.</Text>
          <Text>{error}</Text>
          <Button title="Retry" onPress={() => fetchData()} />
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

        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.noQuestsText}>No active quests</Text>
          </View>
        )}

        ListHeaderComponent={() => (
          <View>
            <View style={styles.topSection}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                {editMode ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={updatedFullname}
                      onChangeText={setUpdatedFullname}
                      placeholder="Full Name"
                    />
                    <TextInput
                      style={styles.input}
                      value={updatedUsername}
                      onChangeText={setUpdatedUsername}
                      placeholder="Username"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.fullName}>{userProfile.fullname}</Text>
                    <Text style={styles.login}>{userProfile.username}</Text>
                  </>
                )}

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
                    <TouchableOpacity style={styles.questItem} disabled={true}>
                      <View style={styles.questInfo}>
                        <Text style={styles.questTitle}>{item.quest_name}</Text>
                      </View>
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

      {/* Confirmation Modal */}
      <Modal
        transparent={true}
        visible={confirmationVisible}
        onRequestClose={() => setConfirmationVisible(false)}
      >
        <View style={styles.confirmationModalContainer}>
          <View style={styles.confirmationModalContent}>
            <Text style={styles.confirmationText}>Are you sure you want to remove this friend?</Text>
            <View style={styles.confirmationButtonsContainer}>
              <TouchableOpacity
                style={styles.confirmationButton}
                onPress={confirmRemoveFriend}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.cancelButton]}
                onPress={() => setConfirmationVisible(false)}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
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

  confirmationModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  confirmationModalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  confirmationText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff5c5c',
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '80%',
    alignSelf: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#ccffcc',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
});


export default ProfileScreen;
