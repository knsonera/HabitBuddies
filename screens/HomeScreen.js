import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchUserQuests, fetchUserInfo } from '../services/apiService';
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

  const loadUserData = async () => {
    try {
      await refreshTokens(); // Ensure tokens are refreshed if necessary
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadUserQuests = async () => {
    try {
      const userQuests = await fetchUserQuests(); // Ensure tokens are refreshed if necessary
      setQuests(userQuests);
    } catch (error) {
      console.error('Failed to load user quests:', error);
    }
  };

  const getIconById = (iconId) => {
    console.log(iconId);
    return iconsData.icons[iconId];
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  useEffect(() => {
    loadUserQuests();
  }, []);

  const handleCheckmarkPress = (quest) => {
    setSelectedQuest(quest);
    setModalVisible(true);
  };

  const handleQuestPress = (quest) => {
    navigation.navigate('Quest', { questDetails: quest });
  };

  const handleStartQuestPress = () => {
    navigation.navigate('StartQuest');
  };

  const handleTimerCounter = () => {
    setModalVisible(false);
  };

  const handleMarkAsDone = () => {
    setModalVisible(false);
  };

  const handleOpenChat = () => {
    setModalVisible(false);
  };

  const handleVideoCall = () => {
    setModalVisible(false);
  };

  const activeQuests = quests.filter(quest => quest.status === 'active');

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
            activeQuests.map((quest) => {
              const iconId = quest.icon_id;
              console.log("mapping quests");
              console.log("icon id: " + quest.icon_id);
              console.log("icon id: " + iconId);
              const icon = getIconById(iconId);
              console.log(icon);
              return (
                <TouchableOpacity key={quest.user_quest_id} style={styles.questContainer} onPress={() => handleQuestPress(quest)}>
                  {icon ? (
                    icon.library === 'FontAwesome' ? (
                      <Icon name={icon.name} size={20} style={styles.questIcon} />
                    ) : (
                      <MaterialCommunityIcons name={icon.name} size={20} style={styles.questIcon} />
                    )
                  ) : (
                    <Icon name="question-circle" size={20} style={styles.questIcon} /> // Fallback icon
                  )}
                  <Text style={styles.questName}>{quest.quest_name}</Text>
                  <TouchableOpacity
                    style={styles.checkmarkButton}
                    onPress={() => handleCheckmarkPress(quest)}
                  >
                    <Icon name="check" size={30} style={styles.checkmarkIcon} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
      <Footer />

      {selectedQuest && (
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
              <TouchableOpacity style={styles.modalButton} onPress={handleTimerCounter}>
                <Text style={styles.modalButtonText}>Timer/Counter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleMarkAsDone}>
                <Text style={styles.modalButtonText}>Mark as Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleOpenChat}>
                <Text style={styles.modalButtonText}>Open Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleVideoCall}>
                <Text style={styles.modalButtonText}>Video Call</Text>
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
    fontSize: 24,
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
  linkText: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  questContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  questIcon: {
    fontSize: 20,
    width: 30,
    marginRight: 20,
  },
  questName: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 25,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalButton: {
    width: '100%',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#666666',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default HomeScreen;
