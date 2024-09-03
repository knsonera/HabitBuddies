import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

import { getUserId } from '../services/authService';
import { endQuest, fetchQuestParticipants, fetchQuestCategory, fetchQuestOwner, requestToJoinQuest, approveParticipant, removeParticipant, fetchUserFriends, inviteFriendToQuest, handleAcceptInvite, handleDeclineInvite, createCheckIn, fetchQuestCheckIns, fetchUserCheckInsForQuestToday } from '../services/apiService';
import iconsData from '../assets/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressBar from 'react-native-progress/Bar';

const { width } = Dimensions.get('window'); // Get the screen width

const QuestScreen = ({ route }) => {
  const { questDetails } = route.params;
  const navigation = useNavigation();

  const { authToken } = useContext(AuthContext);
  const { userId: currentUserId } = useContext(AuthContext);

  useEffect(() => {
    const verifyUserId = async () => {
      const id = await getUserId();
      console.log('Retrieved user ID:', id);
      if (!id) {
        console.error('User ID could not be retrieved.');
        Alert.alert('Error', 'User ID could not be retrieved.');
        return; // Stop further actions if user ID is missing
      }
    };
    verifyUserId();
  }, []);

  const [participants, setParticipants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [category, setCategory] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [progress, setProgress] = useState(0);
  const [daysPassed, setDaysPassed] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [comment, setComment] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseDuration = (duration) => {
    const [amount, unit] = duration.split(' ');

    const amountNumber = parseInt(amount, 10);
    if (isNaN(amountNumber)) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    switch (unit.toLowerCase()) {
      case 'day':
      case 'days':
        return amountNumber;
      case 'week':
      case 'weeks':
        return amountNumber * 7;
      case 'month':
      case 'months':
        return amountNumber * 30;
      case 'year':
      case 'years':
        return amountNumber * 365;
      default:
        throw new Error(`Unknown duration unit: ${unit}`);
    }
  };

  const calculateDaysPassed = (startDate, duration) => {
    const start = new Date(startDate);
    const now = new Date();
    const daysPassed = Math.ceil((now - start) / (1000 * 60 * 60 * 24)); // Difference in days
    return daysPassed;
  };

  const calculateProgress = (startDate, duration) => {
    const totalDays = parseDuration(duration);
    const daysPassed = calculateDaysPassed(startDate, duration);
    const progress = Math.max(0, Math.min((daysPassed / totalDays) * 100, 100));

    return progress;
  };

  useEffect(() => {
    setLoading(true);

    const loadData = async () => {
      try {
        // Fetch the quest owner ID
        const ownerData = await fetchQuestOwner(questDetails.quest_id);
        setOwnerId(ownerData.user_id);

        // Load Category using the owner's ID
        const categoryData = await fetchQuestCategory(questDetails.quest_id, ownerData.user_id);
        setCategory(categoryData.category_name);

        const questTotalDays = parseDuration(questDetails.duration);
        setTotalDays(questTotalDays);

        const questDaysPassed = calculateDaysPassed(questDetails.start_date, questDetails.duration);
        setDaysPassed(questDaysPassed);

        // Calculate and Set Progress
        const questProgress = calculateProgress(questDetails.start_date, questDetails.duration);
        setProgress(questProgress);

        // Load Participants and Set User Role
        const questParticipants = await fetchQuestParticipants(questDetails.quest_id);
        setParticipants(questParticipants);

        const questCheckIns = await fetchQuestCheckIns(questDetails.quest_id);
        setCheckIns(questCheckIns);

        const isCheckedIn = await fetchUserCheckInsForQuestToday(questDetails.quest_id, currentUserId);
        console.log("is checked in? ", isCheckedIn.length);
        setCheckedIn(isCheckedIn.length > 0);

        const currentUser = questParticipants.find(p => p.user_id === currentUserId);
        if (currentUser) {
          setUserRole(currentUser.role);
          setUserStatus(currentUser.user_status); // Set the user status

        } else {
          setUserRole(null); // User has no role
          setUserStatus(null); // Set the user status

        }

      } catch (error) {
        console.error('Failed to load quest data:', error);
        Alert.alert('Error', 'Failed to load quest data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [questDetails.quest_id, questDetails.start_date, questDetails.duration, currentUserId]);

  // This condition determines if the timeline is complete
  const isTimelineComplete = daysPassed >= totalDays;

  const icon = iconsData.icons[questDetails.icon_id];

  const handleParticipantsPress = async (quest_id) => {
      try {
          const questParticipants = await fetchQuestParticipants(quest_id);

          // Sort participants by role first, then by status
          const sortedParticipants = questParticipants.sort((a, b) => {
              if (a.role === b.role) {
                  return a.user_status.localeCompare(b.user_status);
              }
              return a.role.localeCompare(b.role);
          });

          setParticipants(sortedParticipants);
          setModalVisible(true);
      } catch (error) {
          console.error('Failed to fetch participants:', error);
          Alert.alert('Error', 'Failed to fetch participants.');
      }
  };

  const handleEditPress = (quest) => {
    navigation.navigate('EditQuest', { questDetails: quest });
  };

  const handleChatPress = (questId, questName) => {
    navigation.navigate('Chat', { questId, questName });
  };

  const handleVideoPress = (zoom_link) => {
    console.log(questDetails);
    console.log(zoom_link);
    if (zoom_link) {
      Linking.openURL(zoom_link).catch(err => console.error("Failed to open link: ", err));
    } else {
      alert("No video link added yet. Edit quest to link a video conference.");
    }
  };

  const handleCheckinPress = (questId) => {
    setCheckinModalVisible(true);
  };

  const handleCheckInSubmit = async () => {
    if (comment.trim()) {
        try {
            await createCheckIn(questDetails.quest_id, comment);
            Alert.alert('Success', 'Check-in submitted successfully.');

            // Fetch the updated check-ins
            const updatedCheckIns = await fetchQuestCheckIns(questDetails.quest_id);
            setCheckIns(updatedCheckIns); // Update the state with the new check-ins

            setCheckinModalVisible(false); // Close the modal after submission
            setComment(''); // Clear the comment field
        } catch (error) {
            console.error('Failed to submit check-in:', error);
            if (error.message.includes('You have already checked in today')) {
                Alert.alert('Duplicate Check-In', 'You have already checked in today for this quest.');
            } else {
                Alert.alert('Error', 'Failed to submit check-in. Please try again later.');
            }
        }
    } else {
        Alert.alert('Error', 'Please enter a comment.');
    }
};

  const handleEndPress = () => {
    setConfirmationVisible(true); // Show confirmation modal
  };

  const confirmEndQuest = async () => {
    try {
      await endQuest(questDetails.quest_id);
      Alert.alert('Success', 'Quest has been ended.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to end the quest:', error);
      Alert.alert('Error', 'Failed to end the quest.');
    } finally {
      setConfirmationVisible(false); // Hide confirmation modal
    }
  };

  const handleCompletePress = async () => {
    try {
      await completeQuest(questDetails.quest_id);
      Alert.alert('Yay!', 'Quest is complete.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to complete the quest:', error);
      Alert.alert('Error', 'Failed to complete the quest.');
    }
  }

  const handleRequestToJoin = async () => {
    console.log('Requesting to join quest with ID:', questDetails.quest_id);
    console.log('Current user ID:', currentUserId);

    if (!questDetails.quest_id || !currentUserId) {
        console.error('Missing required data: questId or userId');
        Alert.alert('Error', 'Missing required data.');
        return;
    }

    try {
        await requestToJoinQuest(questDetails.quest_id, authToken);
        Alert.alert('Success', 'Request to join the quest has been sent.');
        setUserStatus('pending'); // Set the status to 'pending' after request is sent
    } catch (error) {
        console.error('Failed to send request to join:', error);
        Alert.alert('Error', 'Failed to send request to join.');
    }
  };

  const handleApprove = async (questId, participantId) => {
    try {
      await approveParticipant(questId, participantId, authToken);
      Alert.alert('Success', 'Participant approved.');
      // Refresh the participants list after approval
      const updatedParticipants = await fetchQuestParticipants(questId);
      setParticipants(updatedParticipants);
    } catch (error) {
      console.error('Failed to approve participant:', error);
      Alert.alert('Error', 'Failed to approve participant.');
    }
  };

  const handleRemove = async (questId, participantId) => {
    try {
      await removeParticipant(questId, participantId, authToken);
      Alert.alert('Success', 'Participant removed.');
      // Refresh the participants list after removal
      const updatedParticipants = await fetchQuestParticipants(questId);
      setParticipants(updatedParticipants);
    } catch (error) {
      console.error('Failed to remove participant:', error);
      Alert.alert('Error', 'Failed to remove participant.');
    }
  };

  const handleInvitePress = async () => {
    try {
      const friendsList = await fetchUserFriends(currentUserId);
      setFriends(friendsList);
      setFilteredFriends(friendsList); // Initially, the filtered list is the same as the full list
      setInviteModalVisible(true);
    } catch (error) {
      console.error('Failed to load friends list:', error);
      Alert.alert('Error', 'Failed to load friends list.');
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter(friend =>
        friend.fullname.toLowerCase().includes(query.toLowerCase()) ||
        friend.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
  };

  const handleInviteFriend = async (friendId) => {
    console.log('Inviting friend with ID:', friendId);
    console.log('Current quest ID:', questDetails.quest_id);
    console.log('Current user ID:', currentUserId);

    if (!friendId || !questDetails.quest_id || !currentUserId) {
      console.error('Missing required data: friendId, questId, or currentUserId');
      Alert.alert('Error', 'Missing required data.');
      return;
    }

    // Check if the friend is already a participant
    const isAlreadyParticipant = participants.some(participant => participant.user_id === friendId);

    if (isAlreadyParticipant) {
      Alert.alert('Notice', 'This friend is already a participant in the quest.');
      return;
    }

    try {
      await inviteFriendToQuest(questDetails.quest_id, friendId, currentUserId);
      Alert.alert('Success', `Invite sent to ${friendId}`);
      setInviteModalVisible(false); // Close the modal after inviting
    } catch (error) {
      console.error('Failed to invite friend:', error);
      Alert.alert('Error', 'Failed to invite friend.');
    }
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
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            {icon.library === 'FontAwesome' ? (
              <Icon name={icon.name} size={50} color="#000" />
            ) : (
              <MaterialCommunityIcons name={icon.name} size={50} color="#000" />
            )}
            <Text style={styles.challengeName}>{questDetails.quest_name}</Text>
          </View>

          <View style={styles.buttonContainer}>
            {userRole === 'owner' || (userRole === 'participant' && userStatus === 'active') ? (
              <>
                {isTimelineComplete && userRole === 'owner' ? (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleCompletePress}
                  >
                    <MaterialCommunityIcons name="check-circle" size={20} color="#000" />
                    <Text style={styles.buttonText}>Complete the Quest</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        checkedIn && { backgroundColor: '#CCFFCC' }
                      ]}
                      onPress={() => !checkedIn && handleCheckinPress(questDetails.quest_id)}
                      disabled={checkedIn}
                    >
                      <MaterialCommunityIcons name="check" size={20} color="#000" />
                      {checkedIn ? (
                        <Text style={styles.buttonText}>Checked in</Text>
                      ) : (
                        <Text style={styles.buttonText}>Check in</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleChatPress(questDetails.quest_id, questDetails.quest_name)}>
                      <MaterialCommunityIcons name="chat" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleVideoPress(questDetails.zoom_link)}>
                      <MaterialCommunityIcons name="video" size={20} color="#000" />
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : userStatus === 'pending' ? (
              <Text style={styles.pendingText}>Request Sent</Text>
            ) : userStatus === 'invited' ? (
              <View style={styles.inviteActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAcceptInvite(quest.quest_id)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#000" />
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeclineInvite(quest.quest_id)}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#000" />
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleRequestToJoin}>
                <Text style={styles.buttonText}>Request to Join</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Bar */}
          {!isTimelineComplete && (
            <View style={styles.progressBarContainer}>
              <Text style={styles.detailsText}>Quest Timeline</Text>
              <ProgressBar
                progress={progress / 100}
                width={width * 0.9}
                color="#4CAF50"
                unfilledColor="#E0E0E0"
                borderWidth={0}
                borderRadius={5}
                height={10}
              />
              <Text style={styles.detailsText}>{`${daysPassed.toFixed(0)} out of ${totalDays.toFixed(0)} days`}</Text>
            </View>
          )}

          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Quest Information</Text>
            <Text style={styles.detailsText}>{questDetails.description}</Text>
            <Text style={styles.detailsText}>Duration: {questDetails.duration}</Text>
          </View>


          <View style={styles.actionButtonContainer}>
            {(userRole === 'owner' || (userRole === 'participant' && userStatus === 'active')) && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleParticipantsPress(questDetails.quest_id)}>
                  <MaterialCommunityIcons name="account-group" size={20} color="#000" />
                  <Text style={styles.buttonText}>Participants</Text>
                </TouchableOpacity>
              </>
            )}
            {userRole === 'owner' && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleInvitePress(questDetails)}>
                  <Icon name="user-plus" size={20} color="#000" />
                  <Text style={styles.buttonText}>Invite Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEditPress(questDetails)}>
                  <Icon name="edit" size={20} color="#000" />
                  <Text style={styles.buttonText}>Edit Quest</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleEndPress}>
                  <Icon name="times-circle" size={20} color="#000" />
                  <Text style={styles.buttonText}>End Quest</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Check-ins by Participants */}
          <View style={styles.checkinSection}>
            <Text style={styles.sectionTitle}>Check-Ins</Text>
            {checkIns.length === 0 ? (
              <Text style={styles.noCheckinsText}>No check-ins yet.</Text>
            ) : (
              checkIns.map((checkin, index) => (
                <View key={index} style={styles.checkinItem}>
                  <View style={styles.checkinHeader}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#000" style={styles.checkmarkIcon} />
                    <Text style={styles.checkinUser}>{checkin.fullname}</Text>
                    <Text style={styles.checkinDate}>{new Date(checkin.checkin_date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.checkinComment}>{checkin.comment}</Text>
                </View>
              ))
            )}
          </View>

        </View>
      </ScrollView>
      <Footer />

      {/* Participants Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Participants</Text>
            <ScrollView style={styles.participantsList}>
              {participants.map((participant, index) => (
                <View key={index} style={styles.participantItem}>
                  <Text style={styles.participantText}>
                    {participant.fullname} ({participant.username})
                  </Text>
                  <View style={styles.participantActions}>
                    {userRole === 'owner' && participant.user_status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={styles.approveButton}
                          onPress={() => handleApprove(questDetails.quest_id, participant.user_id)}
                        >
                          <MaterialCommunityIcons name="check" size={20} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemove(questDetails.quest_id, participant.user_id)}
                        >
                          <MaterialCommunityIcons name="close" size={20} color="#000" />
                        </TouchableOpacity>
                      </>
                    )}
                    {userRole === 'owner' && participant.user_status === 'active' && participant.role === 'participant' && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemove(questDetails.quest_id, participant.user_id)}
                      >
                        <MaterialCommunityIcons name="close" size={20} color="#000" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Invite Friends Modal */}
      <Modal
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setInviteModalVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invite Friends</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            <ScrollView style={styles.participantsList}>
              {filteredFriends.map((friend, index) => {
                // Check if the friend is already a participant
                const isAlreadyParticipant = participants.some(participant => participant.user_id === friend.user_id);

                return (
                  <View key={index} style={styles.participantItem}>
                    <Text style={styles.participantText}>
                      {friend.fullname} ({friend.username})
                    </Text>
                    {!isAlreadyParticipant && (
                      <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={() => handleInviteFriend(friend.user_id)}
                      >
                        <MaterialCommunityIcons name="plus-circle" size={20} color="#000" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
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
            <Text style={styles.confirmationText}>Are you sure you want to end this quest?</Text>
            <View style={styles.confirmationButtonsContainer}>
              <TouchableOpacity
                style={styles.confirmationButton}
                onPress={confirmEndQuest}
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

      {/* Checkin Modal */}
      <Modal
          transparent={true}
          visible={checkinModalVisible}
          onRequestClose={() => setCheckinModalVisible(false)}
      >
        <View style={styles.checkinModalContainer}>
          <View style={styles.checkinModalContent}>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setCheckinModalVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.checkinModalTitle}>Checking-in</Text>

            <Text style={styles.checkinModalDateTime}>{questDetails.quest_name}</Text>

            {/* Current Date and Time */}
            <Text style={styles.checkinModalDateTime}>{new Date().toLocaleString()}</Text>

            {/* Text Field for Note or Comment */}
            <TextInput
              style={styles.textField}
              placeholder="Add a note or comment..."
              onChangeText={setComment}
              value={comment}
            />

            {/* Submit Button */}
            <TouchableOpacity style={styles.checkinSubmitButton} onPress={handleCheckInSubmit}>
              <Text style={styles.checkinSubmitButtonText}>Submit</Text>
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
    paddingTop: 60,
    paddingBottom: 60,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000000',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
  },
  detailsContainer: {
    alignItems: 'flex-start',
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  detailsText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000000',
    paddingHorizontal: 10,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  progressLabel: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#000',
    marginTop: 5,
  },
  actionButtonContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    margin: 5,
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  participantsList: {
    width: '100%',
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  participantText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  participantActions: {
    flexDirection: 'row',
  },
  approveButton: {
    borderWidth: 1,
    borderColor: '#999999',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#999999',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    paddingHorizontal: 5,
  },
  pendingText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#999999',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 10,
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
  inviteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
  },
  declineButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  checkinModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  checkinModalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  checkinModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  checkinModalDateTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  textField: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  checkinSubmitButton: {
    width: '50%',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkinSubmitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkinSection: {
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  noCheckinsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  checkinItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  checkmarkIcon: {
    marginRight: 8,
  },
  checkinUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  checkinDate: {
    fontSize: 12,
    color: '#999',
  },
  checkinComment: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
});

export default QuestScreen;
