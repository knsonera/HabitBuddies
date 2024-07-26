import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { endQuest, fetchQuestParticipants } from '../services/apiService';
import iconsData from '../assets/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';

const QuestScreen = ({ route }) => {
  const { questDetails } = route.params;
  const navigation = useNavigation();

  const [participants, setParticipants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

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
      setParticipants(questParticipants);
      setModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      Alert.alert('Error', 'Failed to fetch participants.');
    }
  };

  const handleEditPress = (quest) => {
    navigation.navigate('EditQuest', { questDetails: quest });
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
            <TouchableOpacity style={styles.button}>
              <MaterialCommunityIcons name="chat" size={30} color="#000" />
              <Text style={styles.buttonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleVideoPress(questDetails.zoom_link)}>
              <MaterialCommunityIcons name="video" size={30} color="#000" />
              <Text style={styles.buttonText}>Video Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>Description: {questDetails.description}</Text>
            <Text style={styles.detailsText}>Category: {questDetails.category_id}</Text>
            <Text style={styles.detailsText}>Duration: {questDetails.duration}</Text>
            <Text style={styles.detailsText}>Time: {questDetails.time}</Text>
          </View>

          <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleParticipantsPress(questDetails.quest_id)}>
              <MaterialCommunityIcons name="account-group" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Participants</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditPress(questDetails)}>
              <Icon name="edit" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Edit Quest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEndPress}>
              <Icon name="times-circle" size={20} color="#000" />
              <Text style={styles.actionButtonText}>End Quest</Text>
            </TouchableOpacity>
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
                <TouchableOpacity key={index} style={styles.participantItem}>
                  <Text style={styles.participantText}>{participant.fullname} ({participant.username})</Text>
                </TouchableOpacity>
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
  participants: {
    fontSize: 16,
    color: '#000000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
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
  actionButtonContainer: {
    width: '80%',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    justifyContent: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  participantsList: {
    width: '100%',
  },
  participantItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  participantText: {
    fontSize: 16,
    color: '#000000',
  },
});

export default QuestScreen;
