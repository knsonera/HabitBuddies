import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { mockChallenges } from '../assets/mockData';

const ChallengeListScreen = () => {
  const renderIcon = (icon, library) => {
    switch (library) {
      case 'FontAwesome':
        return <Icon name={icon} size={24} style={styles.challengeIcon} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={icon} size={24} style={styles.challengeIcon} />;
      default:
        return <FontAwesome name="question-circle" size={24} style={styles.challengeIcon} />;
    }
  };

  const renderChallenges = (challenges) => {
    return challenges.map((challenge) => (
      <TouchableOpacity key={challenge.id} style={styles.challengeItem}>
        {renderIcon(challenge.icon, challenge.library)}
        <View style={styles.challengeDetails}>
          <Text style={styles.challengeName}>{challenge.name}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          <Text style={styles.challengeParticipants}>Participants: {challenge.participants}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const renderCategory = (category) => {
    return (
      <View key={category} style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <View style={styles.challengesContainer}>
          {renderChallenges(mockChallenges[category])}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {Object.keys(mockChallenges).map((category) => renderCategory(category))}
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  challengesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  challengeItem: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  challengeIcon: {
    marginRight: 15,
  },
  challengeDetails: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#555',
  },
  challengeParticipants: {
    fontSize: 12,
    color: '#888',
  },
});

export default ChallengeListScreen;
