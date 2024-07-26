import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Modal } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { editQuest } from '../services/apiService'; // Import the necessary functions
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import iconsData from '../assets/icons.json'; // Import icons.json

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

const EditQuestScreen = ({ route }) => {
  const { questDetails } = route.params || {}; // Destructure the passed quest details
  const navigation = useNavigation();
  const { authToken, userId } = useContext(AuthContext); // Use AuthContext to get the authToken and userId
  const [name, setName] = useState(questDetails ? questDetails.quest_name : '');
  const [description, setDescription] = useState(questDetails ? questDetails.description : '');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('days');
  const [frequency, setFrequency] = useState(questDetails ? questDetails.checkin_frequency : 'daily');
  const [time, setTime] = useState(questDetails ? questDetails.time : 'evening');
  const [zoomLink, setZoomLink] = useState(questDetails ? questDetails.zoom_link : '');
  const [icon, setIcon] = useState(questDetails ? questDetails.icon : null);
  const [modalVisible, setModalVisible] = useState(false);
  const [icons, setIcons] = useState([]);

  const [openDurationUnit, setOpenDurationUnit] = useState(false);
  const [openFrequency, setOpenFrequency] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  useEffect(() => {
    setIcons(iconsData.icons);
  }, []);

  useEffect(() => {
    if (questDetails?.duration) {
      const [dur, unit] = questDetails.duration.split(' ');
      setDuration(dur);
      setDurationUnit(unit);
    }
  }, [questDetails]);

  const validateForm = () => {
    if (!name || !description || !duration || !zoomLink) {
      alert('Please fill all the fields.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const newQuestDetails = {
        quest_name: name !== questDetails.quest_name ? name : undefined,
        description: description !== questDetails.description ? description : undefined,
        duration: `${duration} ${durationUnit}` !== questDetails.duration ? `${duration} ${durationUnit}` : undefined,
        checkin_frequency: frequency !== questDetails.checkin_frequency ? frequency : undefined,
        time: time !== questDetails.time ? time : undefined,
        zoom_link: zoomLink !== questDetails.zoom_link ? zoomLink : undefined,
        icon_id: icon && icons.indexOf(icon) !== questDetails.icon_id ? icons.indexOf(icon) : undefined,
        start_date: new Date().toISOString(), // Use the current date for start_date
        end_date: new Date(new Date().getTime() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString(), // Calculate end date
        category_id: questDetails.category_id, // Use existing category_id
        status: questDetails.status, // Use existing status
        created_by: userId // Include userId as created_by
      };

      // Filter out undefined fields
      const filteredQuestDetails = Object.fromEntries(Object.entries(newQuestDetails).filter(([_, v]) => v !== undefined));

      try {
        await editQuest(filteredQuestDetails, authToken);
        alert('Quest updated successfully!');
        navigation.navigate('Home');
      } catch (error) {
        console.error('Failed to edit the quest:', error);
        alert('Failed to edit the quest.');
      }
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
      <Text style={styles.title}>Edit Quest</Text>
      <TextInput
        style={styles.input}
        placeholder="Quest Name"
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
        autoCapitalize="none"
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
        <Text style={styles.submitButtonText}>Save Changes</Text>
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
  closeButton: {
    marginTop: 20,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditQuestScreen;
