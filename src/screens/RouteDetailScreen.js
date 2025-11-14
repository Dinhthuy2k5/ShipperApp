// File: src/screens/RouteDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://10.0.2.2:3000/api/routes'; // Dùng IP cố định

const RouteDetailScreen = () => {
    const route = useRoute(); // Hook để lấy params
    const { routeId } = route.params; // Lấy routeId được truyền từ HomeScreen

    const [loading, setLoading] = useState(true);
    const [routeDetails, setRouteDetails] = useState(null);

    useEffect(() => {
        const fetchRouteDetails = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    throw new Error('Không tìm thấy token');
                }

                // Gọi API chi tiết (API chúng ta đã viết ở backend)
                const response = await axios.get(`${API_URL}/${routeId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setRouteDetails(response.data);
            } catch (error) {
                console.error('Lỗi khi tải chi tiết lộ trình:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRouteDetails();
    }, [routeId]);

    // Hàm render cho từng điểm dừng (stop)
    const renderStopItem = ({ item }) => (
        <View style={styles.stopItem}>
            <View style={styles.stopOrderContainer}>
                <Text style={styles.stopOrder}>{item.optimized_order}</Text>
            </View>
            <View style={styles.stopDetails}>
                <Text style={styles.stopAddress}>{item.address_text}</Text>
                <Text style={[
                    styles.stopStatus,
                    item.stop_status === 'delivered' ? styles.statusDelivered :
                        (item.stop_status === 'failed' ? styles.statusFailed : styles.statusPending)
                ]}>
                    Trạng thái: {item.stop_status}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (!routeDetails) {
        return <Text style={styles.errorText}>Không thể tải dữ liệu lộ trình.</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={routeDetails.stops} // Lấy mảng 'stops' từ API
                renderItem={renderStopItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>{routeDetails.route_name}</Text>
                        <Text style={styles.info}>
                            {(routeDetails.total_distance_meters / 1000).toFixed(1)} km -
                            Khoảng {Math.round(routeDetails.total_duration_seconds / 60)} phút
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { textAlign: 'center', marginTop: 20, color: 'red' },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    info: {
        fontSize: 16,
        color: 'gray',
        marginTop: 5,
    },
    stopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 8,
    },
    stopOrderContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stopOrder: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    stopDetails: {
        flex: 1,
    },
    stopAddress: {
        fontSize: 16,
        fontWeight: '500',
    },
    stopStatus: {
        fontSize: 14,
        marginTop: 4,
    },
    statusPending: { color: 'gray' },
    statusDelivered: { color: 'green' },
    statusFailed: { color: 'red' },
});

export default RouteDetailScreen;