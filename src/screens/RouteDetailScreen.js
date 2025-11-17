// File: src/screens/RouteDetailScreen.js (Container)

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    StyleSheet,
    ActivityIndicator,
    Alert,
    View
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import 2 component con
import RouteDetailMap from '../components/RouteDetailMap';
import RouteDetailSheet from '../components/RouteDetailSheet';

const API_URL_BASE = 'http://10.0.2.2:3000/api/routes';

const RouteDetailScreen = () => {
    const route = useRoute();
    const { routeId } = route.params;

    // --- STATE (Giữ nguyên) ---
    const [loading, setLoading] = useState(true);
    const [routeDetails, setRouteDetails] = useState(null);
    const [newStopAddress, setNewStopAddress] = useState('');

    const isCompleted = routeDetails?.route_status === 'completed';
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

    // --- API LOGIC (Tất cả logic nằm ở đây) ---
    const fetchRouteDetails = useCallback(async () => {
        try {
            if (!loading) setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error('Không tìm thấy token');

            const response = await axios.get(`${API_URL_BASE}/${routeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRouteDetails(response.data);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết lộ trình:', error.response?.data || error.message);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu lộ trình.');
        } finally {
            setLoading(false);
        }
    }, [routeId, loading]);

    useEffect(() => {
        fetchRouteDetails();
    }, [fetchRouteDetails]);

    const handleAddStop = async () => {
        if (newStopAddress.trim() === '') {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ điểm dừng.');
            return;
        }
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.post(
                `${API_URL_BASE}/${routeId}/stops`,
                { addressText: newStopAddress },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewStopAddress('');
            fetchRouteDetails();
        } catch (error) {
            console.error('Lỗi khi thêm điểm dừng:', error.message);
            Alert.alert('Lỗi', 'Không thể thêm điểm dừng.');
        }
    };

    const handleDeleteStop = async (stopId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(
                `${API_URL_BASE}/${routeId}/stops/${stopId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert('Thành công', 'Đã xóa điểm dừng.');
            fetchRouteDetails();
        } catch (error) {
            console.error('Lỗi khi xóa điểm dừng:', error.message);
            Alert.alert('Lỗi', 'Không thể xóa điểm dừng.');
        }
    };

    const completeRoute = async () => {
        if (routeDetails?.route_status !== 'pending') return;
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.patch(
                `${API_URL_BASE}/${routeId}/status`,
                { status: 'completed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRouteDetails();
        } catch (error) {
            console.error('Lỗi khi hoàn thành lộ trình:', error.message);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
        }
    };

    const handleManualCompleteRoute = () => {
        Alert.alert(
            "Xác nhận Hoàn thành",
            "Bạn có chắc chắn muốn đánh dấu lộ trình này là đã hoàn thành? Bạn sẽ không thể chỉnh sửa sau đó.",
            [
                { text: "Hủy" },
                { text: "OK, Hoàn thành", onPress: completeRoute }
            ]
        );
    };

    const handleUpdateStopStatus = async (stopId, currentStatus) => {
        let newStatus = 'delivered';
        if (currentStatus === 'delivered') newStatus = 'failed';
        if (currentStatus === 'failed') newStatus = 'pending';

        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.patch(
                `${API_URL_BASE}/${routeId}/stops/${stopId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRouteDetails();
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái stop:', error.message);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
        }
    };

    useEffect(() => {
        if (routeDetails && routeDetails.route_status === 'pending' && routeDetails.stops.length > 0) {
            const allDelivered = routeDetails.stops.every(
                (stop) => stop.stop_status === 'delivered'
            );
            if (allDelivered) {
                Alert.alert("Tự động hoàn thành", "Tất cả các điểm dừng đã được giao. Lộ trình sẽ được đánh dấu là hoàn thành.");
                completeRoute();
            }
        }
    }, [routeDetails]);

    // --- RENDER (Gọn gàng) ---
    return (
        <GestureHandlerRootView style={styles.container}>
            {/* 1. Bản đồ ở nền */}
            <RouteDetailMap routeDetails={routeDetails} />

            {/* 2. Tấm trượt chứa nội dung */}
            {loading && !routeDetails ? (
                // Chỉ hiển thị loading lần đầu
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <RouteDetailSheet
                    bottomSheetRef={bottomSheetRef}
                    snapPoints={snapPoints}
                    routeDetails={routeDetails}
                    isCompleted={isCompleted}
                    newStopAddress={newStopAddress}
                    setNewStopAddress={setNewStopAddress}
                    handleAddStop={handleAddStop}
                    handleDeleteStop={handleDeleteStop}
                    handleUpdateStopStatus={handleUpdateStopStatus}
                    handleManualCompleteRoute={handleManualCompleteRoute}
                />
            )}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)' // Nền mờ
    }
});

export default RouteDetailScreen;