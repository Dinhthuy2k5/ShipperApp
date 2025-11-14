// File: src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList, // Dùng để hiển thị danh sách
} from 'react-native';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import thư viện giải mã
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { SafeAreaView } from 'react-native-safe-area-context';

// API Lấy lịch sử lộ trình (Dùng IP cố định 10.0.2.2)
const API_URL = 'http://10.0.2.2:3000/api/routes';

// Hàm giải mã tên từ token
const getUsernameFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.user.fullName || 'Shipper';
    } catch (e) {
        console.log('Decoding token failed', e);
        return 'Shipper';
    }
};

const HomeScreen = ({ userToken, navigation }) => {
    const username = getUsernameFromToken(userToken);
    const [routes, setRoutes] = useState([]);

    // Hàm gọi API lấy lịch sử lộ trình
    const fetchRoutes = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${userToken}`, // Gắn token vào header
                },
            });
            setRoutes(response.data); // Lưu danh sách lộ trình
        } catch (error) {
            console.error('Lỗi khi tải lịch sử:', error.response?.data || error.message);
        }
    };

    // Sử dụng useFocusEffect để TẢI LẠI dữ liệu mỗi khi quay lại màn hình này
    useFocusEffect(
        React.useCallback(() => {
            fetchRoutes();
        }, [userToken]) // Thêm userToken vào dependency
    );

    // Hàm render mỗi item trong danh sách
    const renderRouteItem = ({ item }) => (
        <TouchableOpacity
            style={styles.routeItem}
            // Thêm sự kiện onPress:
            onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
        >
            <Text style={styles.routeName}>{item.route_name}</Text>
            <Text style={styles.routeDate}>
                Ngày tạo: {new Date(item.created_at).toLocaleDateString('vi-VN')}
            </Text>
            {item.total_distance_meters && (
                <Text style={styles.routeInfo}>
                    {(item.total_distance_meters / 1000).toFixed(1)} km -
                    Khoảng {Math.round(item.total_duration_seconds / 60)} phút
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Chào Username (Theo sketch) */}
            <Text style={styles.welcomeText}>Chào, {username}!</Text>

            {/* 2. Thanh Tạo lộ trình (Theo sketch) */}
            <TouchableOpacity style={styles.createButton}
                onPress={() => navigation.navigate('CreateRoute')}
            >
                <Icon name="search-outline" size={20} color="#555" />
                <Text style={styles.createButtonText}>Tìm kiếm hoặc Tạo lộ trình mới</Text>
                <Icon name="add" size={24} color="#007AFF" />
            </TouchableOpacity>

            {/* 3. Danh sách (Phần trống trong sketch) */}
            <FlatList
                data={routes}
                renderItem={renderRouteItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
                ListHeaderComponent={<Text style={styles.listHeader}>Lộ trình gần đây</Text>}
            />
        </SafeAreaView>
    );
};

// ... (Copy phần styles từ lần trước)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        elevation: 2, // Shadow cho Android
        shadowColor: '#000', // Shadow cho iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
    },
    createButtonText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
        color: '#555',
    },
    list: {
        marginTop: 20,
    },
    listHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    routeItem: {
        backgroundColor: 'white',
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    routeName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    routeDate: {
        fontSize: 12,
        color: 'gray',
        marginTop: 4,
    },
    routeInfo: {
        fontSize: 14,
        color: '#333',
        marginTop: 8,
        fontWeight: '500',
    },
});

export default HomeScreen;