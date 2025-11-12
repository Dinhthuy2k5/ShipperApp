// File: src/screens/AuthScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:3000/api/auth';

// SỬA: Nhận { route } từ props (do AuthStack truyền vào)
const AuthScreen = ({ route }) => {
    // Lấy hàm onSignIn từ params
    const { onSignIn } = route.params;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // Thêm fullName
    const [isRegistering, setIsRegistering] = useState(false);

    const handleAuth = async () => {
        // SỬA: Thêm validation cho fullName
        if (!email || !password || (isRegistering && !fullName)) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email, Mật khẩu và Tên.');
            return;
        }

        try {
            let token = null;

            if (isRegistering) {
                // --- 1. QUÁ TRÌNH ĐĂNG KÝ ---
                await axios.post(`${API_URL}/register`, { email, password, fullName });
                Alert.alert('Thành công', 'Đăng ký thành công! Đang chuyển sang đăng nhập...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // --- 2. QUÁ TRÌNH ĐĂNG NHẬP ---
            const loginResponse = await axios.post(`${API_URL}/login`, { email, password });
            token = loginResponse.data.token;

            if (token) {
                Alert.alert('Thành công', 'Đăng nhập thành công!',
                    [{ text: 'OK', onPress: () => onSignIn(token) }] // SỬA: Dùng onSignIn từ route.params
                );
            } else {
                Alert.alert('Lỗi', 'Lỗi không xác định: Không nhận được Token.');
            }

        } catch (error) {
            console.log(error.response?.data);
            const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra khi kết nối server.';
            Alert.alert(isRegistering ? 'Đăng ký thất bại' : 'Đăng nhập thất bại', errorMessage);
        }
    };

    const toggleMode = () => {
        setIsRegistering(prev => !prev);
        setEmail('');
        setPassword('');
        setFullName(''); // Reset
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={styles.title}>
                {isRegistering ? 'ĐĂNG KÝ SHIPPER' : 'ĐĂNG NHẬP SHIPPER'}
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            {/* SỬA: Thêm ô fullName */}
            {isRegistering && (
                <TextInput
                    style={styles.input}
                    placeholder="Tên đầy đủ (Nguyễn Văn A)"
                    value={fullName}
                    onChangeText={setFullName}
                />
            )}

            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleAuth}
            >
                <Text style={styles.buttonText}>
                    {isRegistering ? 'ĐĂNG KÝ TÀI KHOẢN' : 'ĐĂNG NHẬP'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.toggleButton}
                onPress={toggleMode}
            >
                <Text style={styles.toggleText}>
                    {isRegistering
                        ? 'Đã có tài khoản? Quay lại ĐĂNG NHẬP.'
                        : 'Chưa có tài khoản? Đăng ký NGAY.'
                    }
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

// ... (Copy styles từ AuthScreen cũ của bạn)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: 'white',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    toggleButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        color: '#007AFF',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default AuthScreen;