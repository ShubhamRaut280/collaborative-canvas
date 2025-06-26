import { Room } from '@/app/lib/models/Room';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoomState {
  rooms: Room[];
  loading: boolean;
}

const initialState: RoomState = {
  rooms: [],
  loading: true,
};

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
});

export const { setRooms, setLoading } = roomSlice.actions;
export default roomSlice.reducer;
