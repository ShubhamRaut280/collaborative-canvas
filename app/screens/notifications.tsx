import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Invite from '../lib/models/Invite';
import { getPendingInvites } from '../lib/notifications/listners';
import { rdb } from '@/firebaseConfig';
import { ref, set, update } from '@firebase/database';

const Notifications = () => {
    const [notifications, setNotifications] = useState<Invite[]>([]);

    useEffect(() => {
        (async () => {
            const invites = await getPendingInvites();
            if (invites.length > 0) {
                setNotifications(invites);
            }
        })();
    }, [notifications.length]);

    const handleAccept = async (invite: Invite) => {
        invite.status = 'accepted';
        await changeInvitationStatus(invite);
        setNotifications(prev => prev.filter(item => item.id !== invite.id));
    };

    const changeInvitationStatus = async (invite: Invite) => {
        // Update the status of the invite in Firebase Realtime Database
        try {
            const inviteRef = ref(rdb, `invites/${invite.id}`);
            await update(inviteRef, invite)

        } catch (error) {
            console.error('Error updating invite status:', error);
        }
    }

    const handleDecline = async (invite: Invite) => {
        invite.status = 'declined';
        await changeInvitationStatus(invite);

        setNotifications(prev => prev.filter(item => item.id !== invite.id));
    };

    function renderInvite({ item: invite }: { item: Invite }): React.ReactElement {
        return (
            <View style={styles.inviteCard}>
                <View style={styles.inviteHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="people" size={24} color="#4F8EF7" />
                    </View>
                    <View style={styles.inviteInfo}>
                        <Text style={styles.inviteTitle}>Room Invitation</Text>
                        <Text style={styles.inviteSubtitle}>
                            You're invited to join
                        </Text>
                    </View>
                </View>

                <View style={styles.roomContainer}>
                    <Text style={styles.roomName}>{invite.roomName}</Text>
                    <Text style={styles.roomCode}>Room Code: {invite.roomcode}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDecline(invite)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(invite)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TopNavBar />
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderInvite}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="notifications-off" size={64} color="#C1C7D0" />
                        </View>
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptySubtitle}>
                            You're all caught up! New invitations will appear here.
                        </Text>
                    </View>
                }
            />
        </View>
    )
}

const TopNavBar = () => {
    const router = useRouter();

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Notifications</Text>

                <View style={styles.headerRight} />
            </View>
        </>
    )
}

export default Notifications

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Header Styles
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 60,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F4',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    headerRight: {
        width: 40, // Balance the layout
    },

    // List Styles
    listContainer: {
        padding: 20,
        paddingBottom: 40,
    },

    // Invite Card Styles
    inviteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F3F4',
    },
    inviteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EBF4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    inviteInfo: {
        flex: 1,
    },
    inviteTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    inviteSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },

    // Room Info Styles
    roomContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeft: 4,
        borderLeftColor: '#4F8EF7',
    },
    roomName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    roomCode: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'monospace',
    },

    // Button Styles
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#4F8EF7',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4F8EF7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    declineButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    declineButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },

    // Empty State Styles
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
});