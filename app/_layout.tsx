import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { auth } from '../firebaseConfig';
import CustomHeader from './components/CustomHeader';
import { store } from './redux/store/store';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoading(false);
      const inAuthGroup = segments[1] === 'login';
      if (!user && !inAuthGroup) {
        router.replace('/screens/login');
      } else if (user && inAuthGroup && user.emailVerified) {
        router.replace('/(tabs)');
      }
    });
    return unsubscribe;
  }, [router, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f8cff" />
      </View>
    );
  }

  const handleNotificationPress = () => {
    router.push('/screens/notifications');
  };

  return (
    <>
      <Provider store={store}>
        <Stack screenOptions={{
          headerShown: false, // Change default to false
        }}>
          <Stack.Screen name="/screens/login" options={{ headerShown: false }} />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: true,
              header: () => (
                <CustomHeader
                  title="Home"
                  onNotificationPress={handleNotificationPress}
                  notificationBadge={true}
                />
              )
            }} 
          />
          <Stack.Screen name="/screens/notifications" options={{ headerShown: false }} />
        </Stack>
      </Provider>
      <Toast />
    </>
  );
}
