import React, { useEffect } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });
        console.log('Channel created ✅');
      }

      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Permission status:', status);
    };

    prepare();
  }, []);

  const scheduleNotification = async () => {
    console.log('Scheduling...');
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test 🔔',
          body: 'Local notification is working!',
        },
        trigger: { seconds: 2, channelId: 'default' },
      });
      console.log('Scheduled successfully ✅');
    } catch (e) {
      console.error('Failed to schedule notification ❌', e);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Expo Notification Test</Text>
      <Button title="Trigger Notification" onPress={scheduleNotification} />
    </View>
  );
}
