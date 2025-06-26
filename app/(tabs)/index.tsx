
import NewItemDialog from '@/app/components/NewItemDialog'
import { useRouter } from 'expo-router'
import { ref, set } from 'firebase/database'
import { collection, doc, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { auth, firestore, rdb } from '../../firebaseConfig'
import CanvasFile from '../lib/models/CanvasFile'
import Stroke from '../lib/models/Stroke'
import { subscribeToCanvasFiles } from '../redux/actions/generalActions'
import { AppDispatch, RootState } from '../redux/store/store'

const Home = () => {
    const [dialogVisible, setDialogVisible] = useState(false)
    const [newCanvasName, setNewCanvasName] = useState('')
    const {canvasFiles : files, loading : isLoading} = useSelector((state : RootState) => state.canvas);
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const unsub = dispatch(subscribeToCanvasFiles());
        return unsub;
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
                onPress={() => router.push({ pathname: '/screens/canvas', params: { id: item.id, name: item.name } })}
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
        router.push({ pathname: '/screens/canvas', params: { id: newCanvas.id, name: newCanvas.name } })
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
            <NewItemDialog
                dialogVisible={dialogVisible}
                handleDialogCancel={handleDialogCancel}
                handleDialogSubmit={handleDialogSubmit}
                newName={newCanvasName}
                setNewName={setNewCanvasName}
                title="Create New Canvas"
                description="Enter a name for the canvas."
                hint="Canvas Name"
            />
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


