import { onSnapshot, collection } from 'firebase/firestore';
import { firestore, auth } from '@/firebaseConfig';
import { AppDispatch } from '../store/store';
import { setRooms, setLoading } from '../slice/roomSlice';
import { Room } from '@/app/models/Room';

export const subscribeToRooms = () => (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
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
  });
};
