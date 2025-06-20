import { onSnapshot, collection } from 'firebase/firestore';
import { firestore, auth } from '@/firebaseConfig';
import { AppDispatch } from '../store/store';
import { setRooms, setLoading as setRoomLoading } from '../slice/roomSlice';
import { setCanvasFiles, setLoading as setCanvasFilesLoading } from '../slice/canvasSlice';
import { Room } from '@/app/models/Room';
import CanvasFile from '@/app/models/CanvasFile';

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
