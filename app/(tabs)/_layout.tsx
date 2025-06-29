import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';


import { initializeNotifications } from '../lib/notifications/UtilFuns';
import { subscribeToInvites } from '../redux/actions/generalActions';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store/store';

export default function TabsLayout() {

  const dispatch = useDispatch<AppDispatch>();

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

    const stopListening = dispatch(subscribeToInvites());


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
          title: 'Canvas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="color-palette" size={size} color={color} />
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