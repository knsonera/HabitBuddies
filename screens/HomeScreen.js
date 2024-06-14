import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { fetchUserChallenges, fetchUserBadges, fetchUserFriends, fetchUserCheckins } from '../services/apiService';

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { currentUserProfile, friendsList } from '../assets/mockData';

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const navigation = useNavigation();

  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [friends, setFriends] = useState([]);
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userChallenges = await fetchUserChallenges(userId);
        const userBadges = await fetchUserBadges(userId);
        setChallenges(userChallenges);
        setBadges(userBadges);
        setFriends(userBadges);
        setCheckins(userBadges);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, [userId]);

  const handleCheckmarkPress = (challenge) => {
    setSelectedChallenge(challenge);
    setModalVisible(true);
  };

  const handleChallengePress = (challenge) => {
    navigation.navigate('Challenge', { challengeDetails: challenge });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.headerText}>Your Challenges</Text>
          {challenges.map((challenge) => (
            <TouchableOpacity key={challenge.id} style={styles.challengeContainer} onPress={() => handleChallengePress(challenge)}>
              {challenge.library === 'FontAwesome' ? (
                <Icon name={challenge.icon} size={30} style={styles.challengeIcon} />
              ) : (
                <MaterialCommunityIcons name={challenge.icon} size={30} style={styles.challengeIcon} />
              )}
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <TouchableOpacity
                style={styles.checkmarkButton}
                onPress={() => handleCheckmarkPress(challenge)}
              >
                <Icon name="check" size={30} style={styles.checkmarkIcon} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Footer />

      {selectedChallenge && (
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
              <TouchableOpacity style={styles.modalButton} onPress={() => {}}>
                <Text style={styles.modalButtonText}>Timer/Counter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => {}}>
                <Text style={styles.modalButtonText}>Mark as Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => {}}>
                <Text style={styles.modalButtonText}>Open Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => {}}>
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
    backgroundColor: '#FFFFFF', // White background
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
  challengeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  challengeIcon: {
    fontSize: 30,
    width: 30,
    marginRight: 20,
  },
  challengeName: {
    flex: 1,
    fontSize: 20,
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
