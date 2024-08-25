import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { searchUsers } from '../services/apiService';
import avatarsData from '../assets/avatars.json'; // Import the avatars data

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await searchUsers(searchQuery);
            setSearchResults(results);
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = (avatarId) => {
        const avatar = avatarsData.avatars.find((a) => a.id === avatarId);
        return avatar ? avatar.url : null;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.userItem} onPress={() => navigation.navigate('Profile', { userId: item.user_id })}>
            <Image source={{ uri: getAvatarUrl(item.avatar_id) }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <Text style={styles.userFullName}>{item.fullname}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userUsername}>{item.username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <View style={styles.container}>
                <Text style={styles.headerText}>Find Friends</Text>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search by full name, email or username"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : searchResults.length === 0 && searchQuery !== '' ? (
                    <Text style={styles.notFoundText}>Not users found, try again</Text>
                ) : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.user_id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.searchResultsContainer}
                    />
                )}
            </View>
            <Footer />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerText: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
        color: '#000000',
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        height: 40,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    searchButton: {
        marginLeft: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#333',
        borderRadius: 5,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    searchResultsContainer: {
        paddingVertical: 10,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userFullName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
        color: '#666666',
    },
    userUsername: {
        fontSize: 14,
        color: '#666666',
    },
    notFoundText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#000000',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#000000',
    },
});

export default SearchScreen;
