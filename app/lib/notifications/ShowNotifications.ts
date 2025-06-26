
import * as Notifications from 'expo-notifications';


function showNotification(title: string, body: string, delay: number = 0): void {
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