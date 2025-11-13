// File: src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon

import HomeScreen from '../screens/HomeScreen'; // Màn hình Home mới
import ProfileScreen from '../screens/ProfileScreen'; // Màn hình Hồ sơ mới

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ userToken, onSignOut }) => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline'; // Icon Home
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false, // Ẩn header mặc định
            })}
        >
            {/* Tab 1: Trang chủ (theo sketch) */}
            <Tab.Screen
                name="HomeTab"
                options={{ title: 'Trang chủ' }}
            >
                {/* Truyền userToken vào HomeScreen */}
                {() => <HomeScreen userToken={userToken} />}
            </Tab.Screen>

            {/* Tab 2: Hồ sơ (để Đăng xuất) */}
            <Tab.Screen
                name="ProfileTab"
                options={{ title: 'Hồ sơ' }}
            >
                {/* Truyền hàm onSignOut vào ProfileScreen */}
                {() => <ProfileScreen onSignOut={onSignOut} />}
            </Tab.Screen>

        </Tab.Navigator>
    );
};

export default MainTabNavigator;