import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Modal, Button } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';

const icons = [
  { name: 'heart', library: 'FontAwesome' },
  { name: 'trophy', library: 'FontAwesome' },
  { name: 'book', library: 'FontAwesome' },
  { name: 'meditation', library: 'MaterialCommunityIcons' },
  { name: 'yoga', library: 'MaterialCommunityIcons' },
  { name: 'apple', library: 'FontAwesome' },
  { name: 'ban', library: 'FontAwesome' },
  { name: 'tint', library: 'FontAwesome' },
  { name: 'pencil', library: 'FontAwesome' },
  { name: 'edit', library: 'FontAwesome' },
  { name: 'leaf', library: 'FontAwesome' },
  { name: 'coffee', library: 'FontAwesome' },
];

const durationUnits = [
  { label: 'Days', value: 'days' },
  { label: 'Weeks', value: 'weeks' },
  { label: 'Months', value: 'months' },
  { label: 'Years', value: 'years' },
];
const frequencies = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Custom', value: 'custom' },
];
const times = [
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
  { label: 'All Day', value: 'all_day' },
  { label: 'Custom', value: 'custom' },
];

const NewChallengeScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('days');
  const [frequency, setFrequency] = useState('daily');
  const [time, setTime] = useState('evening');
  const [zoomLink, setZoomLink] = useState('');
  const [icon, setIcon] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [openDurationUnit, setOpenDurationUnit] = useState(false);
  const [openFrequency, setOpenFrequency] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  const validateForm = () => {
    if (!name || !description || !duration || !zoomLink) {
      alert('Please fill all the fields.');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newChallenge = {
        id: Math.random().toString(),
        name,
        description,
        duration: `${duration} ${durationUnit}`,
        frequency,
        time,
        zoomLink,
        icon: icon.name,
        library: icon.library,
        participants: 0,
      };
      console.log(newChallenge);
      alert('Challenge created successfully!');
    }
  };

  const renderIcon = (icon) => {
    if (icon.library === 'FontAwesome') {
      return <FontAwesome name={icon.name} size={24} color="black" />;
    } else {
      return <MaterialCommunityIcons name={icon.name} size={24} color="black" />;
    }
  };

  const renderForm = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.title}>New Challenge</Text>
      <TextInput
        style={styles.input}
        placeholder="Challenge Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.durationContainer}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Duration"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />
        <DropDownPicker
          open={openDurationUnit}
          value={durationUnit}
          items={durationUnits}
          setOpen={setOpenDurationUnit}
          setValue={setDurationUnit}
          setItems={() => {}}
          containerStyle={{ flex: 1, marginTop: -15, marginLeft: 10, zIndex: 3000 }}
          style={styles.picker}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      </View>
      <DropDownPicker
        open={openFrequency}
        value={frequency}
        items={frequencies}
        setOpen={setOpenFrequency}
        setValue={setFrequency}
        setItems={() => {}}
        containerStyle={{ marginBottom: 15, zIndex: 2000 }}
        style={styles.picker}
        dropDownContainerStyle={styles.dropdownContainer}
      />
      <DropDownPicker
        open={openTime}
        value={time}
        items={times}
        setOpen={setOpenTime}
        setValue={setTime}
        setItems={() => {}}
        containerStyle={{ marginBottom: 15, zIndex: 1000 }}
        style={styles.picker}
        dropDownContainerStyle={styles.dropdownContainer}
      />
      <TextInput
        style={styles.input}
        placeholder="Zoom Link"
        value={zoomLink}
        onChangeText={setZoomLink}
      />
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setModalVisible(true)}
      >
        <Text>Select Icon</Text>
        {icon && renderIcon(icon)}
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Challenge</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <FlatList
        data={[{ key: 'form' }]}
        renderItem={renderForm}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.scrollViewContent}
      />
      <Footer />
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select an Icon</Text>
            <View style={styles.iconGrid}>
              {icons.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.iconOption}
                  onPress={() => {
                    setIcon(icon);
                    setModalVisible(false);
                  }}
                >
                  {renderIcon(icon)}
                  <Text>{icon.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
    paddingTop: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    height: 50,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    zIndex: 3000,
  },
  picker: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconOption: {
    alignItems: 'center',
    margin: 10,
  },
});

export default NewChallengeScreen;
