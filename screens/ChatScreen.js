import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Keyboard, KeyboardAvoidingView, Platform, Animated, Alert } from 'react-native';
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
    const [showConnectionMessage, setShowConnectionMessage] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Fetching messages from the database
    const loadMessages = useCallback(async () => {
        try {
            const fetchedMessages = await fetchMessages(questId, authToken);
            setMessages(fetchedMessages);
        } catch (error) {
            Alert.alert('Error', 'Failed to load messages.');
        }
    }, [questId, authToken]);

    // Connection status pop-up message
    const showConnectionPopup = useCallback(() => {
        setShowConnectionMessage(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => setShowConnectionMessage(false));
            }, 2000);
        });
    }, [fadeAnim]);

    // Sending messages to the server
    const handleSend = useCallback(async () => {
        if (newMessage.trim() === '') return;

        // Prepare data
        const message = {
            questId,
            user_id: userId,
            message_text: newMessage,
            sent_at: new Date().toISOString(),
        };

        //
        try {
            // If websocket server is up and running
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
                setNewMessage('');
            // If websocket server is not available
            } else {
                await sendMessage(questId, message, authToken);
                setNewMessage('');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send message.');
        }
    }, [newMessage, ws, questId, userId, authToken]);

    useEffect(() => {
        if (ws) return;
        let reconnectAttempts = 0;

        const createWebSocket = () => {
            if (reconnectAttempts > 5) {
                Alert.alert("Connection Error", "Failed to connect to the server after 5 attempts.");
                return;
            }
            // Production
            const socket = new WebSocket(`wss://www.uzhvieva.com:443`, authToken);
            // Development
            //const socket = new WebSocket(`ws://localhost:3000`, authToken);

            socket.onopen = () => console.log('WebSocket connected');

            socket.onmessage = event => {
                // Check for connection message
                if (event.data === "You are connected.") {
                    showConnectionPopup();  // Show the connection message
                    return;
                }

                // Check if the incoming data is a non-empty JSON string
                if (typeof event.data === 'string' && event.data.trim().startsWith('{')) {
                    let message;
                    try {
                        message = JSON.parse(event.data);
                    } catch (error) {
                        return;
                    }

                    // Process the message if it's related to the current quest
                    if (message.questId === questId) {
                        setMessages(prevMessages => {
                            const messageExists = prevMessages.some(
                                msg => msg.sent_at === message.sent_at && msg.user_id === message.user_id
                            );
                            if (!messageExists) {
                                const updatedMessages = [...prevMessages, message];
                                if (updatedMessages.length > 0) {
                                  if (flatListRef.current) {
                                      flatListRef.current.scrollToEnd({ animated: true });
                                  }
                                }
                                return updatedMessages;
                            }
                            return prevMessages;
                        });
                    }
                } else if (Array.isArray(event.data) && event.data.length === 0) {
                    // TODO: empty array error handling
                } else {
                    // TODO: invalid data handling
                }
            };

            socket.onerror = error => Alert.alert('WebSocket error:', error);

            socket.onclose = () => {
                reconnectAttempts++;
                setTimeout(createWebSocket, reconnectAttempts * 3000);
            };

            setWs(socket);
        };

        createWebSocket();

        return () => {
            if (ws) ws.close();
        };
    }, [questId, authToken, ws]);


    // Show new messages
    useFocusEffect(
        React.useCallback(() => {
            loadMessages();
            setTimeout(() => {
                if (messages.length > 0) {
                    flatListRef.current.scrollToEnd({ animated: false });
                }
            }, 1000);
            // Timeout to ensure messages are loaded
        }, [userId, loadMessages])
    );

    // Hide keyboard after sending a message
    const handleEnterPress = () => {
        handleSend();
        Keyboard.dismiss();
    };

    // Render new message
    const renderItem = ({ item }) => {
        const isCurrentUser = item.user_id === userId;
        return (
            <View style={[styles.messageItem, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
                {!isCurrentUser && (
                    <Text style={styles.boldText}>{item.username || 'User'}:</Text>
                )}
                <Text style={styles.messageText}>{item.message_text}</Text>
                <Text style={styles.messageTime}>{new Date(item.sent_at).toLocaleTimeString()}</Text>
            </View>
        );
    };

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
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
                        placeholderTextColor="#444"
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

                {showConnectionMessage && (
                    <Animated.View style={[styles.connectionMessageContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.connectionMessageText}>You are connected.</Text>
                    </Animated.View>
                )}
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
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: 'bold',
    },
    messageItem: {
        padding: 10,
        maxWidth: '80%',
        borderRadius: 10,
        marginVertical: 5,
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#eee',
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#ccc'
    },
    messageText: {
        fontSize: 16,
        paddingHorizontal: 5,
    },
    boldText: {
        fontWeight: 'bold',
        paddingHorizontal: 5,
    },
    messageTime: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 5,
        paddingHorizontal: 5,

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
        backgroundColor: '#444',
        padding: 10,
        borderRadius: 4,
    },
    sendButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
    connectionMessageContainer: {
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
    },
    connectionMessageText: {
        color: '#FFF',
        fontSize: 14,
    },
});

export default ChatScreen;
