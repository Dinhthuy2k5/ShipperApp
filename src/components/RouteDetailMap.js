// File: src/components/RouteDetailMap.js
// (Bản sửa lỗi: Thêm kiểm tra 'null' cho tọa độ)

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { decodePolyline, getBounds } from '../utils/mapUtils';

// Lấy Access Token của bạn
MapboxGL.setAccessToken("pk.eyJ1IjoiZGluaHRodXkyazUiLCJhIjoiY21ocjM1cmE0MTMxMDJqcTRpOGp5ZnRzaCJ9.EmSwnqiQpUOxl_ip-qz0ow"); // <-- DÁN TOKEN CỦA BẠN VÀO ĐÂY

const RouteDetailMap = ({ routeDetails }) => {
    // SỬA: Đổi tên ref cho rõ ràng
    const cameraRef = useRef(null);

    // Tự động zoom bản đồ khi dữ liệu thay đổi
    useEffect(() => {
        // SỬA: Dùng cameraRef
        if (cameraRef.current && routeDetails && routeDetails.start_lat && routeDetails.start_lng) {

            const validStops = routeDetails.stops.filter(stop => stop.lat && stop.lng);
            const stopsCoords = validStops.map(stop => [stop.lng, stop.lat]);

            const allCoords = [
                [routeDetails.start_lng, routeDetails.start_lat],
                ...stopsCoords
            ];

            // SỬA: Gọi fitBounds từ cameraRef
            cameraRef.current.fitBounds(
                getBounds(allCoords)[0], // Tọa độ NE
                getBounds(allCoords)[1], // Tọa độ SW
                80, // Padding
                1000 // Thời gian (ms)
            );
        }
    }, [routeDetails]); // Chạy khi có 'routeDetails'

    return (
        <MapboxGL.MapView
            // SỬA: Xóa ref khỏi MapView
            style={styles.map}
            styleURL={MapboxGL.StyleURL.Street}
        >
            <MapboxGL.Camera
                // SỬA: Thêm ref vào Camera
                ref={cameraRef}
                defaultSettings={{
                    centerCoordinate: [105.8522, 21.0285], // Hà Nội
                    zoomLevel: 10,
                }}
            />

            {/* (Phần code còn lại: PointAnnotation, ShapeSource... giữ nguyên) */}
            {/* 1. Vẽ Điểm Bắt đầu */}
            {routeDetails?.start_lat && routeDetails?.start_lng && (
                <MapboxGL.PointAnnotation
                    id="startPoint"
                    coordinate={[routeDetails.start_lng, routeDetails.start_lat]}
                >
                    <View style={styles.markerStart}>
                        <Icon name="navigate" size={24} color="#fff" />
                    </View>
                </MapboxGL.PointAnnotation>
            )}

            {/* 2. Vẽ các Điểm dừng */}
            {routeDetails?.stops.map((stop) => {
                if (!stop.lat || !stop.lng) return null;
                return (
                    <MapboxGL.PointAnnotation
                        key={stop.id}
                        id={stop.id.toString()}
                        coordinate={[stop.lng, stop.lat]}
                    >
                        <View style={[
                            styles.markerStop,
                            stop.optimized_order && { backgroundColor: '#007AFF' }
                        ]}>
                            <Text style={styles.markerText}>{stop.optimized_order || '!'}</Text>
                        </View>
                    </MapboxGL.PointAnnotation>
                );
            })}

            {/* 3. Vẽ Đường đi (Polyline) */}
            {routeDetails?.overview_polyline && (
                <MapboxGL.ShapeSource
                    id="routeSource"
                    shape={{
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: decodePolyline(routeDetails.overview_polyline),
                        },
                    }}
                >
                    <MapboxGL.LineLayer
                        id="routeLine"
                        style={{ lineColor: '#007AFF', lineWidth: 5, lineOpacity: 0.8 }}
                    />
                </MapboxGL.ShapeSource>
            )}
        </MapboxGL.MapView>
    );
};

// ... (Styles của bạn giữ nguyên)
const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFill,
    },
    markerStart: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 2,
    },
    markerStop: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 2,
    },
    markerText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default RouteDetailMap;