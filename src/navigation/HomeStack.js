// File: src/navigation/HomeStack.js
// Quản lý các màn hình cho Tab "Trang chủ"

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import RouteDetailScreen from '../screens/RouteDetailScreen'; // Màn hình mới

const Stack = createNativeStackNavigator();

// Stack này nhận userToken từ Tab Navigator và truyền nó xuống HomeScreen
const HomeStack = ({ userToken }) => {
    return (
        <Stack.Navigator>
            {/* Màn hình 1: Danh sách Lộ trình */}
            <Stack.Screen
                name="Home"
                options={{ headerShown: false }} // Ẩn header của Stack
            >
                {/* Truyền userToken và navigation props xuống HomeScreen */}
                {(props) => <HomeScreen {...props} userToken={userToken} />}
            </Stack.Screen>

            {/* Màn hình 2: Chi tiết Lộ trình */}
            <Stack.Screen
                name="RouteDetail"
                component={RouteDetailScreen}
                options={{ title: 'Chi tiết Lộ trình' }} // Đặt tiêu đề cho màn hình chi tiết
            />
        </Stack.Navigator>
    );
};

export default HomeStack;