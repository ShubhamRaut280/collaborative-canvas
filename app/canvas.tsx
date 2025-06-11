import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { off, onChildAdded, ref } from 'firebase/database'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { rdb } from '../firebaseConfig'
import Stroke from './models/Stroke'


const Canvas = () => {
    const router = useRouter()
    const { id, name } = useLocalSearchParams()
    const [strokes, setStrokes] = useState<Stroke[]>([])

    useEffect(() => {
        if (!id) return
        const strokesRef = ref(rdb, `drawings/${id}/strokes`)
        const handleNewStroke = (snapshot: any) => {
            const newStroke = snapshot.val()
            setStrokes(prev => [...prev, newStroke])
        }
        onChildAdded(strokesRef, handleNewStroke)
        return () => off(strokesRef, 'child_added', handleNewStroke)
    }, [id])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{name}</Text>
            </View>
            <View style={styles.content}>
                <Text>Strokes: {strokes.length}</Text>
                {/* Render strokes visually here if needed */}
            </View>
        </View>
    )
}

export default Canvas

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
        justifyContent: 'center',
    },
})