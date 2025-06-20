import CanvasFile from "@/app/models/CanvasFile";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface CanvasState {
    canvasFiles: CanvasFile[];
    loading: boolean;
}

const initialState : CanvasState = {
    canvasFiles: [],
    loading: true,
}

export const canvasSlice = createSlice({
    name: 'canvasFiles',
    initialState,
    reducers: {
        setCanvasFiles: (state, action: PayloadAction<CanvasFile[]>) => {
            state.canvasFiles = action.payload;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    }
});

export const { setCanvasFiles, setLoading } = canvasSlice.actions;
export default canvasSlice.reducer;


