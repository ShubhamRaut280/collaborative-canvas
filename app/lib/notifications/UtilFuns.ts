import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

function isNotificationSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function openAppSettings(): void {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

function showPermissionAlert(): void {
  Alert.alert(
    'Enable Notifications',
    'Please enable notifications in your device settings to receive alerts.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openAppSettings },
    ]
  );
}

async function checkNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') return true;
    if (!canAskAgain) showPermissionAlert();
    return false;
  } catch {
    return false;
  }
}

async function initializeNotifications(): Promise<boolean> {
  try {
    if (!isNotificationSupported()) return false;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4285F4',
        showBadge: true,
      });
    }

    const granted = await requestNotificationPermission();
    return granted;
  } catch {
    return false;
  }
}

export {
  isNotificationSupported,
  openAppSettings,
  showPermissionAlert,
  checkNotificationPermission,
  requestNotificationPermission,
  initializeNotifications,
};
