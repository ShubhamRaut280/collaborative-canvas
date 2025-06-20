import { configureStore } from '@reduxjs/toolkit';
import roomReducer from '../slice/roomSlice';
import canvasReducer from '../slice/canvasSlice';

export const store = configureStore({
  reducer: {
    rooms: roomReducer,
    canvas: canvasReducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }), // useful for Firebase objects
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
