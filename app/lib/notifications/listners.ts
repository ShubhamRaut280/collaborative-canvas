import { onValue, ref } from 'firebase/database';
import { auth, rdb } from '../../../firebaseConfig';
import Invite from '../models/Invite';
import { showNotification } from './ShowNotifications';

const notifiedInviteIds = new Set<string>();

function listenForInvites(): () => void {
    console.log('📡 Listening for invites...');

    const userEmail = auth.currentUser?.email;
    if (!userEmail) {
        console.warn('❌ No user logged in to listen for invites.');
        return () => { };
    }

    const invitesRef = ref(rdb, '/invites');

    const unsubscribe = onValue(invitesRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            console.log('📭 No invites found.');
            return;
        }

        const invites: Invite[] = Object.entries(data)
            .map(([key, value]: [string, any]) => ({
                id: key,
                ...value,
            }))
            .filter(invite => invite.email === userEmail && invite.status === 'pending');

        if (invites.length === 0) {
            console.log('📭 No pending invites.');
        } else {
            console.log(`📨 Found ${invites.length} pending invites for ${userEmail}`);
        }

        invites.forEach(invite => {
            if (!notifiedInviteIds.has(invite.id)) {
                showNotification(
                    'Room Joining Invite',
                    `You are invited to join ${invite.roomName}`
                );
                notifiedInviteIds.add(invite.id);
            }
        });
    });

    return () => {
        console.log('🛑 Stopped listening for invites');
        unsubscribe();
    };
}

export { listenForInvites };
