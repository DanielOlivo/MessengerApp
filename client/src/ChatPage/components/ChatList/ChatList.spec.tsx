import { act } from 'react'
import { v4 as uuid } from "uuid";
import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createStore } from "../../../app/store";
import { useRState } from "../../../utils/getState";
import { Provider } from "react-redux";
import { ChatList } from "./ChatList";
import { getSocketServer } from "../../../utils/getSocketServer";
import { wait } from "../../../utils/wait";
import { UserInfo } from '@shared/Types'
import { faker } from "@faker-js/faker";
// import { Commands } from "shared/src/MiddlewareCommands";

describe('ChatList', () => {

    test('render', () => {
        const { state, makeUser, addChat } = useRState()
        makeUser()
        const { chatId: id1 } = addChat(true)
        const { chatId: id2 } = addChat(false)

        const store = createStore(state)
        render(<Provider store={store}><ChatList /></Provider>)

        expect(screen.queryAllByText(/all/i)[0]).toBeInTheDocument()
        expect(screen.queryByText(/pinned/i)).toBeInTheDocument()
        expect(screen.queryByText(new RegExp(state.chat.chatInfo[id1].name, 'i'))).toBeInTheDocument()
        expect(screen.queryByText(new RegExp(state.chat.chatInfo[id2].name, 'i'))).toBeInTheDocument()
    })

    test('pin/unpin', async () => {
        const io = getSocketServer()

        io.on('connection', socket => {
            let pinned = false

            socket.on('togglePin', chatId => {
                pinned = !pinned
                socket.emit('handleToggle', {chatId, pinned})
            })
        })

        const { state, addChat } = useRState()
        const { chatId } = addChat()
        const chatInfo = state.chat.chatInfo[chatId]

        const store = createStore(state, true)
        render(<Provider store={store}><ChatList /></Provider>)

        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())

        let item = screen.getByText(new RegExp(chatInfo.name, 'i'))
        expect(item).toBeInTheDocument()

        fireEvent.contextMenu(item)

        let toggleBtn = screen.getByText(/Pin/)
        expect(toggleBtn).toBeInTheDocument()

        fireEvent.click(toggleBtn)

        await waitFor(() => expect(screen.queryByText(/pinned/i)).toBeInTheDocument())

        item = screen.getByText(new RegExp(chatInfo.name, 'i'))
        expect(item).toBeInTheDocument()

        fireEvent.contextMenu(item)
        toggleBtn = screen.getByText(/Unpin/)
        expect(toggleBtn).toBeInTheDocument()
        fireEvent.click(toggleBtn)

        await waitFor(() => expect(screen.queryByText(/Pinned/)).not.toBeInTheDocument())
        expect(screen.queryByText(/Delete/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Unpin/)).not.toBeInTheDocument()

        io.close()
    })


    test('delete chat', async() => {
        const io = getSocketServer()

        io.on('connection', socket => {
            socket.on('deleteChat', chatId => {
                socket.emit('handleChatDeletion', chatId)  
            })
        })

        const { state, addChat } = useRState()
        const { chatId } = addChat()
        const chatInfo = state.chat.chatInfo[chatId]

        const store = createStore(state, true)
        await act(() => render(<Provider store={store}><ChatList /></Provider>))
        // await wait(100)
        await waitFor(() => expect(store.getState().socket.isConnected))

        const item = screen.getByText(new RegExp(chatInfo.name, 'i'))
        expect(item).toBeInTheDocument()

        await act(() => fireEvent.contextMenu(item))
        const deleteBtn = screen.getByText(/Delete/)
        expect(deleteBtn).toBeInTheDocument()
        await act(() => fireEvent.click(deleteBtn))
        await wait(200)

        await waitFor(() => expect(screen.queryByText(new RegExp(chatInfo.name, 'i'))).not.toBeInTheDocument())

        io.close()
    })  

    test('search', async() => {
        const io = getSocketServer()
        const infos = Array.from({length: 4}, () => getRandomUserInfo())
        const collection = Object.fromEntries(infos.map(info => [info.id, info]))

        io.on('connection', (socket) => {
            socket.on('search', (term) => {
                socket.emit('handleSearch', collection)
            })
        })

        const { state } = useRState()
        const store = createStore(state, true)
        render(<Provider store={store}><ChatList /></Provider>)
        await waitFor(() => expect(store.getState().socket.isConnected))

        const field = screen.getByLabelText('search-field')   
        expect(field).toBeInTheDocument()

        fireEvent.change(field, {target: { value: 'sometherm'}})

        await waitFor(() => expect(screen.getByText(/Search result/)).toBeInTheDocument()) 

        await waitFor(() => expect(screen.getByText(new RegExp(infos[0].name, 'i'))).toBeInTheDocument())
        for(const info of infos){
            expect(screen.getByText(info.name)).toBeInTheDocument()
        }

        fireEvent.change(field, { target: { value: ''}})

        expect(screen.queryByText(/Search result/)).not.toBeInTheDocument()

        io.close()
    })

    function getRandomUserInfo(): UserInfo {
        return {
            id: uuid(),
            name: faker.internet.username(),
            iconSrc: ''
        }
    }
})