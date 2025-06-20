import { Room } from '@/app/models/Room';
import { createSlice } from '@reduxjs/toolkit';



export const roomsSlice = createSlice({
  name: 'rooms',
    initialState: {
        rooms: [] as Room[],
        currentRoom: null as Room | null,
    },
    reducers: {
        setRooms: (state, action) => {
            state.rooms = action.payload;
        },
        setCurrentRoom: (state, action) => {
            state.currentRoom = action.payload;
        },
    },
});

export const { setRooms, setCurrentRoom } = roomsSlice.actions;

export default roomsSlice.reducer;
