// File: src/navigation/AuthStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen'; // Lấy từ thư mục screens

const Stack = createNativeStackNavigator();

const AuthStack = ({ onSignIn }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Auth"
                component={AuthScreen}
                initialParams={{ onSignIn: onSignIn }} // Truyền hàm onSignIn vào AuthScreen
            />
        </Stack.Navigator>
    );
};

export default AuthStack;