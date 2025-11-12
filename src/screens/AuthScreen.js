import React, { useState } from "react";
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
import axios from "axios";

// Sửa từ 'http://localhost:3000/api/auth' thành IP cố định của Host
const API_URL = 'http://10.0.2.2:3000/api/auth';

const AuthScreen = ({ onSignIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Biến trạng thái để chuyển đổi giữa Đăng nhập (false) và Đăng ký (true)
    const [isRegistering, setIsRegistering] = useState(false);

    // --- HÀM XỬ LÝ CHÍNH ---
    const handleAuth = async () => {
        // Kiểm tra các trường bắt buộc
        if (!email || !password || (isRegistering && !fullName)) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email, Mật khẩu và Tên.');
            return;
        }

        try {
            let token = null;

            if (isRegistering) {
                // 1. QUÁ TRÌNH ĐĂNG KÝ
                await axios.post(`${API_URL}/register`, {
                    email,
                    password,
                    fullName
                });

                // Hiển thị Alert 1: Đăng ký thành công
                Alert.alert('Thành công', 'Đăng ký thành công! Đang chuyển sang đăng nhập...');

                // DỪNG 1 GIÂY để người dùng đọc thông báo (Dùng Promise.all để tạm dừng async function)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            // LƯU Ý: Alert 1 sẽ tự biến mất khi Alert 2 được gọi ở dưới

            // --- 2. QUÁ TRÌNH ĐĂNG NHẬP (Thực hiện sau đăng ký hoặc đăng nhập trực tiếp) ---
            const loginResponse = await axios.post(`${API_URL}/login`, { email, password });
            token = loginResponse.data.token;

            if (token) {
                // Hiển thị Alert 2: Đăng nhập thành công
                Alert.alert('Thành công', 'Đăng nhập thành công! Token đã được lưu.',
                    [{ text: 'OK', onPress: () => onSignIn(token) }]
                );
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                Alert.alert('Lỗi', 'Lỗi không xác định: Không nhận được Token từ API Login.');
            }

        } catch (error) {
            // 4. Xử lý lỗi (Nếu đăng ký/đăng nhập thất bại)
            console.error('Lỗi API:', error.response?.data?.message || error.message);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi kết nối server.';

            Alert.alert(
                isRegistering ? 'Đăng ký thất bại' : 'Đăng nhập thất bại',
                errorMessage
            );
        }
    };

    const toggleMode = () => {
        setIsRegistering(prev => !prev);
        setEmail('');
        setPassword('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={styles.title}>
                {isRegistering ? 'ĐĂNG KÝ SHIPPER' : 'ĐĂNG NHẬP SHIPPER'}
            </Text>

            {/* Input Email */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            {/* Input Password */}
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            {isRegistering && (
                <TextInput
                    style={styles.input}
                    placeholder="Tên đầy đủ (Nguyễn Văn A)"
                    value={fullName}
                    onChangeText={setFullName}
                />
            )}

            {/* Nút Đăng ký/Đăng nhập */}
            <TouchableOpacity
                style={styles.button}
                onPress={handleAuth}
            >
                <Text style={styles.buttonText}>
                    {isRegistering ? 'ĐĂNG KÝ TÀI KHOẢN' : 'ĐĂNG NHẬP'}
                </Text>
            </TouchableOpacity>
            {/* Nút Chuyển đổi Mode */}
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
        backgroundColor: '#007AFF', // Màu xanh dương nổi bật
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

