import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

type Tab = 'canvas' | 'chat';

type Props = {
  onTabChange: (tab: Tab) => void;
  hasUnread: boolean;
};

export default function FloatingTabSwitch({ onTabChange, hasUnread }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('canvas');
  const [animValue] = useState(new Animated.Value(0));

  const handleTabPress = (tab: Tab) => {
    if (tab !== activeTab) {
      Animated.timing(animValue, {
        toValue: tab === 'canvas' ? 0 : 1,
        duration: 260,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
      setActiveTab(tab);
      onTabChange(tab);
    }
  };

  // Interpolate the animated value for the switcher
  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 64], // adjust for your icon/button width
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.switcher,
          { transform: [{ translateX }] },
        ]}
      />
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => handleTabPress('canvas')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={activeTab === 'canvas' ? 'palette' : 'palette-outline'}
          size={32}
          color={activeTab === 'canvas' ? '#fff' : '#4287f5'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => handleTabPress('chat')}
        activeOpacity={0.8}
      >
        <Ionicons
          name={activeTab === 'chat' ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
          size={32}
          color={activeTab === 'chat' ? '#fff' : '#4287f5'}
        />
        {hasUnread && (
          <View style={styles.redDot} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    padding: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    zIndex: 999,
    width: 120,
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  switcher: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4287f5',
    top: 8,
    left: 0,
    zIndex: 1,
    elevation: 2,
  },
  redDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff',
  },
});
