import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';


import { listenForInvites } from '../lib/notifications/listners';
import { initializeNotifications } from '../lib/notifications/UtilFuns';

export default function TabsLayout() {

  useEffect(() => {

    (async () => {
      console.log("Starting notifications")
      const res = await initializeNotifications();
      if (res) {
        console.log("Notifications initialized successfully");
      } else {
        console.error("Failed to initialize notifications");
      }
    })();

    const stopListening = listenForInvites();

    return () => {
      stopListening(); // clean up listener
    };
  }, []);


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