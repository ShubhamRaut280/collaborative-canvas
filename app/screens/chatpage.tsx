import DrawingCanvas from '@/components/DrawingCanvas'
import FloatingTabSwitch from '@/components/FloatingTabSwitch'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Room } from '../models/Room'


const canvasBackgroundColor = "#fff";

export default function ChatPage() {
    const { id, data } = useLocalSearchParams();
    const roomDetails = data ? JSON.parse(data as string) as Room : null;
    const [activeTab, setActiveTab] = useState<'canvas' | 'chat'>('canvas');
    const [hasUnread, setHasUnread] = useState(true); // simulate red dot

    const router = useRouter();


    return (

        <SafeAreaView style={{ flex: 1 }}>

        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{roomDetails?.name || 'Canvas'}</Text>
            </View>



            <View style={{ flex: 1, backgroundColor: canvasBackgroundColor }}>
                {activeTab === 'canvas' ? (
                    <DrawingCanvas
                        id={roomDetails?.id || id as string}
                        name={roomDetails?.name || 'Canvas'}
                        isRoom={true}
                    />

                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>Chat feature coming soon!</Text>
                )}
            </View>


            <FloatingTabSwitch
                onTabChange={(tab) => {
                    setActiveTab(tab);
                    if (tab === 'chat') {
                        setHasUnread(false); // clear red dot when switching to chat
                    }
                }}
                hasUnread={hasUnread}
            />

            {shareMessage(roomDetails?.code || '')}
        </View>
        </SafeAreaView>
    );
}

const shareMessage = (code: string) => {
    return <View style={styles.shareMsg}>
        <Text style={styles.shareText}>Use </Text>
        <Text style={{ fontWeight: 'bold' }}>{code}</Text>
        <Text style={styles.shareText}> code to invite others</Text>
    </View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: canvasBackgroundColor,
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
    icon: {
        fontSize: 40,
        textAlign: "center",
        marginHorizontal: 5,
    },
    paletteColor: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginVertical: 5,
        zIndex: 2,
    },
    swatch: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: "black",
        marginVertical: 5,
        zIndex: 1,
    },
    swatchContainer: {
        flexDirection: "row",
        flex: 0,
        padding: 10,
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    thicknessDropdownContainer: {
        marginLeft: 10,
        position: 'relative',
    },
    thicknessDropdownButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        minWidth: 60,
        alignItems: 'center',
    },
    thicknessDropdownText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    thicknessDropdownList: {
        position: 'absolute',
        top: 40,
        left: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 10,
        minWidth: 60,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    thicknessDropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    thicknessDropdownItemSelected: {
        backgroundColor: '#e6f0ff',
    },
    thicknessDropdownItemText: {
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
    },
    paletteDialog: {
        position: 'absolute',
        top: 120, // adjust as needed
        left: 20, // adjust as needed
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        zIndex: 100,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
});
