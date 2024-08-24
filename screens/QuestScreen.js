import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

import { endQuest, fetchQuestParticipants, fetchQuestCategory, fetchQuestOwner, requestToJoinQuest } from '../services/apiService';
import iconsData from '../assets/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressBar from 'react-native-progress/Bar';

const { width } = Dimensions.get('window'); // Get the screen width

const QuestScreen = ({ route }) => {
  const { questDetails } = route.params;
  const navigation = useNavigation();

  const { userId: currentUserId, authToken } = useContext(AuthContext);

  const [participants, setParticipants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [progress, setProgress] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [ownerId, setOwnerId] = useState(null);

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

  const calculateProgress = (startDate, duration) => {
    const totalDays = parseDuration(duration);
    const start = new Date(startDate);
    const now = new Date();

    const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24)); // Difference in days
    const progress = Math.min((daysPassed / totalDays) * 100, 100); // Doesn't exceed 100%

    return progress;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch the quest owner ID
        const ownerData = await fetchQuestOwner(questDetails.quest_id);
        setOwnerId(ownerData.user_id);

        // Load Category using the owner's ID
        const categoryData = await fetchQuestCategory(questDetails.quest_id, ownerData.user_id);
        setCategory(categoryData.category_name);

        // Calculate and Set Progress
        const questProgress = calculateProgress(questDetails.start_date, questDetails.duration);
        setProgress(questProgress);

        // Load Participants and Set User Role
        const questParticipants = await fetchQuestParticipants(questDetails.quest_id);
        setParticipants(questParticipants);

        const currentUser = questParticipants.find(p => p.user_id === currentUserId);
        if (currentUser) {
          setUserRole(currentUser.role);
          setUserStatus(currentUser.status); // Set the user status

        } else {
          setUserRole(null); // User has no role
          setUserStatus(null); // Set the user status

        }

      } catch (error) {
        console.error('Failed to load quest data:', error);
        Alert.alert('Error', 'Failed to load quest data.');
      }
    };

    loadData();

  }, [questDetails.quest_id, questDetails.start_date, questDetails.duration, currentUserId]);

  const icon = iconsData.icons[questDetails.icon_id];

  const handleVideoPress = (zoom_link) => {
    if (zoom_link) {
      Linking.openURL(zoom_link).catch(err => console.error("Failed to open link: ", err));
    } else {
      alert("No video link added yet. Edit quest to link a video conference.");
    }
  };

  const handleParticipantsPress = async (quest_id) => {
      try {
          const questParticipants = await fetchQuestParticipants(quest_id);

          // Sort participants by role first, then by status
          const sortedParticipants = questParticipants.sort((a, b) => {
              if (a.role === b.role) {
                  return a.status.localeCompare(b.status);
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

  const handleChatPress = (questId) => {
    navigation.navigate('Chat', { questId });
  };

  const handleEndPress = async () => {
    try {
      await endQuest(questDetails.quest_id);
      Alert.alert('Success', 'Quest has been ended.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to end the quest:', error);
      Alert.alert('Error', 'Failed to end the quest.');
    }
  };

  const handleRequestToJoin = async () => {
    try {
      await requestToJoinQuest(questDetails.quest_id, authToken);
      Alert.alert('Success', 'Request to join the quest has been sent.');
      setUserStatus('pending'); // Set the status to 'pending' after request is sent
    } catch (error) {
      console.error('Failed to send request to join:', error);
      Alert.alert('Error', 'Failed to send request to join.');
    }
  };

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
                <TouchableOpacity style={styles.button} onPress={() => handleChatPress(questDetails.quest_id)}>
                  <MaterialCommunityIcons name="chat" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handleVideoPress(questDetails.zoom_link)}>
                  <MaterialCommunityIcons name="video" size={20} color="#000" />
                </TouchableOpacity>
              </>
            ) : userStatus === 'pending' ? (
              <Text style={styles.pendingText}>Request Sent</Text>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleRequestToJoin}>
                <Text style={styles.buttonText}>Request to Join</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>{questDetails.description}</Text>
            <Text style={styles.detailsText}>Category: {category || 'Loading...'}</Text>
            <Text style={styles.detailsText}>Duration: {questDetails.duration}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Text style={styles.detailsText}>Progress:</Text>
            <ProgressBar
              progress={progress / 100}
              width={width * 0.8}
              color="#4CAF50" // Green color for the bar
              unfilledColor="#E0E0E0" // Light gray for the unfilled portion
              borderWidth={0} // Remove border for a cleaner look
              borderRadius={5} // Rounded corners
              height={10} // Slimmer height
            />
            <Text style={styles.detailsText}>{`${progress.toFixed(2)}% complete`}</Text>
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

        </View>
      </ScrollView>
      <Footer />

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
                    {userRole === 'owner' && participant.status === 'pending' && (
                      <TouchableOpacity style={styles.approveButton} >
                        <Text style={styles.buttonText}>Approve</Text>
                      </TouchableOpacity>
                    )}
                    {userRole === 'owner' && participant.status === 'active' && participant.role === 'participant' && (
                      <TouchableOpacity style={styles.removeButton} >
                        <Text style={styles.buttonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
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
    marginBottom: 20,
  },
  challengeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000000',
  },
  buttonContainer: {
    width: '100%', // Full width for the container
    flexDirection: 'row', // Align buttons in a row
    justifyContent: 'center', // Center the buttons horizontally
    alignItems: 'center', // Center the buttons vertically
    paddingHorizontal: 15, // Add padding to the container
    marginVertical: 10, // Vertical margin for spacing
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#f5f5f5', // Light background for better visibility
    marginHorizontal: 10, // Add spacing between buttons
    justifyContent: 'center', // Center the content inside the button
  },
  buttonText: {
    marginLeft: 8, // Spacing between icon and text
    fontSize: 14,
    color: '#000000',
  },
  detailsContainer: {
    alignItems: 'flex-start',
    width: '80%',
    marginVertical: 20,
  },
  detailsText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000000',
  },
  progressBarContainer: {
    width: '80%',
    alignItems: 'flex-start',
    marginVertical: 20,
  },
  progressLabel: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#4CAF50', // Same color as the progress bar
    marginTop: 5,
  },
  actionButtonContainer: {
    width: '80%',
    alignItems: 'center',
    flexDirection: 'row', // Align buttons in a row
    flexWrap: 'wrap', // Allow buttons to wrap to the next line if necessary
    justifyContent: 'center', // Center the buttons
    marginVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: '#f5f5f5', // Light background for better visibility
    margin: 5, // Add spacing between buttons
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
    flexDirection: 'row', // Align items in a row
    justifyContent: 'space-between', // Space between the text and button
    alignItems: 'center', // Center items vertically
    paddingVertical: 10, // Padding for spacing
    paddingHorizontal: 10, // Horizontal padding for spacing
    borderBottomWidth: 1, // Bottom border to separate items
    borderBottomColor: '#ddd', // Light gray color for the border
  },
  participantText: {
    fontSize: 16,
    color: '#000',
    flex: 1, // Allow text to take up as much space as needed
  },
  participantActions: {
    flexDirection: 'row', // Arrange buttons in a row
  },
  approveButton: {
    borderWidth: 1,
    borderColor: '#999999',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10, // Space between buttons
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#999999',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10, // Space between buttons
  },
  buttonText: {
    color: '#000000', // White text color
    fontSize: 14,
    paddingHorizontal: 5,
  },
  pendingText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center', // Center the text horizontally
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#999999',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignSelf: 'center', // Ensure the text is centered within its parent
    marginVertical: 10, // Margin for spacing
  },
});

export default QuestScreen;
