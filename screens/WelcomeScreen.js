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
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const isValidName = (name) => {
    return name.length > 4;
  };

  const resetLoginForm = () => {
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setEmailError('');
    setPasswordError('');
  };

  const resetSignUpForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setFullname('');
    setErrorMessage('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setUsernameError('');
    setFullnameError('');
  };

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [fullnameError, setFullnameError] = useState('');

  const handleLogin = async () => {
      setIsLoading(true);
      setEmailError('');
      setPasswordError('');

      if (!isValidEmail(email)) {
          setEmailError('Please enter a valid email address.');
          setIsLoading(false);
          return;
      }

      if (!isValidPassword(password)) {
          setPasswordError('Password must be at least 8 characters long and contain letters, numbers, and special characters.');
          setIsLoading(false);
          return;
      }

      try {
          await logInUser(email, password);
          navigation.navigate('Home');
          setLoginModalVisible(false);
      } catch (error) {
          if (error.response && error.response.status === 401) {
              // If it's a 401 Unauthorized error, show friendly invalid login message
              setErrorMessage('Invalid email or password. Please check your credentials and try again.');
          } else {
              // Any other error (e.g., 500 Internal Server Error)
              setErrorMessage('Something went wrong. Please try again later.');
          }
      } finally {
        setIsLoading(false);
      }
  };

  const handleSignUp = async () => {
      setIsLoading(true);
      setEmailError('');
      setPasswordError('');
      setConfirmPasswordError('');
      setUsernameError('');
      setFullnameError('');

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const trimmedUsername = username.trim();
      const trimmedFullname = fullname.trim();

      if (!isValidEmail(trimmedEmail)) {
          setEmailError('Please enter a valid email address.');
          setIsLoading(false);
          return;
      }

      if (!isValidPassword(trimmedPassword)) {
          setPasswordError('Password must be at least 8 characters long and contain letters, numbers, and special characters.');
          setIsLoading(false);
          return;
      }

      if (!isValidName(trimmedUsername)) {
          setUsernameError('Username must be longer than 4 characters.');
          setIsLoading(false);
          return;
      }

      if (!isValidName(trimmedFullname)) {
          setFullnameError('Full name must be longer than 4 characters.');
          setIsLoading(false);
          return;
      }

      if (password !== confirmPassword) {
          setConfirmPasswordError('Passwords do not match.');
          setIsLoading(false);
          return;
      }

      try {
          await signUpUser(email, password, username, fullname);
          navigation.navigate('Home');
          setSignUpModalVisible(false);
          resetSignUpForm();
      } catch (error) {
        if (error.response && error.response.status === 400) {
            // 400 Unauthorized error
            setErrorMessage('User with this email or username already exists.');
        } else {
            // Any other error
            setErrorMessage(error.message);
        }
      } finally {
        setIsLoading(false);
      }
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

  const renderInputField = (placeholder, value, onChangeText, secureTextEntry = false, error = '') => (
    <>
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
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </>
  );

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
        onRequestClose={() => handleModalClose('login')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => handleModalClose('login')}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Welcome Back</Text>
            {renderInputField('Email', email, setEmail, false, emailError)}
            {renderInputField('Password', password, setPassword, true, passwordError)}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && { backgroundColor: '#ccc' }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
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
            {renderInputField('Full Name', fullname, setFullname, false, fullnameError)}
            {renderInputField('Username', username, setUsername, false, usernameError)}
            {renderInputField('Email', email, setEmail, false, emailError)}
            {renderInputField('Password', password, setPassword, true, passwordError)}
            {renderInputField('Confirm Password', confirmPassword, setConfirmPassword, true, confirmPasswordError)}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && { backgroundColor: '#ccc' }]}
              onPress={handleSignUp}
              disabled={isLoading}  // Use a state to track form submission
            >
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
  inputError: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,  // Adjust the margin if needed to avoid spacing issues
    marginBottom: 10,
  }
});

export default WelcomeScreen;
