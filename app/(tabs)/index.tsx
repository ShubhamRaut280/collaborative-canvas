import { useRouter } from 'expo-router'
import { ref, set } from 'firebase/database'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth, firestore, rdb } from '../../firebaseConfig'
import CanvasFile from '../models/CanvasFile'
import Stroke from '../models/Stroke'

const Home = () => {
    const [dialogVisible, setDialogVisible] = useState(false)
    const [newCanvasName, setNewCanvasName] = useState('')
    const [files, setFiles] = useState<CanvasFile[]>([])
    const [isLoading, setIsLoading] = useState(true) // <-- Add loading state
    const router = useRouter()

    useEffect(() => {
        setIsLoading(true)
        const unsubscribe = onSnapshot(collection(firestore, 'canvasFiles'), (snapshot) => {
            const filesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CanvasFile[]
            setFiles(filesData.filter(file => file.creator === auth.currentUser?.displayName)) // Ensure all fields are present
            setIsLoading(false) // <-- Set loading false after data is loaded
        })

        return () => unsubscribe()
    }, [])

    const renderItem = ({ item }: { item: CanvasFile }) => {
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
                onPress={() => router.push({ pathname: '/canvas', params: { id: item.id, name: item.name } })}
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
        setNewCanvasName('')
    }

    const handleDialogSubmit = async () => {
        setDialogVisible(false)
        const newCanvas = {
            name: newCanvasName,
            createdAt: new Date().toISOString(),
            id: Date.now().toString(),
            creator: auth.currentUser?.displayName || 'Unknown User',
        }
        // ...
        const canvasDocRef = doc(collection(firestore, 'canvasFiles'), newCanvas.id)
        setDoc(canvasDocRef, newCanvas)
        await initializeBlankCanvas(newCanvas.id)
        setNewCanvasName('')
        router.push({ pathname: '/canvas', params: { id: newCanvas.id, name: newCanvas.name } })
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
            <Text style={styles.title}>Your Canvas Files</Text>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#4f8cff" />
                    <Text style={{ color: '#4f8cff', marginTop: 12 }}>Loading...</Text>
                </View>
            ) : (
                <FlatList
                    data={files}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No files found.</Text>}
                />
            )}
            <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
                <Text style={styles.createButtonText}>Create New</Text>
            </TouchableOpacity>
            <Modal
                visible={dialogVisible}
                transparent
                animationType="fade"
                onRequestClose={handleDialogCancel}
            >
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.dialog}>
                        <Text style={modalStyles.title}>Create New Canvas</Text>
                        <Text style={modalStyles.description}>Enter a name for your new canvas</Text>
                        <TextInput
                            placeholder="Canvas name"
                            value={newCanvasName}
                            onChangeText={setNewCanvasName}
                            style={modalStyles.input}
                            placeholderTextColor="#b0b3b8"
                            autoFocus={Platform.OS !== 'web'}
                        />
                        <View style={modalStyles.buttonRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    modalStyles.button,
                                    { backgroundColor: pressed ? '#f0f0f0' : 'transparent' }
                                ]}
                                onPress={handleDialogCancel}
                            >
                                <Text style={modalStyles.cancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    modalStyles.button,
                                    { backgroundColor: pressed ? '#e6f0ff' : 'transparent' }
                                ]}
                                onPress={handleDialogSubmit}
                                disabled={!newCanvasName.trim()}
                            >
                                <Text style={[
                                    modalStyles.createText,
                                    { color: !newCanvasName.trim() ? '#b0b3b8' : '#4f8cff' }
                                ]}>
                                    Create
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default Home;

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

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        width: 340,
        borderRadius: 16,
        backgroundColor: '#f8faff',
        padding: 24,
        shadowColor: '#4f8cff',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        color: '#2d3a4b',
        fontWeight: 'bold',
        fontSize: 22,
        textAlign: 'left',
        marginBottom: 4,
    },
    description: {
        color: '#6b7a90',
        fontSize: 15,
        marginBottom: 10,
        textAlign: 'left',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderColor: '#e0e4ed',
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        color: '#2d3a4b',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    button: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    cancelText: {
        color: '#6b7a90',
        fontWeight: '500',
        fontSize: 16,
    },
    createText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});