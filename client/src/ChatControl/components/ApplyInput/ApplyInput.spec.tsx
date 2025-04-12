import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRState } from "../../../utils/getState";
import { createStore, RootState } from "../../../app/store";
import { Provider } from "react-redux";
import { ApplyInput } from "./ApplyInput";
import { getSocketServer } from "../../../utils/getSocketServer";
import { GroupDelete, GroupLeaving } from "../../slice";

describe('ApplyInput', () => {
    
    const renderInput = (state: RootState) => render(<Provider store={createStore(state)}><ApplyInput /></Provider>)

    test('when chat is dm', () => {
        const { state } = useRState()
        state.group.isGroup = false
        renderInput(state)
        expect(screen.getByText(/Ok/)).toBeInTheDocument()
    })

    test('user creates the group', async () => {
        const { state } = useRState()
        state.group = { ...state.group, state: 'onCreate'}
        renderInput(state)
        expect(screen.getByText(/Create/)).toBeInTheDocument()
    })

    test('when chat is an existing group, but user is not an admin', () => {
        const { state } = useRState()
        state.group = { ...state.group, isAdmin: false, isGroup: true, state: 'onUpdate'}
        renderInput(state)
        expect(screen.getByText(/Leave/)).toBeInTheDocument()
        expect(screen.getByText(/Ok/)).toBeInTheDocument()
        expect(screen.queryByText(/Delete/)).not.toBeInTheDocument()
    })

    test('user manages the group', async () => {
        const { state } = useRState()
        state.group = { ...state.group, state: 'onUpdate', isGroup: true, isAdmin: true }
        renderInput(state)
        expect(screen.getByText(/Leave/)).toBeInTheDocument()
        expect(screen.getByText(/Ok/)).toBeInTheDocument()
        expect(screen.queryByText(/Delete/)).toBeInTheDocument()
    })

    test('user leaves the group', async () => {
        const { state, makeUser, addChat } = useRState()
        const userId = makeUser()
        const chatId = addChat()
        state.group = { ... state.group, isAdmin: false, isGroup: true, state: 'onUpdate'}
        const io = getSocketServer() 
        io.on('connection', socket => {
            socket.on('leave', (req: GroupLeaving) => {
                expect(req.chatId).toEqual(chatId)
                expect(req.userId).toEqual(userId)
                expect(req.actor).toEqual(userId)
                socket.emit('handleLeave', req)
            })
        })

        const store = createStore(state, true)
        render(<Provider store={store}><ApplyInput /></Provider>)

        const leaveBtn = screen.getByText(/Leave/)
        expect(leaveBtn).toBeInTheDocument()

        fireEvent.click(leaveBtn)

        await waitFor(() => state.group.state === 'idle')
        io.close()
    })

    test('user deletes the group', async () => {
        const { state, makeUser, addChat } = useRState()
        const userId = makeUser()
        const chatId = addChat()
        state.group = { ... state.group, isAdmin: true, isGroup: true, state: 'onUpdate'}

        const io = getSocketServer() 
        io.on('connection', socket => {
            socket.on('leave', (req: GroupDelete) => {
                expect(req.chatId).toEqual(chatId)
                expect(req.actor).toEqual(userId)
                socket.emit('handleLeave', req)
            })
        })

        const store = createStore(state, true)
        render(<Provider store={store}><ApplyInput /></Provider>)

        const deleteBtn = screen.getByText(/Delete/)
        expect(deleteBtn).toBeInTheDocument()

        fireEvent.click(deleteBtn)

        await waitFor(() => store.getState().group.state === 'idle')
        io.close()
    })
})