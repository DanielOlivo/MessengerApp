import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GroupMember, GroupReq, ContactItem, NewGroupReq } from "@shared/Types";
import { UserId, ChatId } from "@shared/Types";


export interface GroupControlState {
    isOn: boolean
    members: GroupMember[]
    chatId?: ChatId
}

const initialState: GroupControlState = {
    isOn: false,
    members: []
}

export const groupSlice = createSlice({
    name: 'group',
    initialState, 
    reducers: {
        createGroup: (state, action: PayloadAction<NewGroupReq>) => {},
        editGroup: (state, action: PayloadAction<GroupReq>) => {},
        removeGroup: (state, action: PayloadAction<ChatId>) => {} ,

        include: (state, action: PayloadAction<UserId>) => {
            const item = state.members.find(i => i.id == action.payload)
            item!.isMember = true
        },
        exclude: (state, action: PayloadAction<UserId>) => {
            const item = state.members.find(i => i.id == action.payload)
            item!.isMember = false
        },

        openGroupControl: (state) => {
            state.isOn = true
        },
        closeGroupControl: (state) => {
            state.isOn = false
        },

        reqContacts: (state) => {},
        setContacts: (state, action: PayloadAction<ContactItem[]>) => {
            state.members = action.payload.map(item => {return {...item, isMember: false}})
        }
    }
})

export const {createGroup, editGroup, removeGroup, include, exclude,
        openGroupControl, closeGroupControl, reqContacts, setContacts
} = groupSlice.actions
export default groupSlice.reducer