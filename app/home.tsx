import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type CanvasFile = {
  id: string
  name: string
  createdAt: string
}

const mockFiles: CanvasFile[] = [
  { id: '1', name: 'Design 1', createdAt: '2024-06-10' },
  { id: '2', name: 'Logo Draft', createdAt: '2024-06-09' },
  { id: '3', name: 'Poster', createdAt: '2024-06-08' },
]

const Home = () => {
  const [files, setFiles] = useState<CanvasFile[]>([])

  useEffect(() => {
    // Replace this with your real data fetching logic
    setFiles(mockFiles)
  }, [])

  const renderItem = ({ item }: { item: CanvasFile }) => (
    <View style={styles.item}>
      <Text style={styles.fileName}>{item.name}</Text>
      <Text style={styles.fileDate}>{item.createdAt}</Text>
    </View>
  )

  const handleCreateNew = () => {
    // Add your navigation or creation logic here
    alert('Create New Canvas')
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Canvas Files</Text>
      <FlatList
        data={files}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No files found.</Text>}
      />
      <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
        <Text style={styles.createButtonText}>Create New</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    marginTop: 20,
    color: '#222',
    alignSelf: 'center',
  },
  list: {
    paddingBottom: 100,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
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
    fontSize: 14,
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