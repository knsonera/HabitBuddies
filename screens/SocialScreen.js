import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, Modal, Alert } from 'react-native';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { fetchQuestsFeed, fetchCheckinsFeed, sendPowerUp } from '../services/apiService';

const SocialScreen = () => {
  const [questsFeed, setQuestsFeed] = useState([]);
  const [checkinsFeed, setCheckinsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' or 'checkins'
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Messages for power-ups
  const presetMessages = [
    "You can do it!",
    "You rock!",
    "Keep going!",
    "You're amazing!",
  ];

  // Icons for power-ups
  const iconOptions = [
    { name: 'thumbs-up', library: 'FontAwesome' },
    { name: 'star', library: 'FontAwesome' },
    { name: 'fire', library: 'MaterialCommunityIcons' },
    { name: 'rocket', library: 'MaterialCommunityIcons' }
  ];

  // Load data from server
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const questsData = await fetchQuestsFeed();
        const checkinsData = await fetchCheckinsFeed();
        setQuestsFeed(questsData);
        setCheckinsFeed(checkinsData);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch news feeds');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  // Send power-up
  const handleSendPowerUp = async (message) => {
    if (!selectedUpdate) return;
    const { user_id, quest_id, checkin_id } = selectedUpdate;
    const eventType = activeTab === 'quests' ? 'UserQuest' : 'CheckIn';
    const event_id = eventType === 'UserQuest' ? quest_id : checkin_id;

    try {
      await sendPowerUp(user_id, eventType, event_id, message);
      Alert.alert('Success', 'Power-Up sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send the Power-Up');
      console.error('Error sending Power-Up:', error);
    } finally {
      setShowModal(false);
      setSelectedUpdate(null);
    }
  };

  // Render quest news
  const renderQuests = () => (
    <FlatList
      data={questsFeed}
      keyExtractor={(item) => item.quest_id.toString()}
      renderItem={({ item }) => (
        <View style={styles.updateContainer}>
          <Text style={styles.newsText}>
            <Text style={styles.name}>{item.fullname}</Text>{' '}
            {item.role === 'owner' ? 'created a new quest:' : "joined a friend's quest:"}
          </Text>
          <Text style={styles.questName}>{item.quest_name}</Text>
          <Text style={styles.time}>{new Date(item.action_time).toLocaleString()}</Text>
          <TouchableOpacity
            style={styles.powerUpButton}
            onPress={() => {
              setSelectedUpdate(item);
              setShowModal(true);
            }}
          >
            <MaterialCommunityIcons name="heart" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<View style={styles.contentContainer}><Text style={styles.noUpdates}>No new friends' quests.</Text></View>}
    />
  );

  // Render checkin news
  const renderCheckins = () => (
    <FlatList
      data={checkinsFeed}
      keyExtractor={(item) => item.checkin_id.toString()}
      renderItem={({ item }) => (
        <View style={styles.updateContainer}>
          <Text style={styles.newsText}>
            <Text style={styles.name}>{item.fullname}</Text> checked in to:
          </Text>
          <Text style={styles.questName}>{item.quest_name}</Text>
          <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
          <TouchableOpacity
            style={styles.powerUpButton}
            onPress={() => {
              setSelectedUpdate(item);
              setShowModal(true);
            }}
          >
            <MaterialCommunityIcons name="heart" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<View style={styles.contentContainer}><Text style={styles.noUpdates}>No new friends' check-ins.</Text></View>}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <Text style={styles.screenTitle}>What's new?</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'quests' && styles.activeTabButton]}
          onPress={() => setActiveTab('quests')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'quests' && styles.activeTabButtonText]}>New Quests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'checkins' && styles.activeTabButton]}
          onPress={() => setActiveTab('checkins')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'checkins' && styles.activeTabButtonText]}>New Check-ins</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#444" />
          <Text>Loading updates...</Text>
        </View>
      ) : (
        <>
          {activeTab === 'quests' && renderQuests()}
          {activeTab === 'checkins' && renderCheckins()}
        </>
      )}
      <Footer />

      {/* Modal for sending power-ups */}
      {showModal && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Send a Power-Up</Text>
              {presetMessages.map((msg, index) => {
                const icon = iconOptions[index]; // Get the corresponding icon for each message
                const IconComponent = icon.library === 'FontAwesome' ? FontAwesome : MaterialCommunityIcons;

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalButton}
                    onPress={() => handleSendPowerUp(msg)}
                  >
                    <Text style={styles.modalButtonText}>
                      {msg} <IconComponent name={icon.name} size={16} color="#000" />
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#999' }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
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
    backgroundColor: '#fff',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    paddingTop: 10,
    marginBottom: 0,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  activeTabButton: {
    backgroundColor: '#ccc',
    marginBottom: 0,
  },
  tabButtonText: {
    fontSize: 16,
    color: '#333',
  },
  activeTabButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ccc',
    marginTop: 0,
  },
  updateContainer: {
    padding: 15,
    backgroundColor: '#ccc',
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
    paddingBottom: 35,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  newsText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5,
  },
  questName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'right',
  },
  time: {
    fontSize: 14,
    color: '#000',
    marginTop: 5,
  },
  noUpdates: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    margin: 20,
  },
  powerUpButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#aa0000',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SocialScreen;
