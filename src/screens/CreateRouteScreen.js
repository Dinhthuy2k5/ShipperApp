import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dùng IP cố định
const API_URL = 'http://10.0.2.2:3000/api/routes';

const CreateRouteScreen = () => {
    const [routeName, setRouteName] = useState('');
    const [startAddress, setStartAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const handleCreateRoute = async () => {
        if (!routeName || !startAddress) {
            Alert.alert('Lỗi', 'Vui lòng nhập cả Tên lộ trình và Điểm xuất phát.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            // === BƯỚC 1: GỌI API TẠO LỘ TRÌNH MỚI ===
            const createResponse = await axios.post(
                API_URL,
                { routeName: routeName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Lấy routeId từ kết quả
            const newRouteId = createResponse.data.routeId;

            // === BƯỚC 2: GỌI API CẬP NHẬT ĐIỂM XUẤT PHÁT ===
            await axios.put(
                `${API_URL}/${newRouteId}/start-point`,
                { addressText: startAddress },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setLoading(false);

            // === BƯỚC 3: CHUYỂN HƯỚNG SANG MÀN HÌNH CHI TIẾT ===
            // Chuyển sang RouteDetailScreen để người dùng có thể thêm Stops
            Alert.alert(
                'Thành công',
                'Đã tạo lộ trình mới. Bây giờ hãy thêm các điểm dừng.',
                [
                    {
                        text: 'OK',
                        // Chuyển hướng (replace) đến màn hình Chi tiết
                        onPress: () => navigation.replace('RouteDetail', { routeId: newRouteId })
                    }
                ]
            );

        } catch (error) {
            setLoading(false);
            console.error('Lỗi khi tạo lộ trình:', error.response?.data || error.message);
            Alert.alert('Lỗi', 'Không thể tạo lộ trình. Vui lòng thử lại.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.label}>Tên lộ trình:</Text>
            <TextInput
                style={styles.input}
                placeholder="VD: Đơn hàng sáng 12/11"
                value={routeName}
                onChangeText={setRouteName}
                // --- SỬA LỖI TIẾNG VIỆT ---
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                importantForAutofill="no"
            />

            <Text style={styles.label}>Điểm xuất phát:</Text>
            <TextInput
                style={styles.input}
                placeholder="VD: Bưu cục Cầu Giấy, Hà Nội"
                value={startAddress}
                onChangeText={setStartAddress}
                // --- SỬA LỖI TIẾNG VIỆT ---
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                importantForAutofill="no"
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleCreateRoute}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Tạo và Tiếp tục</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#f5f5f5',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreateRouteScreen;