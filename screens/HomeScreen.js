import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchUserQuests, fetchUserInfo, acceptQuestInvite, declineQuestInvite, createCheckIn, fetchUserCheckInsToday, fetchPowerUps } from '../services/apiService';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import iconsData from '../assets/icons';

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const navigation = useNavigation();
  const { userId, userInfo, refreshTokens } = useContext(AuthContext);

  const [quests, setQuests] = useState([]);
  const [badges, setBadges] = useState([]);
  const [friends, setFriends] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [comment, setComment] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [hasUnreadPowerUps, setHasUnreadPowerUps] = useState(false); // State to track unread power-ups
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserData = async () => {
    try {
      await refreshTokens();
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadTodayCheckIns = async () => {
    try {
      const todayCheckIns = await fetchUserCheckInsToday(userId);
      console.log(todayCheckIns);
      setCheckins(todayCheckIns);
    } catch (error) {
      console.error('Failed to load today\'s check-ins:', error);
    }
  };

  const loadUserQuests = async () => {
    try {
        const userQuests = await fetchUserQuests(userId);
        console.log('Fetched Quests:', userQuests);
        setQuests(userQuests);
    } catch (error) {
        console.error('Failed to load user quests:', error);
    }
  };

  const loadPowerUps = async () => {
    try {
      const data = await fetchPowerUps();
      console.log('Unread Power-Ups:', data);
      setPowerUps(data);
      setHasUnreadPowerUps(data.length > 0); // Update the state based on unread power-ups
    } catch (error) {
      console.error('Failed to fetch power-ups:', error);
    }
  };

  const loadData = async () => {
    try {
        // Set loading to true at the beginning
        setLoading(true);

        // Await all data-loading functions
        await Promise.all([
            loadUserData(),
            loadTodayCheckIns(),
            loadUserQuests(),
            loadPowerUps()
        ]);

    } catch (error) {
        console.error('Error loading data:', error);
        // Optionally handle the error or set loading to false
    } finally {
        // Set loading to false after all promises resolve or reject
        setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData(); // Load power-ups when the screen is focused
    }, [userId])
  );

  useEffect(() => {
    loadUserData();
  }, [userId]); // This will run every time userId changes

  useEffect(() => {
    loadUserQuests();
  }, [userId]); // This will run every time userId changes

  const getIconById = (iconId) => {
    return iconsData.icons[iconId];
  };

  const handleCheckInSubmit = async () => {
    if (selectedQuest && comment.trim()) {
      try {
        await createCheckIn(selectedQuest.quest_id, comment);
        Alert.alert('Success', 'Check-in submitted successfully.');
        setModalVisible(false);
        setComment(''); // Clear the comment field

        // Fetch the updated check-ins from the server
        await loadTodayCheckIns();
        // Refresh quests
        await loadUserQuests();
      } catch (error) {
        console.error('Failed to submit check-in:', error);
        Alert.alert('Error', 'Failed to submit check-in.');
      }
    } else {
      Alert.alert('Error', 'Please enter a comment.');
    }
  };

  const handleCheckmarkPress = (quest) => {
    setSelectedQuest(quest);
    setModalVisible(true);
  };

  const handleQuestPress = (quest) => {
    navigation.navigate('Quest', { questDetails: quest });
  };

  const handleAcceptInvite = async (quest_id) => {
    try {
        await acceptQuestInvite(quest_id);
        Alert.alert('Success', 'You have joined the quest.');
        loadUserQuests(); // Refresh the quests after declining

    } catch (error) {
        console.error('Failed to accept invite:', error);
        Alert.alert('Error', 'Failed to accept invite.');
    }
  };

  const handleDeclineInvite = async (quest_id) => {
    try {
        await declineQuestInvite(quest_id);
        Alert.alert('Success', 'You have declined the quest invite.');
        loadUserQuests();

    } catch (error) {
        console.error('Failed to decline invite:', error);
        Alert.alert('Error', 'Failed to decline invite.');
    }
  };

  const handleQuestCreation = async (questData) => {
    try {
        await createQuest(questData, loadUserQuests);  // Refresh quests list after creating a new quest
        Alert.alert('Success', 'Quest created.');
        loadUserQuests();
    } catch (error) {
        console.error('Error creating quest:', error);
    }
  };

  const handleStartQuestPress = () => {
      navigation.navigate('NewQuest', { onCreateQuest: handleQuestCreation });
  };

  const hasCheckedInToday = (questId) => {
    return checkins.some(checkin => checkin.quest_id === questId);
  };

  const activeQuests = quests.filter(quest => quest.user_status === 'active');
  const pendingQuests = quests.filter(quest => quest.user_status === 'pending');
  const invitedQuests = quests.filter(quest => quest.user_status === 'invited');

  console.log('Invited Quests:', invitedQuests);
  console.log('Active Quests:', activeQuests);
  console.log('Pending Quests:', pendingQuests);

  console.log('Checkins: ', checkins);

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
      <Header userInfo={userInfo} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>Your Quests</Text>
        {quests.length === 0 ? (
          <View style={styles.noQuestsContainer}>
            {userInfo && (
              <>
                <Text style={styles.noQuestsText}>Hello, {userInfo.fullname}!</Text>
              </>
            )}
            <Text style={styles.noQuestsText}>You have no quests.</Text>
            <Text style={styles.noQuestsText}>
              Start your first quest{' '}
              <Text style={styles.linkText} onPress={handleStartQuestPress}>here</Text>.
            </Text>
          </View>
        ) : (
          <>
            {invitedQuests.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>New Invitations:</Text>
                {invitedQuests.map((quest) => (
                  <TouchableOpacity key={quest.user_quest_id} style={styles.questContainer} onPress={() => handleQuestPress(quest)}>
                    <Text style={styles.questName}>{quest.quest_name}</Text>
                    <View style={styles.inviteActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptInvite(quest.quest_id)}
                      >
                        <MaterialCommunityIcons name="plus" size={20} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDeclineInvite(quest.quest_id)}
                      >
                        <MaterialCommunityIcons name="close" size={20} color="#000" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {activeQuests.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Your Quests:</Text>
                {activeQuests.map((quest) => {
                  const iconId = quest.icon_id;
                  const icon = getIconById(iconId);
                  const checkedIn = hasCheckedInToday(quest.quest_id);

                  return (
                    <TouchableOpacity
                      key={quest.user_quest_id}
                      style={[
                        styles.questContainer,
                        checkedIn && { backgroundColor: '#CCFFCC' }
                      ]}
                      onPress={() => handleQuestPress(quest)}
                    >
                      {icon ? (
                        icon.library === 'FontAwesome' ? (
                          <Icon name={icon.name} size={20} style={styles.questIcon} />
                        ) : (
                          <MaterialCommunityIcons name={icon.name} size={20} style={styles.questIcon} />
                        )
                      ) : (
                        <Icon name="star" size={20} style={styles.questIcon} /> // Fallback icon
                      )}
                      <Text style={styles.questName}>{quest.quest_name}</Text>
                      <TouchableOpacity
                        style={[
                          styles.checkmarkButton,
                          checkedIn && { backgroundColor: '#006600' }
                        ]}
                        onPress={() => !checkedIn && handleCheckmarkPress(quest)}
                        disabled={checkedIn}
                      >
                        <Icon name="check" size={30} style={styles.checkmarkIcon} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {pendingQuests.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Waiting Approval:</Text>
                {pendingQuests.map((quest) => (
                  <TouchableOpacity key={quest.user_quest_id} style={styles.questContainer} onPress={() => handleQuestPress(quest)}>
                    <Text style={styles.questName}>{quest.quest_name}</Text>
                    <Text style={styles.pendingText}>Request Pending</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
        </View>
      </ScrollView>
      <Footer hasUnreadPowerUps={hasUnreadPowerUps} powerUps={powerUps} />

      {selectedQuest && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>

              {/* Title */}
              <Text style={styles.modalTitle}>Checking-in</Text>

              <Text style={styles.modalDateTime}>{selectedQuest.quest_name}</Text>

              {/* Current Date and Time */}
              <Text style={styles.modalDateTime}>{new Date().toLocaleString()}</Text>

              {/* Text Field for Note or Comment */}
              <TextInput
                style={styles.textField}
                placeholder="Add a note or comment..."
                onChangeText={setComment}
                value={comment}
              />

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleCheckInSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>
      )}
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
    paddingTop: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  userInfoText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginVertical: 5,
  },
  noQuestsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noQuestsText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444444',
    marginVertical: 15,
    paddingHorizontal: 10,
    textAlign: 'left',
  },
  linkText: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  questContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  questName: {
    fontSize: 16,
    color: '#000',
    flex: 1,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 10,
  },
  questIcon: {
    fontSize: 20,
    width: 30,
    marginRight: 20,
  },
  checkmarkButton: {
    padding: 10,
    backgroundColor: '#AAAAAA',
    borderRadius: 5,
  },
  checkmarkIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalDateTime: {
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
  },
  submitButton: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#444444',
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  pendingText: {
    padding: 10,
    color: '#444',
    borderWidth: 1,
    borderRadius: 5,
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
  button: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
