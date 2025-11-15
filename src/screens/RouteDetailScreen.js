// File: src/screens/RouteDetailScreen.js (Bản nâng cấp)

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL_BASE = 'http://10.0.2.2:3000/api/routes';

const RouteDetailScreen = () => {
    const route = useRoute();
    const { routeId } = route.params;

    const [loading, setLoading] = useState(true);
    const [routeDetails, setRouteDetails] = useState(null);
    const [newStopAddress, setNewStopAddress] = useState('');

    // Biến kiểm tra trạng thái "Đã hoàn thành"
    const isCompleted = routeDetails?.route_status === 'completed';

    // Hàm tải chi tiết 1 lộ trình
    const fetchRouteDetails = useCallback(async () => {
        try {
            setLoading(true);
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
    }, [routeId]);

    useEffect(() => {
        fetchRouteDetails();
    }, [fetchRouteDetails]);

    // HÀM THÊM ĐIỂM DỪNG 
    const handleAddStop = async () => {
        if (newStopAddress.trim() === '') {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ điểm dừng.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            // 1. Gọi API POST
            await axios.post(
                `${API_URL_BASE}/${routeId}/stops`,
                { addressText: newStopAddress },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Xóa ô nhập liệu và tải lại danh sách
            setNewStopAddress('');
            fetchRouteDetails();
        } catch (error) {
            console.error('Lỗi khi thêm điểm dừng:', error.message);
            Alert.alert('Lỗi', 'Không thể thêm điểm dừng.');
        }
    };

    // HÀM XÓA ĐIỂM DỪNG 
    const handleDeleteStop = async (stopId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            // 1. Gọi API DELETE
            await axios.delete(
                `${API_URL_BASE}/${routeId}/stops/${stopId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Tải lại danh sách
            Alert.alert('Thành công', 'Đã xóa điểm dừng.');
            fetchRouteDetails();
        } catch (error) {
            console.error('Lỗi khi xóa điểm dừng:', error.message);
            Alert.alert('Lỗi', 'Không thể xóa điểm dừng.');
        }
    };

    // HÀM MỚI: HOÀN THÀNH LỘ TRÌNH (Tự động & Thủ công) 
    // (Hàm này sẽ được gọi tự động, hoặc bằng nút)
    const completeRoute = async () => {
        // Chỉ chạy nếu lộ trình đang 'pending'
        if (routeDetails?.route_status !== 'pending') return;

        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.patch(
                `${API_URL_BASE}/${routeId}/status`,
                { status: 'completed' }, // Gửi trạng thái mới
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRouteDetails(); // Tải lại dữ liệu để "khóa" màn hình
        } catch (error) {
            console.error('Lỗi khi hoàn thành lộ trình:', error.message);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
        }
    };

    // Hàm này dùng cho nút bấm (có xác nhận)
    const handleManualCompleteRoute = () => {
        Alert.alert(
            "Xác nhận Hoàn thành",
            "Bạn có chắc chắn muốn đánh dấu lộ trình này là đã hoàn thành? Bạn sẽ không thể chỉnh sửa sau đó.",
            [
                { text: "Hủy" },
                { text: "OK, Hoàn thành", onPress: completeRoute } // Gọi hàm 'completeRoute'
            ]
        );
    };


    // HÀM : CẬP NHẬT TRẠNG THÁI ĐIỂM DỪNG
    const handleUpdateStopStatus = async (stopId, currentStatus) => {
        // Logic xoay vòng: pending -> delivered -> failed -> pending
        let newStatus = 'delivered';
        if (currentStatus === 'delivered') newStatus = 'failed';
        if (currentStatus === 'failed') newStatus = 'pending';

        try {
            const token = await AsyncStorage.getItem('userToken');
            // 1. Gọi API PATCH của Stop
            await axios.patch(
                `${API_URL_BASE}/${routeId}/stops/${stopId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Tải lại dữ liệu (việc này sẽ kích hoạt useEffect bên dưới)
            fetchRouteDetails();
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái stop:', error.message);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
        }
    };


    // EFFECT MỚI: TỰ ĐỘNG HOÀN THÀNH LỘ TRÌNH
    useEffect(() => {
        // Kiểm tra sau mỗi lần routeDetails thay đổi
        if (routeDetails && routeDetails.route_status === 'pending' && routeDetails.stops.length > 0) {
            // Kiểm tra xem TẤT CẢ các điểm dừng có 'delivered' không
            const allDelivered = routeDetails.stops.every(
                (stop) => stop.stop_status === 'delivered'
            );

            if (allDelivered) {
                Alert.alert("Tự động hoàn thành", "Tất cả các điểm dừng đã được giao. Lộ trình sẽ được đánh dấu là hoàn thành.");
                completeRoute(); // Tự động gọi hàm hoàn thành
            }
        }
    }, [routeDetails]); // Chạy mỗi khi routeDetails thay đổi

    // Hàm render cho từng điểm dừng (stop)
    const renderStopItem = ({ item }) => (
        <View style={styles.stopItem}>
            <View style={[
                styles.stopOrderContainer,
                // Đổi màu nếu đã tối ưu
                item.optimized_order && { backgroundColor: '#007AFF' }
            ]}>
                <Text style={styles.stopOrder}>
                    {item.optimized_order || '-'}
                </Text>
            </View>

            {/* Bọc 'stopDetails' bằng TouchableOpacity */}
            <TouchableOpacity
                style={styles.stopDetails}
                // Chỉ cho phép nhấn khi lộ trình CHƯA HOÀN THÀNH
                disabled={isCompleted}
                onPress={() => handleUpdateStopStatus(item.id, item.stop_status)}
            >
                <Text style={styles.stopAddress}>{item.address_text}</Text>

                {/* Badge trạng thái mới */}
                <View style={[
                    styles.statusBadgeSmall,
                    item.stop_status === 'delivered' ? styles.statusDelivered :
                        (item.stop_status === 'failed' ? styles.statusFailed : styles.statusPending)
                ]}>
                    <Text style={styles.statusBadgeSmallText}>
                        {item.stop_status === 'delivered' ? 'Đã giao' : (item.stop_status === 'failed' ? 'Thất bại' : 'Đang chờ')}
                    </Text>
                </View>

            </TouchableOpacity>

            {/* CHỈ HIỂN THỊ NÚT XÓA KHI CHƯA HOÀN THÀNH */}
            {!isCompleted && (
                <TouchableOpacity onPress={() => handleDeleteStop(item.id)} style={styles.deleteButton}>
                    <Icon name="trash-bin-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading && !routeDetails) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (!routeDetails) {
        return <Text style={styles.errorText}>Không thể tải dữ liệu lộ trình.</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={routeDetails.stops}
                renderItem={renderStopItem}
                keyExtractor={(item) => item.id.toString()}

                ListHeaderComponent={
                    <>
                        <View style={styles.header}>
                            <Text style={styles.title}>{routeDetails.route_name}</Text>
                            {routeDetails.total_distance_meters && (
                                <Text style={styles.info}>
                                    {(routeDetails.total_distance_meters / 1000).toFixed(1)} km -
                                    Khoảng {Math.round(routeDetails.total_duration_seconds / 60)} phút
                                </Text>
                            )}

                            {/* Badge trạng thái lộ trình */}
                            <View style={[
                                styles.statusBadgeLarge,
                                isCompleted ? styles.statusBadgeCompleted : styles.statusBadgePending
                            ]}>
                                <Icon name={isCompleted ? "checkmark-circle" : "hourglass-outline"} size={16} color="#fff" />
                                <Text style={styles.statusBadgeText}>
                                    {isCompleted ? 'ĐÃ HOÀN THÀNH' : 'ĐANG CHỜ (PENDING)'}
                                </Text>
                            </View>
                        </View>


                        {/* CHỈ HIỂN THỊ KHỐI "THÊM" KHI CHƯA HOÀN THÀNH */}
                        {!isCompleted && (
                            <>
                                <View style={styles.addStopContainer}>
                                    <Text style={styles.addStopLabel}>Thêm điểm dừng mới:</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập địa chỉ điểm dừng"
                                        value={newStopAddress}
                                        onChangeText={setNewStopAddress}
                                        autoCorrect={false}
                                        spellCheck={false}
                                        autoComplete="off"
                                        importantForAutofill="no"
                                    />
                                    <TouchableOpacity style={styles.addButton} onPress={handleAddStop}>
                                        <Text style={styles.addButtonText}>Thêm</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        <Text style={styles.listLabel}>Danh sách điểm dừng:</Text>
                    </>
                }

                // FOOTER : NÚT HOÀN THÀNH LỘ TRÌNH 
                ListFooterComponent={
                    <>
                        {/* CHỈ HIỂN THỊ NÚT "HOÀN THÀNH" KHI CHƯA HOÀN THÀNH */}
                        {!isCompleted && routeDetails.stops.length > 0 && (
                            <TouchableOpacity style={styles.completeRouteButton} onPress={handleManualCompleteRoute}>
                                <Icon name="checkmark-done-circle-outline" size={24} color="#fff" />
                                <Text style={styles.completeButtonText}>Đánh dấu Hoàn thành Lộ trình</Text>
                            </TouchableOpacity>
                        )}
                    </>
                }
            />
        </SafeAreaView>
    );
};

// STYLES 
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
    // Khối thêm điểm dừng
    addStopContainer: {
        backgroundColor: 'white',
        padding: 20,
        marginTop: 10,
    },
    addStopLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 20,
        paddingBottom: 10,
    },
    // Khối item điểm dừng
    stopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingLeft: 15,
        marginHorizontal: 10,
        marginBottom: 10,
        borderRadius: 8,
    },
    stopOrderContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#aaa', // Màu xám cho điểm chưa tối ưu
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
        marginBottom: 5,
    },
    // Badge Trạng thái (Lớn - Cho Lộ trình)
    statusBadgeLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    statusBadgeCompleted: {
        backgroundColor: '#34C759', // Xanh lá
    },
    statusBadgePending: {
        backgroundColor: 'gray',
    },
    statusBadgeText: {
        color: 'white',
        marginLeft: 5,
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Badge Trạng thái (Nhỏ - Cho Điểm dừng)
    statusBadgeSmall: {
        alignSelf: 'flex-start',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    statusBadgeSmallText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusDelivered: { backgroundColor: '#34C759' }, // Xanh lá
    statusFailed: { backgroundColor: '#FF3B30' }, // Đỏ
    statusPending: { backgroundColor: 'gray' },

    deleteButton: {
        padding: 15, // Tăng vùng nhấn
    },
    // Nút Hoàn thành Lộ trình
    completeRouteButton: {
        flexDirection: 'row',
        backgroundColor: '#34C759', // Màu xanh lá
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginBottom: 40,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});

export default RouteDetailScreen;