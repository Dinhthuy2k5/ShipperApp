// File: App.tsx (GỐC)

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

// Import 2 luồng điều hướng của bạn
import AuthStack from './src/navigation/AuthStack';
import MainTabNavigator from './src/navigation/MainTabNavigator';

const App = () => {
  const [authState, setAuthState] = useState<'loading' | 'signedOut' | 'signedIn'>('loading');
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.log('Restoring token failed: ', e);
      }
      setUserToken(token);
      setAuthState(token ? 'signedIn' : 'signedOut');
    };
    bootstrapAsync();
  }, []);

  const signIn = async (token: string) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      setAuthState('signedIn');
    } catch (e) {
      console.log('Saving token failed: ', e);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
      setAuthState('signedOut');
    } catch (e) {
      console.log('Removing token failed: ', e);
    }
  };

  if (authState === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      {authState === 'signedOut' ? (
        <AuthStack onSignIn={signIn} />
      ) : (
        <MainTabNavigator userToken={userToken} onSignOut={signOut} />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;