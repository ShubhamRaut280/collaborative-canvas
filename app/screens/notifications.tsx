import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AcceptedInviteCard,
  DeclinedInviteCard,
  ReceiverInviteCard,
  SenderInviteCard,
} from '../components/InviteCards';
import Invite from '../lib/models/Invite';
import { auth, firestore, rdb } from '@/firebaseConfig';
import { ref, update } from '@firebase/database';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Room } from '../lib/models/Room';

const Notifications = () => {
  const { invites } = useSelector((state: RootState) => state.invites);
  const email = auth.currentUser?.email;

  const changeInvitationStatus = async (invite: Invite) => {
    try {
      const inviteRef = ref(rdb, `invites/${invite.id}`);
      await update(inviteRef, invite);
    } catch (error) {
      console.error('Error updating invite status:', error);
    }
  };

  const handleDecline = async (invite: Invite) => {
    await changeInvitationStatus({ ...invite, status: 'declined' });
  };

  const handleAccept = async (invite: Invite) => {
    await changeInvitationStatus({ ...invite, status: 'accepted' });
    await joinRoom(invite.roomcode);
  };

  const joinRoom = async (roomCode: string) => {
    const roomQuery = collection(firestore, 'rooms');
    const roomSnapshot = await getDocs(query(roomQuery, where('code', '==', roomCode)));
    if (roomSnapshot.empty) {
      return;
    }
    const roomData = roomSnapshot.docs[0].data() as Room;
    const roomId = roomSnapshot.docs[0].id;

    // Check if user is already a member
    if (roomData.members.some(member => member.id === auth.currentUser?.uid)) {
      return;
    }

    // Add user to the room
    const updatedMembers = [...roomData.members, {
      id: auth.currentUser?.uid || 'unknown',
      name: auth.currentUser?.displayName || 'Unknown User'
    }];

    await setDoc(doc(firestore, 'rooms', roomId), { ...roomData, members: updatedMembers }, { merge: true });
  };



  const filteredInvites = invites.filter((invite) =>
    (invite.receiver === email && invite.status === 'pending') ||
    (invite.sender === email)
  );

  const shownCount = filteredInvites.length;

  const renderInvite = ({ item }: { item: Invite }) => {
    const isReceiver = item.receiver == email;
    const isSender = item.sender === email;

    if (isReceiver && item.status === 'pending') {
      return (
        <ReceiverInviteCard
          invite={item}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      );
    }

    if (isSender) {
      switch (item.status) {
        case 'pending':
          return <SenderInviteCard invite={item} />;
        case 'accepted':
          return <AcceptedInviteCard invite={item} />;
        case 'declined':
          return <DeclinedInviteCard invite={item} />;
        default:
          return <></>;
      }
    }

    return <></>;
  };

  return (
    <View style={styles.container}>
      <TopNavBar />

      {shownCount === 0 && <NoNotifications />}

      <FlatList
        data={filteredInvites}
        keyExtractor={(item) => item.id}
        renderItem={renderInvite}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const NoNotifications = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="notifications-off" size={64} color="#C1C7D0" />
    </View>
    <Text style={styles.emptyTitle}>No Notifications</Text>
    <Text style={styles.emptySubtitle}>
      You&apos;re all caught up! New invitations will appear here.
    </Text>
  </View>
);

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
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
    width: 40,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
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
