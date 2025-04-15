import '@testing-library/react/dont-cleanup-after-each'

import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getSocketServer } from "../utils/getSocketServer";
import { Server } from "socket.io";
import { AppStore, createStore } from "../app/store";
import { StateHook } from "../utils/getState";
import { Provider } from "react-redux";
import { ChatPage } from "./ChatPage";
import { getState } from "../utils/getState";
import { ChatId } from 'shared/src/Types';
import { MessagePostReq } from 'shared/src/Message';

describe('ChatPage', () => {
    let io: Server
    let store: AppStore
    let hooks: StateHook
    let typedChatId: ChatId = ''
    let chatId: ChatId

    let msgPostreq: MessagePostReq

    beforeAll(() => {
        hooks = getState()
        const { state: initState, addChat } = hooks
        addChat(true)
        addChat(false)

        io = getSocketServer()
        io.on('connection', socket => {

            socket.on('requestUsers', () => {
                socket.emit('handleUsers', initState.users.users)
            })

            socket.on('initLoading', () => {
                // console.log('initLoading request-----------', initState)
                socket.emit('initLoadingRes', initState.chat)
            })

            socket.on("typing", chatId => {
                typedChatId = chatId
            })

            socket.on('msg', data => {
                msgPostreq = data
            })
        })

        const { state } = getState()
        store = createStore(state, true)

        render(<Provider store={store}><ChatPage /></Provider>)

    })

    afterAll(() => io.close())

    test('no users', () => {
        expect(Object.entries(store.getState().chat.chatInfo).length === 0).toBeTruthy()
    })

    test('connection check', async () => {
        expect(Object.keys(store.getState().users.users).length === 0).toBeTruthy()
        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())
    })

    test('init load', async() => {
        await waitFor(() => expect(Object.keys(store.getState().chat.chatInfo).length > 0).toBeTruthy())
        expect(Object.keys(store.getState().users.users).length > 0)
    })


    test('user selects chat 1', async () => {
        const { state, getChatIds } = hooks
        chatId = getChatIds()[0]
        expect(chatId).toBeDefined()
        const chatInfo = state.chat.chatInfo[chatId]
        expect(chatInfo).toBeDefined()
        console.log('chat info', chatInfo)
        screen.debug()
        const item = screen.getByText(new RegExp(chatInfo.name, 'i'))
        expect(item).toBeInTheDocument()

        fireEvent.click(item)
        expect(screen.queryAllByText(new RegExp(chatInfo.name, 'i')).length).toEqual(2)

    })

    test('user types message to chat 1', async () => {
        expect(typedChatId).toEqual('')
        const field = screen.getByLabelText('chat-input-field') 
        expect(field).toBeInTheDocument()
        fireEvent.change(field, {target: { value: 'hey'}})
        await waitFor(() => expect(typedChatId).not.toEqual(''))
    })

    test('user sends message to chat 1', async () => {
        expect(msgPostreq).toBeUndefined()

        const btn = screen.getByLabelText('chat-input-send')
        expect(btn).toBeInTheDocument()
        fireEvent.click(btn)

        await waitFor(() => expect(msgPostreq).toBeDefined())
        expect('chatId' in msgPostreq)
        expect('content' in msgPostreq)

        const { chatId: id, content } = msgPostreq
        expect(id).toEqual(chatId)
        expect(content).toEqual('hey')
    })

    test('other types a message to chat 1', async () => {
        const typing = hooks.getTying(chatId)
        const userIds = Object.keys(store.getState().users.users)
        expect(userIds.includes(typing.userId))

        io.emit('typing', typing)
        
        await waitFor(() => expect(screen.queryByText(/typing/i)).toBeInTheDocument())
    })   

    // test('other sends a message to chat 2', async () => {
    //     throwNotImplemented()
    // })

    // test('user pins chat 1', async () => {
    //     const chatInfo = store.getState().chat.chatInfo[chatId]        
    //     expect(chatInfo).toBeDefined()
    //     const item = screen.getAllByText(new RegExp(chatInfo.name, 'i'))[0]
    //     expect(item).toBeInTheDocument()

    //     const isPinned = store.getState().chat.pinned.includes(chatId)

    //     fireEvent.contextMenu(item)
    //     // screen.debug(undefined, 10000)

    //     const pattern = isPinned ? /unpin/i : /^\s*pin/i
    //     const togglePin = screen.getAllByText(pattern)[0]
    //     expect(togglePin).toBeInTheDocument()
    //     expect(screen.getAllByText(/delete/i)[0]).toBeInTheDocument()

    //     fireEvent.click(togglePin)

    // })

    // test('user unpins chat 1', async () => {
    //     throwNotImplemented()
    // })



})