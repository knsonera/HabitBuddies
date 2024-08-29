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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { logInUser, signUpUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    console.log('handling login on welcome screen');
    try {
      await logInUser(email, password);
      console.log('Login successful, navigating to Home');
      navigation.navigate('Home');
      setLoginModalVisible(false);
    } catch (error) {
      console.error('Login error:', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleSignUp = async () => {
    console.log('handling sign up on welcome screen');
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      await signUpUser(email, password, username, fullname);
      console.log('Sign-up successful, navigating to Home');
      navigation.navigate('Home');
      setSignUpModalVisible(false);
    } catch (error) {
      console.error('Sign-up error:', error.message);
      setErrorMessage(error.message);
    }
  };

  const resetLoginForm = () => {
    setEmail('');
    setPassword('');
    setErrorMessage('');
  };

  const resetSignUpForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setFullname('');
    setErrorMessage('');
  };

  const handleModalClose = (type) => {
    if (type === 'login') {
      setLoginModalVisible(false);
      resetLoginForm();
    } else {
      setSignUpModalVisible(false);
      resetSignUpForm();
    }
  };

  const renderInputField = (placeholder, value, onChangeText, secureTextEntry = false) => (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#444"
      style={styles.input}
      value={value}
      autoCapitalize="none"
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      accessibilityLabel={placeholder}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.appName}>Habit Buddies</Text>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

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
        onRequestClose={() => handleModalClose('login')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => handleModalClose('login')}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Welcome Back</Text>
            {renderInputField('Email', email, setEmail)}
            {renderInputField('Password', password, setPassword, true)}
            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
              <Text style={styles.submitButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={signUpModalVisible}
        onRequestClose={() => handleModalClose('signUp')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => handleModalClose('signUp')}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create an account</Text>
            {renderInputField('Full Name', fullname, setFullname)}
            {renderInputField('Username', username, setUsername)}
            {renderInputField('Email', email, setEmail)}
            {renderInputField('Password', password, setPassword, true)}
            {renderInputField('Confirm Password', confirmPassword, setConfirmPassword, true)}
            <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
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
  errorText: {
    color: 'red',
    fontSize: 16,
    marginVertical: 10,
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
