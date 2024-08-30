import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '../components/Header';
import Footer from '../components/Footer';

const StartQuestScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.halfContainer}
            onPress={() => navigation.navigate('QuestTemplates')}
          >
            <Text style={styles.halfText}>Choose Template</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.halfContainer}
            onPress={() => navigation.navigate('NewQuest')}
          >
            <Text style={styles.halfText}>Create Your Own</Text>
          </TouchableOpacity>
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
  screenTitle: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  halfContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#AAAAAA',
    borderWidth: 1,
    borderColor: '#fff'
  },
  halfText: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
  },
});

export default StartQuestScreen;
