import { screen, within } from "@testing-library/react"
import { AppStore } from "../app/store"


const getPanel =  () => screen.queryByLabelText('chat-control')
const getApplyInput = () => screen.queryByLabelText('apply-input')
const getCreateBtn = () => within(getApplyInput()!).getByText(/Create/)
const getCloseControlsBtn = () => screen.queryByLabelText('close-controls')
const getNameField = () => screen.queryByLabelText('chat-control-name-field')
const getMembershipDiv = () => within(getPanel()!).queryByLabelText('membership')

export const ChatControlGetters = {
    getPanel,
    getNameField,
    getApplyInput,
    getCreateBtn,
    getCloseControlsBtn,
    getMembershipDiv,
}



const getChatList = () => screen.queryByLabelText('chat-list')
const getNewGroupBtn = () => within(getChatList()!).queryByLabelText('new-group-btn')

export const ChatListGetters = {
    getChatList, getNewGroupBtn
}

const getAllUsers = (store: AppStore) => Object.values(store.getState().users.users)
const getInGroup = (store: AppStore) => store.getState().group.inGroup

export const StoreGetters = {
    getAllUsers, getInGroup
}