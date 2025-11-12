import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DashboardScreen = ({ userToken, onSignOut }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>CHÀO MỪNG SHIPPER!</Text>
            <Text style={styles.message}>Bạn đã đăng nhập thành công.</Text>
            <Text style={styles.tokenLabel}>Token của bạn (đã được lưu):</Text>
            {/* Chỉ hiển thị một phần của token để bảo mật */}
            <Text style={styles.tokenText}>{userToken.substring(0, 30)}...</Text>

            <TouchableOpacity
                style={styles.signOutButton}
                onPress={onSignOut}
            >
                <Text style={styles.buttonText}>ĐĂNG XUẤT</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 10,
    },
    message: {
        fontSize: 18,
        marginBottom: 40,
        color: '#333',
    },
    tokenLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 20,
    },
    tokenText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 50,
        paddingHorizontal: 10,
    },
    signOutButton: {
        backgroundColor: '#FF3B30', // Màu đỏ cho nút đăng xuất
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '80%',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default DashboardScreen;
