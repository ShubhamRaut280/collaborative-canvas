import CanvasFile from '@/app/lib/models/CanvasFile';
import { Room } from '@/app/lib/models/Room';
import { auth, firestore, rdb } from '@/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { setCanvasFiles, setLoading as setCanvasFilesLoading } from '../slice/canvasSlice';
import { setLoading as setRoomLoading, setRooms } from '../slice/roomSlice';
import { AppDispatch } from '../store/store';
import { onValue, ref } from 'firebase/database';
import Invite from '@/app/lib/models/Invite';
import { setInvites } from '../slice/inviteSlice';
import { showNotification } from '@/app/lib/notifications/ShowNotifications';

export const subscribeToRooms = () => (dispatch: AppDispatch) => {
  dispatch(setRoomLoading(true));
  return onSnapshot(collection(firestore, 'rooms'), snapshot => {
    const rooms: Room[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Room[];

    const filtered = rooms.filter(room =>
      room.creator === auth.currentUser?.displayName ||
      room.members.some(member => member.id === auth.currentUser?.uid)
    );

    dispatch(setRooms(filtered));
    dispatch(setRoomLoading(false));
  });
};

export const subscribeToCanvasFiles = () => (dispatch: AppDispatch) => {
  dispatch(setCanvasFilesLoading(true));
  return onSnapshot(collection(firestore, 'canvasFiles'), snapshot => {
    const files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CanvasFile[];
    const filteredFiles = files.filter(file => file.creator === auth.currentUser?.displayName);
    dispatch(setCanvasFiles(filteredFiles));
    dispatch(setCanvasFilesLoading(false));
  });
};


export const subscribeToInvites = () => (dispatch: AppDispatch) => {

  const email = auth.currentUser?.email;
  if (!email) {
    return () => { };
  }
  return onValue(ref(rdb, '/invites'), snapshot => {
    const data = snapshot.val();
    if (!data) {
      return;
    }
    const invites: Invite[] = Object.entries(data)
      .map(([key, value]: [string, any]) => ({
        id: key,
        ...value,
      }))
      .filter(invite => invite.sender === email || invite.receiver === email);

    dispatch(setInvites(invites));

    invites.map(invite => {
      if( invite.receiver === email && invite.status === 'pending') {
        showNotification("Room Joining Invitation", `You have been invited to join ${invite.roomName}`)
      }else if( invite.sender === email && invite.status === 'accepted') {
        showNotification("Invitation Accepted", `Your invitation to join ${invite.roomName} has been accepted by ${invite.receiver}`)
      }else if( invite.sender === email && invite.status === 'declined') {
        showNotification("Invitation Declined", `Your invitation to join ${invite.roomName} has been declined by ${invite.receiver}`)
      }
    });
  });
};

