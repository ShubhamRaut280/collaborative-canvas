
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';


function showNotification(title: string, body: string, delay: number = 0): void {
    if(Platform.OS === 'web') {
        Toast.show({
            type: 'info',
            position: 'top',
            text1: title,
            text2: body,
            visibilityTime: 4000,
            autoHide: true,
        });

        return;
    }
    try {
        Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
            },
            trigger: { seconds: delay, channelId: 'default' },
        });
        console.log(`✅ Notification scheduled: ${title} - ${body}`);
    } catch (error) {
        console.error('❌ Error showing notification:', error);
    }
}


export { showNotification }