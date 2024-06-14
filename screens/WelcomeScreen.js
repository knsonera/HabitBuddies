import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AuthContext } from '../context/AuthContext';

const WelcomeScreen = () => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [signUpModalVisible, setSignUpModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { logIn, userId } = useContext(AuthContext);  // Use logIn and userId from AuthContext
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await logIn(email, password);
      navigation.navigate('Home', { userId });  // Navigate to Home with userId as a parameter
      setLoginModalVisible(false);  // Close the modal on success
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.appName}>Habit Buddies</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setLoginModalVisible(true)}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setSignUpModalVisible(true)}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={loginModalVisible}
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setLoginModalVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Welcome Back</Text>
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry={true}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
              <Text style={styles.submitButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={signUpModalVisible}
        onRequestClose={() => setSignUpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSignUpModalVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create an account</Text>
            <TextInput placeholder="Email" style={styles.input} />
            <TextInput placeholder="Password" secureTextEntry={true} style={styles.input} />
            <TextInput placeholder="Confirm Password" secureTextEntry={true} style={styles.input} />
            <TouchableOpacity style={styles.submitButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.submitButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
  },
});

export default WelcomeScreen;
