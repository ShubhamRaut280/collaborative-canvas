import { onValue, ref } from 'firebase/database';
import { auth, rdb } from '../../../firebaseConfig'; // your Firebase config
import Invite from '../models/Invite';
import { showNotification } from './ShowNotifications';

function listenForInvites() {

    console.log('Listening for invites...');

    const userEmail = auth.currentUser?.email;
    if (!userEmail) {
        return;
    }
    const invitesRef = ref(rdb, '/invite');

    onValue(invitesRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const invites: Invite[] = Object.keys(data)
            .map(key => ({
                id: key,
                ...data[key],
            }))
            .filter(invite => invite.email === userEmail && invite.status === 'pending');

        if (invites.length === 0) {
            console.log('No pending invites found.');
        }
        console.log(`Found ${invites.length} pending invites for ${userEmail}`);

        invites.forEach(invite => {
            showNotification(
                "Room Joining Invite",
                `You are invited to join ${invite.roomName}`
            );
        });
    });
}


export { listenForInvites }