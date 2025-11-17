// File: src/components/RouteDetailSheet.js
// Component này CHỈ hiển thị nội dung bên trong tấm trượt

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

// Component này nhận RẤT NHIỀU props (state và hàm) từ cha
const RouteDetailSheet = ({
    bottomSheetRef,
    snapPoints,
    routeDetails,
    isCompleted,
    newStopAddress,
    setNewStopAddress,
    handleAddStop,
    handleDeleteStop,
    handleUpdateStopStatus,
    handleManualCompleteRoute,
}) => {

    // --- Hàm render cho từng điểm dừng (stop) ---
    const renderStopItem = ({ item }) => (
        <View style={styles.stopItem}>
            <View style={[
                styles.stopOrderContainer,
                item.optimized_order && { backgroundColor: '#007AFF' }
            ]}>
                <Text style={styles.stopOrder}>
                    {item.optimized_order || '-'}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.stopDetails}
                disabled={isCompleted}
                onPress={() => handleUpdateStopStatus(item.id, item.stop_status)}
            >
                <Text style={styles.stopAddress}>{item.address_text}</Text>

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

            {!isCompleted && (
                <TouchableOpacity onPress={() => handleDeleteStop(item.id)} style={styles.deleteButton}>
                    <Icon name="trash-bin-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            )}
        </View>
    );

    // --- Hàm render Header của danh sách ---
    const renderListHeader = () => (
        <>
            <View style={styles.header}>
                <Text style={styles.title}>{routeDetails.route_name}</Text>

                <View style={styles.startPointContainer}>
                    <Icon name="navigate-circle-outline" size={20} color="#34C759" />
                    <Text style={styles.startPointLabel}>Xuất phát:</Text>
                    <Text style={styles.startPointText} numberOfLines={2}>
                        {routeDetails.start_address || "Chưa cập nhật"}
                    </Text>
                </View>

                {/* Thông tin KM/Phút */}
                {routeDetails.total_distance_meters ? (
                    <Text style={styles.info}>
                        {(routeDetails.total_distance_meters / 1000).toFixed(1)} km -
                        Khoảng {Math.round(routeDetails.total_duration_seconds / 60)} phút
                    </Text>
                ) : (
                    <Text style={styles.infoPending}>Lộ trình chưa được tối ưu hóa</Text>
                )}

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
    );

    // --- Hàm render Footer của danh sách ---
    const renderListFooter = () => (
        <>
            {!isCompleted && routeDetails?.stops.length > 0 && (
                <TouchableOpacity style={styles.completeRouteButton} onPress={handleManualCompleteRoute}>
                    <Icon name="checkmark-done-circle-outline" size={24} color="#fff" />
                    <Text style={styles.completeButtonText}>Đánh dấu Hoàn thành Lộ trình</Text>
                </TouchableOpacity>
            )}
        </>
    );

    // --- Tay nắm của Tấm trượt ---
    const renderSheetHandle = () => (
        <View style={styles.bottomSheetHandle}>
            <View style={styles.handleBar} />
        </View>
    );

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={1} // Bắt đầu ở điểm 50%
            snapPoints={snapPoints}
            handleComponent={renderSheetHandle}
        >
            <BottomSheetFlatList
                data={routeDetails.stops}
                renderItem={renderStopItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderListFooter}
            />
        </BottomSheet>
    );
};

// Dán TOÀN BỘ styles của RouteDetailScreen cũ vào đây
// (Trừ styles của Map/Marker đã ở file RouteDetailMap.js)
const styles = StyleSheet.create({
    // Tay nắm
    bottomSheetHandle: {
        backgroundColor: 'white',
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    handleBar: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#ccc',
    },

    // (Styles cũ của bạn)
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
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
    addStopContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
        backgroundColor: '#f5f5f5',
    },
    stopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    stopOrderContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#aaa',
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
        backgroundColor: '#34C759',
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
    statusDelivered: { backgroundColor: '#34C759' },
    statusFailed: { backgroundColor: '#FF3B30' },
    deleteButton: {
        padding: 15,
    },
    completeRouteButton: {
        flexDirection: 'row',
        backgroundColor: '#34C759',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginBottom: 40,
        marginTop: 20,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    startPointContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    startPointLabel: {
        fontWeight: 'bold',
        color: '#34C759', // Xanh lá
        marginLeft: 5,
        marginRight: 5,
    },
    startPointText: {
        flex: 1, // Để text tự xuống dòng
        color: '#333',
        fontSize: 14,
    },
    infoPending: {
        fontSize: 14,
        color: '#FF9500', // Màu cam cảnh báo
        marginTop: 5,
        fontStyle: 'italic',
    },
});

export default RouteDetailSheet;