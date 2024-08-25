import React, { useState, useEffect, useContext, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Keyboard } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { fetchMessages, sendMessage } from '../services/apiService';
import Header from '../components/Header'; 

const ChatScreen = ({ route }) => {
    const { questId, questName } = route.params;
    const { authToken, userId } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);
    const flatListRef = useRef(null);

    const loadMessages = async () => {
        try {
            const fetchedMessages = await fetchMessages(questId, authToken);
            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => console.log('WebSocket connected');
        socket.onmessage = event => {
            console.log('Received WebSocket message:', event.data); // Log received messages
            const message = JSON.parse(event.data);
            if (message.questId === questId) {
                setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages, message];
                    if (updatedMessages.length > 0) {
                        flatListRef.current.scrollToEnd({ animated: true }); // Scroll to the bottom when a new message is received
                    }
                    return updatedMessages;
                });
            }
        };
        socket.onerror = error => console.error('WebSocket error:', error);
        setWs(socket);

        return () => {
            socket.close();
        };
    }, [questId, authToken]);

    useFocusEffect(
      React.useCallback(() => {
        loadMessages();
        setTimeout(() => {
          if(messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: false }); // Scroll to the bottom after loading messages
          }
        }, 100); // Timeout to ensure messages are loaded
      }, [userId])
    );

    const handleSend = async () => {
        if (newMessage.trim() === '') return;

        const message = {
            questId,
            user_id: userId,
            message_text: newMessage,
            sent_at: new Date().toISOString(),
        };

        try {
            await sendMessage(questId, message, authToken);
            ws.send(JSON.stringify(message));
            setNewMessage('');

            loadMessages();
            setTimeout(() => {
              if(messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: true }); // Scroll to the bottom after loading messages
              }
            }, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleEnterPress = () => {
        handleSend();
        Keyboard.dismiss();
    };

    const renderItem = ({ item }) => (
        <View style={styles.messageItem}>
            <Text style={styles.boldText}>{item.username}:</Text>
            <Text style={styles.messageText}>{item.message_text}</Text>
            <Text style={styles.messageTime}>{new Date(item.sent_at).toLocaleTimeString()}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <Text style={styles.title}>{questName} Chat</Text>

            {messages.length === 0 ? (
                <View style={styles.noMessagesContainer}>
                    <Text style={styles.noMessagesText}>No messages yet</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.message_id.toString()}
                    contentContainerStyle={styles.scrollViewContent}
                    initialNumToRender={10} // Render only 10 items initially
                    onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: false })} // Scroll to the bottom on content change
                />
            )}

            <View style={styles.newMessageContainer}>
                <TextInput
                    style={styles.newMessageInput}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type your message..."
                    accessible={true}
                    accessibilityLabel="Message Input"
                    onSubmitEditing={handleEnterPress} // Handle Enter key press
                    blurOnSubmit={false} // Prevent TextInput from losing focus after pressing Enter
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSend}
                    accessible={true}
                    accessibilityLabel="Send Message Button"
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    scrollViewContent: {
        width: '100%',
        paddingTop: 10,
        marginLeft: 20,
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: 'bold',
    },
    messageItem: {
        width: '100%',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    messageText: {
        fontSize: 16,
    },
    boldText: {
        fontWeight: 'bold',
    },
    messageTime: {
        fontSize: 12,
        color: '#999',
    },
    noMessagesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noMessagesText: {
        fontSize: 18,
        color: '#888',
    },
    newMessageContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        alignItems: 'center',
    },
    newMessageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 4,
        padding: 10,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 4,
    },
    sendButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default ChatScreen;
