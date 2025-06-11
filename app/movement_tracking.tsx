import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export default function App() {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const movements = useRef<{ x: number; y: number }[]>([]);

  // Track finger anywhere on the screen
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      offsetX.value = e.absoluteX - 60;
      offsetY.value = e.absoluteY - 60;
      movements.current.push({ x: e.absoluteX, y: e.absoluteY });
    })
    .onEnd(() => {
      console.log('All movements:', movements.current);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.box, animatedStyle]} />
        <Text style={{ position: 'absolute', top: 40, left: 20, color: '#333' }}>
          Move your finger anywhere!
        </Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    borderRadius: 20,
  },
});