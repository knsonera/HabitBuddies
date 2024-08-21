import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { fetchMessages, sendMessage } from '../services/apiService';
import Header from '../components/Header'; // Import Header component

const ChatScreen = ({ route }) => {
    const { questId } = route.params;
    const { authToken, userId } = useContext(AuthContext);
    const [messages, setMessages] = useState([{
        message_id: 0,
        username: 'System',
        message_text: 'Welcome to the chat! Feel free to share your thoughts and ideas here.',
        sent_at: new Date().toISOString(),
    }]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const fetchedMessages = await fetchMessages(questId, authToken);
                setMessages(prevMessages => [...prevMessages, ...fetchedMessages]);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };

        loadMessages();

        const socket = new WebSocket('ws://localhost:8080'); // Make sure this URL is correct
        socket.onopen = () => console.log('WebSocket connected');
        socket.onmessage = event => {
            console.log('Received WebSocket message:', event.data); // Log received messages
            const message = JSON.parse(event.data);
            if (message.questId === questId) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        };
        setWs(socket);

        return () => socket.close();
    }, [questId, authToken]);

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
        } catch (error) {
            console.error('Failed to send message:', error);
        }
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
            <Text style={styles.title}>Chat</Text>
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.message_id.toString()}
                contentContainerStyle={styles.scrollViewContent}
            />
            <View style={styles.newMessageContainer}>
                <TextInput
                    style={styles.newMessageInput}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type your message..."
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
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
        paddingTop: 10,
    },
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#FFF',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: 'bold',
    },
    messageItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        width: '100%',
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
