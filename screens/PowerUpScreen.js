import React from 'react';
import { useState, useEffect, useContext } from 'react';

import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { markAsReadPowerUp, fetchPowerUps } from '../services/apiService';

import { useRoute } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PowerUpScreen = () => {
  const route = useRoute();
  const [powerUps, setPowerUps] = useState(route.params?.powerUps || null);

  useEffect(() => {
    const loadPowerUps = async () => {
      if (!powerUps) {
        try {
          const fetchedPowerUps = await fetchPowerUps();
          setPowerUps(fetchedPowerUps);
        } catch (error) {
          console.error('Error fetching power-ups:', error);
          Alert.alert('Error', 'Failed to fetch power-ups');
        }
      }
    };

    loadPowerUps();
  }, [powerUps]);

  const handleMarkAsRead = async (powerUpId) => {
    try {
        await markAsReadPowerUp(powerUpId);

        // Remove the marked power-up from the state
        setPowerUps((prevPowerUps) => prevPowerUps.filter((powerUp) => powerUp.power_up_id !== powerUpId));
    } catch (error) {
        console.error('Error marking power-up as read:', error);
        Alert.alert('Error', 'Failed to mark the power-up as read');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Your Power-Ups</Text>
          {!powerUps || powerUps.length === 0 ? (
            <Text style={styles.noPowerUps}>No power-ups available.</Text>
          ) : (
            powerUps.map((powerUp) => (
              <View key={powerUp.power_up_id} style={styles.updateContainer}>
                <Text style={styles.questName}>
                  {powerUp.sender_fullname} reacted to
                  {powerUp.event_type === 'CheckIn' ? ' your latest ' : ' adding '}
                  "{powerUp.quest_name}" {powerUp.event_type === 'CheckIn' ? ' check-in:' : ':'}
                </Text>
                <Text style={styles.description}>{powerUp.message}</Text>
                <Text style={styles.time}>
                  {new Date(powerUp.created_at).toLocaleString()}
                </Text>

                <TouchableOpacity
                  style={styles.markAsReadButton}
                  onPress={() => handleMarkAsRead(powerUp.power_up_id)}
                >
                  <Text style={styles.markAsReadButtonText}>Mark as Read</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
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
    flexGrow: 1,
    paddingTop: 20,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
    fontSize: 16,
    color: '#000000',
  },
  time: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  description: {
    fontSize: 18,
    color: '#333333',
    marginVertical: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questName: {
    fontSize: 16,
    color: '#000',
    marginTop: 5,
  },
  markAsReadButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
  markAsReadButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  noPowerUps: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PowerUpScreen;
