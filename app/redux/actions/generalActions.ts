import CanvasFile from '@/app/lib/models/CanvasFile';
import { Room } from '@/app/lib/models/Room';
import { auth, firestore } from '@/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { setCanvasFiles, setLoading as setCanvasFilesLoading } from '../slice/canvasSlice';
import { setLoading as setRoomLoading, setRooms } from '../slice/roomSlice';
import { AppDispatch } from '../store/store';

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
