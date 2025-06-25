import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

export const BACKGROUND_NOTIFICATION_TASK = 'background-invite-notification-monitor-task';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    // ✅ Put your background logic here
    console.log('Running background task...');

    // Example: fetch or sync data, or check updates
    // await someAsyncFunction();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
