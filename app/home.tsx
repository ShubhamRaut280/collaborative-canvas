import { auth, firestore, rdb } from '../firebaseConfig'
import { useRouter } from 'expo-router'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Dialog from 'react-native-dialog'

type CanvasFile = {
    id: string
    name: string
    createdAt: string
    creator: string
}


const Home = () => {
    const [dialogVisible, setDialogVisible] = useState(false)
    const [newCanvasName, setNewCanvasName] = useState('')
    const [files, setFiles] = useState<CanvasFile[]>([])
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, 'canvasFiles'), (snapshot) => {
            const filesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CanvasFile[]
            setFiles(filesData)
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
            <TouchableOpacity style={styles.item} onPress={() => router.push({ pathname: '/canvas', params: { id: item.id } })}>
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

    const handleDialogSubmit = () => {
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
        setNewCanvasName('')
        router.push({ pathname: '/canvas', params: { id: newCanvas.id } })
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
            <Dialog.Container
                visible={dialogVisible}
                contentStyle={{
                    borderRadius: 16,
                    backgroundColor: '#f8faff',
                    padding: 24,
                    shadowColor: '#4f8cff',
                    shadowOpacity: 0.15,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <Dialog.Title style={{ color: '#2d3a4b', fontWeight: 'bold', fontSize: 22, textAlign: 'left' }}>
                    Create New Canvas
                </Dialog.Title>
                <Dialog.Description style={{ color: '#6b7a90', fontSize: 15, marginBottom: 10, textAlign: 'left' }}>
                    Enter a name for your new canvas
                </Dialog.Description>
                <Dialog.Input
                    placeholder=" Canvas name"
                    value={newCanvasName}
                    onChangeText={setNewCanvasName}
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 8,

                        borderColor: '#e0e4ed',
                        borderWidth: 1,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        fontSize: 16,
                        color: '#2d3a4b',
                        marginBottom: 10,
                    }}
                    placeholderTextColor="#b0b3b8"
                />
                <Dialog.Button
                    label="Cancel"
                    onPress={handleDialogCancel}
                    style={{ color: '#6b7a90', fontWeight: '500' }}
                />
                <Dialog.Button
                    label="Create"
                    onPress={handleDialogSubmit}
                    disabled={!newCanvasName.trim()}
                    style={{
                        color: !newCanvasName.trim() ? '#b0b3b8' : '#4f8cff',
                        fontWeight: 'bold',
                    }}
                />
            </Dialog.Container>
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