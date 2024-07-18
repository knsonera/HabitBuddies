import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';
import { fetchAllQuests } from '../services/apiService'; // Import the API service

const QuestTemplatesScreen = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const response = await fetchAllQuests();
        console.log('Fetched quests:', response); // Log the response data for debugging
        setQuests(Array.isArray(response) ? response : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quests:', error);
        setLoading(false);
      }
    };

    fetchQuests();
  }, []);

  const renderIcon = (icon) => {
    if (!icon) return <Icon name="question-circle" size={24} style={styles.questIcon} />;
    const { name, library } = icon;

    switch (library) {
      case 'FontAwesome':
        return <Icon name={name} size={24} style={styles.questIcon} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={name} size={24} style={styles.questIcon} />;
      default:
        return <Icon name="question-circle" size={24} style={styles.questIcon} />;
    }
  };

  const renderQuests = (quests) => {
    return quests.map((quest) => (
      <TouchableOpacity
        key={quest.quest_id}
        style={styles.questItem}
        onPress={() => navigation.navigate('NewQuest', { questDetails: quest })} // Navigate and pass data
      >
        {renderIcon(quest.icon)}
        <View style={styles.questDetails}>
          <Text style={styles.questName}>{quest.quest_name}</Text>
          <Text style={styles.questDescription}>{quest.description}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  if (quests.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.noDataContainer}>
          <Text>No quests available</Text>
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderQuests(quests)}
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
  questItem: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  questIcon: {
    marginRight: 15,
  },
  questDetails: {
    flex: 1,
  },
  questName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  questDescription: {
    fontSize: 14,
    color: '#555',
  },
  questParticipants: {
    fontSize: 12,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuestTemplatesScreen;
