import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';

import {
  initializeNotifications
} from '../lib/notifications/UtilFuns';

import * as BackgroundFetch from 'expo-background-fetch';
import { FETCH_TASK } from '../lib/notifications/InviteTask';

export default function TabsLayout() {

  useEffect(() => {

    (async () => {
      await initializeNotifications();
      await registerInviteChecker();
    })();
  })


  return (
    <Tabs >
      <Tabs.Screen
        name="index"
        options={{

          headerShown: false,

          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="room"
        options={{
          headerShown: false,
          title: 'Chat Room',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}

      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}

      />
    </Tabs>
  );
}


async function registerInviteChecker() {
  await BackgroundFetch.registerTaskAsync(FETCH_TASK, {
    minimumInterval: 15 * 60, // Android minimum is ~15 min
    stopOnTerminate: false,
    startOnBoot: true,
  });

  console.log("Background fetch task registered successfully");
}
