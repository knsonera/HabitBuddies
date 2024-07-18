import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../components/Header';
import Footer from '../components/Footer';

const QuestScreen = ({ route }) => {
  const { questDetails } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>

          <View style={styles.headerContainer}>
            {questDetails.library === 'FontAwesome' ? (
              <Icon name={questDetails.icon} size={50} color="#000" />
            ) : (
              <MaterialCommunityIcons name={questDetails.icon} size={50} color="#000" />
            )}
            <Text style={styles.challengeName}>{questDetails.name}</Text>
            <Text style={styles.participants}>Participants: {questDetails.participants}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <MaterialCommunityIcons name="chat" size={30} color="#000" />
              <Text style={styles.buttonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <MaterialCommunityIcons name="video" size={30} color="#000" />
              <Text style={styles.buttonText}>Video Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>Description: {questDetails.description}</Text>
            <Text style={styles.detailsText}>Duration: {questDetails.duration}</Text>
            <Text style={styles.detailsText}>Frequency: {questDetails.frequency}</Text>
            <Text style={styles.detailsText}>Time: {questDetails.time}</Text>
          </View>

          <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="user-plus" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Invite Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="edit" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Edit Quest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="times-circle" size={20} color="#000" />
              <Text style={styles.actionButtonText}>End Quest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Footer />
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
});

export default QuestScreen;
