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
    backgroundColor: '#FFFFFF', // White background
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 60,
    paddingBottom: 60,
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
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 5,
  },
  halfText: {
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
  },
});

export default StartQuestScreen;
