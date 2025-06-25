import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebaseConfig';
import { Provider } from 'react-redux';
import { store } from './redux/store/store';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { BACKGROUND_NOTIFICATION_TASK } from './tasks/InviteNotificationMonitor';
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

        registerNotificationTask();
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



async function registerNotificationTask() {
  console.log("Running")
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 60 * 15, // ⏱️ run every 15 mins (minimum interval allowed)
        stopOnTerminate: false,   // continue after app is closed
        startOnBoot: true,        // auto start on device boot (Android only)
      });
      console.log('Background Notification task registered');
      Toast.show({
        type : 'success',
        text1 : "Background Notification task registered successfully!"
      })
    }
  } catch (err) {
    console.log('Failed to register background notification task:', err);
    Toast.show({
      type : "error",
      text1 : "Failed to register background notification task",
      text2 : err instanceof Error ? err.message : String(err)
    })
  }
};
