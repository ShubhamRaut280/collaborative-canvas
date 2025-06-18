import NewItemDialog from '@/components/NewItemDialog';
import { useRouter } from 'expo-router';
import { ref, set } from 'firebase/database';
import { collection, doc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, firestore, rdb } from '../../firebaseConfig';
import { Room } from '../models/Room';
import Stroke from '../models/Stroke';

export default function ChatRoom() {
  const [dialogVisible, setDialogVisible] = useState<'create' | 'join' | null>(null);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  React.useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(collection(firestore, 'rooms'), (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      setRooms(roomsData.filter(room => room.creator === auth.currentUser?.displayName || room.members.some(member => member.id === auth.currentUser?.uid)));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  // Dialog handlers
  const handleDialogCancel = () => {
    setDialogVisible(null);
    setNewRoomName('');
  };

  const joinRoom = async (roomCode: string) => {
    const roomQuery = collection(firestore, 'rooms');
    const roomSnapshot = await getDocs(query(roomQuery, where('code', '==', roomCode)));
    if (roomSnapshot.empty) {
      alert('Room not found. Please check the code and try again.');
      return;
    }
    const roomData = roomSnapshot.docs[0].data() as Room;
    const roomId = roomSnapshot.docs[0].id;

    // Check if user is already a member
    if (roomData.members.some(member => member.id === auth.currentUser?.uid)) {
      alert('You are already a member of this room.');
      return;
    }

    // Add user to the room
    const updatedMembers = [...roomData.members, {
      id: auth.currentUser?.uid || 'unknown',
      name: auth.currentUser?.displayName || 'Unknown User'
    }];
    
    await setDoc(doc(firestore, 'rooms', roomId), { ...roomData, members: updatedMembers }, { merge: true });
    
    
    setDialogVisible(null);

    
    await initializeBlankCanvas(roomId, roomData.code);
    
    setNewRoomName('');
    setDialogVisible(null);
  };

  const handleDialogSubmit = async () => {
    if (dialogVisible === 'create') {
      const newRoom = {
        id: new Date().getTime().toString(),
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
      };
      const roomDocRef = doc(collection(firestore, 'rooms'), newRoom.id);
      setDoc(roomDocRef, newRoom);
      await initializeBlankCanvas(newRoom.id, newRoom.code);
      setNewRoomName('');
      setDialogVisible(null);
      router.push({ pathname: '/screens/chatpage', params: { id: newRoom.id, data: JSON.stringify(newRoom) } });
    } else if (dialogVisible === 'join') {
      await joinRoom(newRoomName);
    }
  };

  async function initializeBlankCanvas(canvasId: string, roomcode: string): Promise<void> {
    const initialRef = ref(rdb, `drawings/${canvasId}/strokes`);
    const chatRef = ref(rdb, `rooms/${roomcode}/chat`);
    const starterStroke: Stroke = {
      color: '#FFFFFF',
      points: [],
      createdAt: Date.now(),
      createdBy: auth.currentUser?.displayName || 'unknown',
      strokeWidth: 5,
    };

    await set(chatRef, {
      messages: [],
    });

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

      {/* Single button to open options */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setOptionModalVisible(true)}
      >
        <Text style={styles.createButtonText}>New Room</Text>
      </TouchableOpacity>

      {/* Modal for options */}
      <Modal
        visible={optionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionModalVisible(false)}
      >
        <View style={modalModalStyles.overlay}>
          <View style={modalModalStyles.dialog}>
            <Pressable
              style={modalModalStyles.option}
              onPress={() => {
                setOptionModalVisible(false);
                setDialogVisible('create');
              }}
            >
              <Text style={modalModalStyles.optionText}>Create New Room</Text>
            </Pressable>
            <Pressable
              style={modalModalStyles.option}
              onPress={() => {
                setOptionModalVisible(false);
                setDialogVisible('join');
              }}
            >
              <Text style={modalModalStyles.optionText}>Join Room</Text>
            </Pressable>
            <Pressable
              style={modalModalStyles.cancel}
              onPress={() => setOptionModalVisible(false)}
            >
              <Text style={modalModalStyles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Dialog for create/join */}
      <NewItemDialog
        dialogVisible={dialogVisible === 'create'}
        handleDialogCancel={handleDialogCancel}
        handleDialogSubmit={handleDialogSubmit}
        newName={newRoomName}
        setNewName={setNewRoomName}
        title="Create New Room"
        description="Enter a name for the room."
        hint="Room name"
      />
      <NewItemDialog
        dialogVisible={dialogVisible === 'join'}
        handleDialogCancel={handleDialogCancel}
        handleDialogSubmit={handleDialogSubmit}
        newName={newRoomName}
        setNewName={setNewRoomName}
        title="Join a Room"
        description="Enter code for the room."
        hint="Room code"
      />
    </SafeAreaView>
  );
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
});

const modalModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: 280,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'stretch',
    shadowColor: '#4f8cff',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  option: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4ed',
  },
  optionText: {
    fontSize: 18,
    color: '#4f8cff',
    fontWeight: 'bold',
  },
  cancel: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7a90',
  },
});
