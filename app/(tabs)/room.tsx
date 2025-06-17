import { useRouter } from 'expo-router'
import { ref, set } from 'firebase/database'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { auth, firestore, rdb } from '../../firebaseConfig'
import Stroke from '../models/Stroke'
import { Room } from '../models/Room'
import NewItemDialog from '@/components/NewItemDialog'

export default function ChatRoom() {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true) 
  const router = useRouter()

  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = onSnapshot(collection(firestore, 'rooms'), (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[]
      setRooms(roomsData.filter(room => room.creator === auth.currentUser?.displayName))
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const renderItem = ({ item }: { item: Room }) => {
    const formattedDate = (() => {
      const date = new Date(item.createdAt);

      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'long' });
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const isPM = hours >= 12;
      const suffix = isPM ? 'PM' : 'AM';

      hours = hours % 12 || 12;

      return `${day} ${month} ${hours}:${minutes} ${suffix}`;
    })();

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push({ pathname: '/screens/chatpage', params: { id: item.id, data: JSON.stringify(item) } })}
      >
        <Text style={styles.fileName}>{item.name}</Text>
        <View style={{ alignItems: 'flex-end', flex: 1 }}>
          <Text style={styles.fileDate}>{formattedDate}</Text>
          <Text style={styles.fileDate}>{item.creator}</Text>
        </View>
      </TouchableOpacity>
    );
  };



  const handleCreateNew = () => {
    setDialogVisible(true)
  }

  const handleDialogCancel = () => {
    setDialogVisible(false)
    setNewRoomName('')
  }

  const handleDialogSubmit = async () => {
    setDialogVisible(false)
    const newRoom = {
      id : new Date().getTime().toString(),
      code: Math.floor(10000 + Math.random() * 90000).toString(),
      name: newRoomName,
      createdAt: new Date().toISOString(),
      creator: auth.currentUser?.displayName || 'Unknown User',
      members: [
      {
        id: auth.currentUser?.uid || 'unknown',
        name: auth.currentUser?.displayName || 'Unknown User'
      }
      ]
    }
    // ...
    const roomDocRef = doc(collection(firestore, 'rooms'), newRoom.id)
    setDoc(roomDocRef, newRoom)
    await initializeBlankCanvas(newRoom.id)
    setNewRoomName('')
    router.push({ pathname: '/screens/chatpage', params: { id: newRoom.id, data: JSON.stringify(newRoom) } })
  }

  async function initializeBlankCanvas(canvasId: string): Promise<void> {
    const initialRef = ref(rdb, `drawings/${canvasId}/strokes`);
    const starterStroke: Stroke = {
      color: '#FFFFFF',
      points: [],
      createdAt: Date.now(),
      createdBy: auth.currentUser?.displayName || 'unknown',
      strokeWidth: 5,
    };

    await set(initialRef, {
      init: starterStroke,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Chat Rooms</Text>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f8cff" />
          <Text style={{ color: '#4f8cff', marginTop: 12 }}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No rooms found.</Text>}
        />
      )}
      <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
        <Text style={styles.createButtonText}>Create New Room</Text>
      </TouchableOpacity>
      <NewItemDialog
        dialogVisible={dialogVisible}
        handleDialogCancel={handleDialogCancel}
        handleDialogSubmit={handleDialogSubmit}
        newName={newRoomName}
        setNewName={setNewRoomName}
        title="Create New Room"
        description="Enter a name for the room."
        hint="Room name"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#222',
    alignSelf: 'flex-start',
  },
  list: {
    paddingBottom: 100,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2d3a4b',
  },
  fileDate: {
    fontSize: 12,
    color: '#6b7a90',
  },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 40,
    fontSize: 16,
  },
  createButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#4f8cff',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    elevation: 4,
    shadowColor: '#4f8cff',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
})
