import { screen, within } from "@testing-library/react"

const getPanel =  () => screen.queryByLabelText('chat-control')
const getApplyInput = () => screen.queryByLabelText('apply-input')
const getCreateBtn = () => within(getApplyInput()!).getByText(/Create/)
const getCloseControlsBtn = () => screen.queryByLabelText('close-controls')

export const ChatControlGetters = {
    getPanel,
    getNameField: () => screen.queryByLabelText('chat-control-name-field'),
    getApplyInput,
    getCreateBtn,
    getCloseControlsBtn
}