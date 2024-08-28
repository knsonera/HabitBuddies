import React, { useState, useEffect, useContext, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
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
        const createWebSocket = () => {
            //const socket = new WebSocket(`wss://www.uzhvieva.com:443`, authToken);
            const socket = new WebSocket(`ws://localhost:3000`, authToken);

            socket.onopen = () => console.log('WebSocket connected');

            socket.onmessage = event => {
                console.log('Received WebSocket message:', event.data);

                // Check if the incoming data is a non-empty JSON string
                if (typeof event.data === 'string' && event.data.trim().startsWith('{')) {
                    let message;
                    try {
                        message = JSON.parse(event.data);
                        console.log('Parsed message:', message); // Log the parsed message to inspect the fields
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                        return;
                    }

                    // Process the message if it's related to the current quest
                    if (message.questId === questId) {
                        setMessages(prevMessages => {
                            const updatedMessages = [...prevMessages, message];
                            if (updatedMessages.length > 0) {
                                flatListRef.current.scrollToEnd({ animated: true });
                            }
                            return updatedMessages;
                        });
                    }
                } else if (Array.isArray(event.data) && event.data.length === 0) {
                    console.log('Received an empty message array');
                    // Handle empty array messages if necessary
                } else {
                    console.log('Non-JSON message received:', event.data);
                    // Handle non-JSON messages if necessary, otherwise ignore them
                }
            };

            socket.onerror = error => console.error('WebSocket error:', error);

            socket.onclose = () => {
                console.log('WebSocket closed, attempting to reconnect...');
                setTimeout(createWebSocket, 3000); // Retry connection after 3 seconds
            };

            setWs(socket);
        };

        createWebSocket();

        return () => {
            if (ws) ws.close();
        };
    }, [questId, authToken]);

    useFocusEffect(
        React.useCallback(() => {
            loadMessages();
            setTimeout(() => {
                if (messages.length > 0) {
                    flatListRef.current.scrollToEnd({ animated: false });
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
            if (ws && ws.readyState === WebSocket.OPEN) {
                // Send the message via WebSocket
                ws.send(JSON.stringify(message));
                // Optimistically update the UI
                setMessages(prevMessages => [...prevMessages, message]);
                setNewMessage('');

                // Scroll to the bottom
                setTimeout(() => {
                    if (flatListRef.current && messages.length > 0) {
                        flatListRef.current.scrollToEnd({ animated: true });
                    }
                }, 100);
            } else {
                // Fallback to API if WebSocket is not available
                await sendMessage(questId, message, authToken);
                setMessages(prevMessages => [...prevMessages, message]);
                setNewMessage('');

                // Scroll to the bottom
                setTimeout(() => {
                    if (flatListRef.current && messages.length > 0) {
                        flatListRef.current.scrollToEnd({ animated: true });
                    }
                }, 100);
            }
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
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
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
                    keyExtractor={(item, index) => item.message_id ? item.message_id.toString() : `key-${index}`}
                    contentContainerStyle={styles.scrollViewContent}
                    initialNumToRender={10}
                    onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: false })}
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
                        onSubmitEditing={handleEnterPress}
                        blurOnSubmit={false}
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoidingView: {
        flex: 1,
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
