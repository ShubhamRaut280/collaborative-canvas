import Invite from "@/app/lib/models/Invite";
import { createSlice } from "@reduxjs/toolkit";



interface InviteState{
    invites: Invite[];
    loading: boolean;
}
const initialState: InviteState = {
    invites: [],
    loading: true,
};


export const inviteSlice = createSlice({
    name: 'invites',
    initialState,
    reducers: {
        setInvites: (state, action) => {
            state.invites = action.payload;
            state.loading = false;
        },
        addInvite: (state, action) => {
            state.invites.push(action.payload);
        },
    },
});


export const { setInvites, addInvite } = inviteSlice.actions;
export default inviteSlice.reducer;