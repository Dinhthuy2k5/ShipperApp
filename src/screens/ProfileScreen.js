// File: src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const ProfileScreen = ({ onSignOut }) => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Hồ sơ</Text>
            <Text style={styles.message}>Quản lý tài khoản của bạn tại đây.</Text>

            <TouchableOpacity
                style={styles.signOutButton}
                onPress={onSignOut} // Gọi hàm signOut từ App.tsx
            >
                <Text style={styles.buttonText}>ĐĂNG XUẤT</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 50,
    },
    message: {
        fontSize: 16,
        color: 'gray',
        marginTop: 10,
        marginBottom: 50,
    },
    signOutButton: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;