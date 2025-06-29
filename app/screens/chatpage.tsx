import ChatScreenComp from '@/app/components/ChatScreenComp'
import DrawingCanvas from '@/app/components/DrawingCanvas'
import FloatingTabSwitch from '@/app/components/FloatingTabSwitch'
import NewItemDialog from '@/app/components/NewItemDialog'
import { auth, firestore, rdb } from '@/firebaseConfig'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@react-navigation/elements'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { onChildAdded, push, ref, set } from 'firebase/database'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Invite from '../lib/models/Invite'
import { Message } from '../lib/models/Message'
import { Room } from '../lib/models/Room'
import NotesScreen from './notes'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { collection, getDocs, query, where } from 'firebase/firestore'


const canvasBackgroundColor = '#fff'

export default function ChatPage() {
    const { id, data } = useLocalSearchParams()
    const roomDetails = data ? (JSON.parse(data as string) as Room) : null
    const [activeTab, setActiveTab] = useState<'canvas' | 'chat' | 'notes'>('canvas')
    const [hasUnread, setHasUnread] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')

    const [messages, setMessages] = useState<Message[]>([])
    const [inviteDialogVisible, setInviteDialogVisible] = useState(false)
    const router = useRouter()

    const roomCode = roomDetails?.code || ''
    const chatRef = ref(rdb, `rooms/${roomCode}/chat`)
    const inviteRef = ref(rdb, `invites/`);


    const [isOwner, setIsOwner] = useState(false)

    useEffect(() => {
        if (!roomCode) return

        const checkRoomOwnership = async () => {
            const roomSnapshot = await getDocs(query(collection(firestore, 'rooms'), where('code', '==', roomCode)))
            if (!roomSnapshot.empty) {
                const roomData = roomSnapshot.docs[0].data() as Room
                setIsOwner(roomData.creator === auth.currentUser?.displayName)
            }
        }

        checkRoomOwnership()
    }, [roomCode])


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

        const newMessage: Message = {
            id: Date.now().toString(), // Use timestamp as a unique ID
            content,
            sender: auth.currentUser?.displayName || 'Anonymous',
            createdAt: new Date(),
        }

        push(chatRef, newMessage);

    }

    const handleInvitePress = () => {
        setInviteDialogVisible(!inviteDialogVisible)
    }

    const handleDialogCancel = () => {
        setInviteDialogVisible(false)
    }

    const handleDialogSubmit = async () => {
        if (!inviteEmail.trim()) return
        const inviteObj: Invite = {
            id: Date.now().toString(),
            roomcode: roomDetails?.code || "",
            receiver: inviteEmail.trim(),
            sender: auth.currentUser?.email || 'Unknown',
            status: 'pending',
            createdAt: new Date(),
            roomName: roomDetails?.name || 'Unknown Room',
        }

        const newInviteRef = push(inviteRef)
        inviteObj.id = newInviteRef.key || Date.now().toString()
        await set(newInviteRef, inviteObj)

        saveInviteToStorage(inviteObj.id)

        setInviteDialogVisible(false);

        Toast.show({
            type: 'success',
            text1: "Invitation sent!"
        })

        setInviteEmail('');
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
                    {/* Floating tab switch */}
                    <FloatingTabSwitch
                        onTabChange={(tab) => {

                            setActiveTab(tab)
                            if (tab === 'chat') setHasUnread(false)
                        }}
                        hasUnread={hasUnread}
                    />
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
                            <NotesScreen code={roomDetails?.code || ''} />
                        ) :
                            (
                                <ChatScreenComp messages={messages} onSend={addMessage} />
                            )}
                </View>



                <View style={styles.shareContainer}>
                    {/* Share message */}
                    <View style={styles.shareMsg}>
                        <Text style={styles.shareText}>Use </Text>
                        <Text style={{ fontWeight: 'bold' }}>{roomCode}</Text>
                        <Text style={styles.shareText}> code to invite others</Text>
                    </View>

                    {isOwner && (
                        <Button onPressIn={handleInvitePress} > Invite </Button>
                    )}

                </View>
            </View>

            {inviteDialogVisible && (
                <NewItemDialog
                    dialogVisible={inviteDialogVisible}
                    handleDialogCancel={handleDialogCancel}
                    handleDialogSubmit={handleDialogSubmit}
                    newName={inviteEmail}
                    setNewName={setInviteEmail}
                    title="Invite to Room"
                    description="Enter a email of user."
                    hint="email"
                    submitButtonTitle="Invite"
                />
            )}
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
        paddingBottom: 20,
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
        flexShrink: 1, // allow text to shrink if needed
        flexWrap: 'wrap', // enables word wrapping
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


    shareContainer: {

        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 5,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
})


function saveInviteToStorage(inviteId: string) {
    AsyncStorage.getItem('invites')
        .then((data) => {
            const existingInvites: string[] = data ? JSON.parse(data) : [];
            existingInvites.push(inviteId);
            return AsyncStorage.setItem('invites', JSON.stringify(existingInvites));
        })
        .catch((error) => console.error('Error saving invite:', error));
}

function getInvitesFromStorage(): Promise<string[]> {
    return AsyncStorage.getItem('invites')
        .then((data) => {
            return data ? JSON.parse(data) : [];
        })
        .catch((error) => {
            console.error('Error fetching invites from storage:', error);
            return [];
        });
}