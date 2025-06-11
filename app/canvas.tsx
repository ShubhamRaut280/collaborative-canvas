import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onChildAdded, off, ref } from 'firebase/database';
import { Canvas as SkiaCanvas, Path } from '@shopify/react-native-skia';

import { rdb } from '../firebaseConfig';
import { createPathFromPoints } from './utils/skia';
import type Stroke from './models/Stroke';

const { width, height } = Dimensions.get('window');

const CanvasScreen = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  useEffect(() => {
    if (!id) return;
    const strokesRef = ref(rdb, `drawings/${id}/strokes`);

    const handleNewStroke = (snapshot: any) => {
      const newStroke = snapshot.val();
      if (newStroke?.points?.length > 1) {
        setStrokes(prev => [...prev, newStroke]);
      }
    };

    onChildAdded(strokesRef, handleNewStroke);
    return () => off(strokesRef, 'child_added', handleNewStroke);
  }, [id]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || 'Canvas'}</Text>
      </View>

      {/* Canvas Content */}
      <View style={styles.content}>
        <Text style={styles.debugText}>Strokes: {strokes.length}</Text>
        <SkiaCanvas style={styles.canvas}>
          {strokes.map((stroke, index) => (
            <Path
              key={index}
              path={createPathFromPoints(stroke.points)}
              color={stroke.color || '#007AFF'}
              style="stroke"
              strokeWidth={4}
            />
          ))}
        </SkiaCanvas>
      </View>
    </View>
  );
};

export default CanvasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  canvas: {
    width: '100%',
    height: '100%',
    
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugText: {
    marginBottom: 8,
    color: '#888',
  },
});
