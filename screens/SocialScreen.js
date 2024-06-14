import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

import Header from '../components/Header';
import Footer from '../components/Footer';

const updates = [
  { name: 'Alice', time: '2 hours ago', description: 'Started a new challenge: 30-day yoga mastery.' },
  { name: 'Bob', time: '5 hours ago', description: 'Completed a 7-day meditation challenge!' },
  { name: 'Charlie', time: '1 day ago', description: 'Achieved 10000 points milestone.' },
  { name: 'Daisy', time: '2 days ago', description: 'Finished the Reading Challenge: 3 books in a month.' },
  { name: 'Eve', time: '3 days ago', description: 'Started a new challenge: Daily Running.' },
];

const SocialScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Feed</Text>
          {updates.map((update, index) => (
            <View key={index} style={styles.updateContainer}>
              <Text style={styles.name}>{update.name}</Text>
              <Text style={styles.time}>{update.time}</Text>
              <Text style={styles.description}>{update.description}</Text>
            </View>
          ))}
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
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 20,
    color: '#000000',
  },
  updateContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  time: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#333333',
  },
});

export default SocialScreen;
