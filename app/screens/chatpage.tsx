import DrawingCanvas from '@/components/DrawingCanvas'
import FloatingTabSwitch from '@/components/FloatingTabSwitch'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Room } from '../models/Room'
import { Message } from '../models/Message'
import { auth, rdb } from '@/firebaseConfig'
import ChatScreenComp from '@/components/ChatScreenComp'
import { onChildAdded, push, ref, set } from 'firebase/database'
import NotesScreen from './notes'

const canvasBackgroundColor = '#fff'

export default function ChatPage() {
    const { id, data } = useLocalSearchParams()
    const roomDetails = data ? (JSON.parse(data as string) as Room) : null
    const [activeTab, setActiveTab] = useState<'canvas' | 'chat' | 'notes'>('canvas')
    const [hasUnread, setHasUnread] = useState(false)

    const [messages, setMessages] = useState<Message[]>([])
    const router = useRouter()

    const roomCode = roomDetails?.code || ''
    const chatRef = ref(rdb, `rooms/${roomCode}/chat`)


    useEffect(() => {
        if (!roomCode) return
        const handleNewMessage = (snapshot: any) => {
            const newMessage = snapshot.val() as Message

            setMessages(prevMessages => {
                const alreadyExists = prevMessages.some(msg => msg.id === newMessage.id)
                if (alreadyExists) return prevMessages
                return [...prevMessages, newMessage]
            })

            if (
                newMessage?.sender !== auth.currentUser?.displayName &&
                activeTab !== 'chat'
            ) {
                setHasUnread(false)
            }
        }

        const unsubscribe = onChildAdded(chatRef, handleNewMessage)

        return () => unsubscribe()
    }, [roomCode, activeTab, chatRef])


    const addMessage = async (content: string) => {

        const newMessage : Message = {
            id: Date.now().toString(), // Use timestamp as a unique ID
            content,
            sender: auth.currentUser?.displayName || 'Anonymous',
            createdAt: new Date().toISOString(),
        }

        push(chatRef, newMessage);
        
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{roomDetails?.name || 'Canvas'}</Text>
                </View>

                {/* Canvas or Chat */}
                <View style={{ flex: 1, backgroundColor: canvasBackgroundColor }}>
                    {activeTab === 'canvas' ? (
                        <DrawingCanvas
                            id={roomDetails?.id || (id as string)}
                            name={roomDetails?.name || 'Canvas'}
                            isRoom={true}
                        />
                    ) : 
                    activeTab === 'notes' ? (
                        <NotesScreen/>
                    ) : 
                    (
                        <ChatScreenComp messages={messages} onSend={addMessage} />
                    )}
                </View>

                {/* Floating tab switch */}
                <FloatingTabSwitch
                    onTabChange={(tab) => {
                        
                        setActiveTab(tab)
                        if (tab === 'chat') setHasUnread(false)
                    }}
                    hasUnread={hasUnread}
                />

                {/* Share message */}
                <View style={styles.shareMsg}>
                    <Text style={styles.shareText}>Use </Text>
                    <Text style={{ fontWeight: 'bold' }}>{roomCode}</Text>
                    <Text style={styles.shareText}> code to invite others</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: canvasBackgroundColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
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
    shareText: {
        fontSize: 15,
        color: 'grey',
        textAlign: 'center',
        marginVertical: 10,
    },
    shareMsg: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
})
