import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const App = () => {
  // Trạng thái: 'loading', 'signedOut', 'signedIn'
  // (Nên làm) authState phải chấp nhận 3 trạng thái
  const [authState, setAuthState] = useState<'loading' | 'signedOut' | 'signedIn'>('loading');
  // Nơi lưu trữ Access Token
  // userToken phải chấp nhận kiểu string hoặc null
  const [userToken, setUserToken] = useState<string | null>(null);

  // --- HÀM 1: KIỂM TRA PHIÊN ĐĂNG NHẬP KHI KHỞI CHẠY ---
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (e) {
        // Khôi phục token thất bại
        console.log('Restoring token failed:', e);
      }

      // Chuyển trạng thái dựa trên việc có token hay không
      setUserToken(token);
      setAuthState(token ? 'signedIn' : 'signedOut');
    }

    bootstrapAsync();
  }, []);

  // --- HÀM 2: QUẢN LÝ ĐĂNG NHẬP (ĐƯỢC GỌI TỪ AuthScreen) ---
  const signIn = async (token: string) => {
    try {
      // Lưu token vào bộ nhớ cục bộ
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      setAuthState('signedIn');
    } catch (e) {
      console.log('Saving token failed: ', e);
    }
  }

  // --- HÀM 3: QUẢN LÝ ĐĂNG XUẤT (SẼ DÙNG Ở DashboardScreen) ---
  const signOut = async () => {
    try {
      // Xóa token khỏi bộ nhớ cục bộ
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
      setAuthState('signedOut');
    } catch (e) {
      console.log('Removing token failed: ', e);
    }
  }

  // Hiển thị màn hình Loading trong khi kiểm tra Token
  if (authState === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Hiển thị AuthScreen nếu chưa đăng nhập
  if (authState === 'signedOut') {
    // Truyền hàm signIn để AuthScreen có thể gọi khi đăng nhập thành công
    return <AuthScreen onSignIn={signIn} />;
  }

  // Hiển thị Dashboard nếu đã đăng nhập
  return <DashboardScreen userToken={userToken} onSignOut={signOut} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
