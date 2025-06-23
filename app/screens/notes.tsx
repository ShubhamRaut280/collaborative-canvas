import { MaterialCommunityIcons } from '@expo/vector-icons'; // Add this import
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Note = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  createdBy: string;
};

const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Meeting Notes',
    description: 'Discuss project milestones and deliverables.',
    createdAt: new Date(),
    createdBy: 'Alice',
  },
  {
    id: '2',
    title: 'Shopping List',
    description: 'Milk, Bread, Eggs, Coffee, Fruits.',
    createdAt: new Date(),
    createdBy: 'Bob',
  },
  {
    id: '3',
    title: 'Ideas',
    description: 'Brainstorm app features and UI improvements.',
    createdAt: new Date(),
    createdBy: 'Charlie',
  },
];

export default function NotesScreen() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const openModal = (note: Note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNote(null);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity style={styles.noteItem} onPress={() => openModal(item)}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteDesc} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Add Note Floating Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </TouchableOpacity>

      {/* View Note Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedNote?.title}</Text>
            <Text style={styles.modalDesc}>{selectedNote?.description}</Text>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Note Modal (placeholder, you can implement the form) */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>
            {/* Add your form here */}
            <Pressable style={styles.closeButton} onPress={() => setAddModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  listContent: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
  },
  noteDesc: {
    fontSize: 15,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#4287f5',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    zIndex: 10,
  },
});
