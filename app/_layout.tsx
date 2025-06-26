import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebaseConfig';
import { Provider } from 'react-redux';
import { store } from './redux/store/store';
import Toast from 'react-native-toast-message';

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

  return (
    <>
      {/* <App /> */}

      <Provider store={store}>

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="/screens/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </Provider>
      <Toast />
    </>

  );
}

