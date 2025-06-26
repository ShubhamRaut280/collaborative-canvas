import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { listenForInvites } from './listners';

export const FETCH_TASK = 'invite-check-task';

TaskManager.defineTask(FETCH_TASK, async () => {
  console.log('Running background fetch task for invites...');
  try {
    listenForInvites();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.error(e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
