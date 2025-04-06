import '@testing-library/react/dont-cleanup-after-each'

import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getSocketServer } from "../utils/getSocketServer";
import { Server } from "socket.io";
import { AppStore, createStore } from "../app/store";
import { getEmpty, getState, makeChatWithUser, makeUser, StateHook } from "../utils/getState";
import { Provider } from "react-redux";
import { ChatPage } from "./ChatPage";
import { useRState } from "../utils/getState";
import { ChatId } from "shared/src/Types";

describe('ChatPage', () => {
    let io: Server
    let store: AppStore
    let hooks: StateHook


    beforeAll(() => {
        hooks = useRState()
        const { state: initState, addChat, getChatIds } = hooks
        addChat(true)
        addChat(false)

        io = getSocketServer()
        io.on('connection', socket => {
            socket.on('initLoading', () => {
                // console.log('initLoading request-----------', initState)
                socket.emit('initLoadingRes', initState.chat)
            })
        })

        const { state } = useRState()
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
    })


    test('user selects chat 1', async () => {
        const { state, getChatIds } = hooks
        const chatId = getChatIds()[0]
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
        
        throwNotImplemented()
    })

    // test('user sends message to chat 1', async () => {
    //     throwNotImplemented()
    // })

    // test('other types a message to chat 1', async () => {
    //     throwNotImplemented()
    // })   

    // test('other sends a message to chat 2', async () => {
    //     throwNotImplemented()
    // })

    // test('user pins chat 1', async () => {
    //     throwNotImplemented()
    // })

    // test('user unpins chat 1', async () => {
    //     throwNotImplemented()
    // })



})

function throwNotImplemented(): void{
    throw new Error('not implemented')
}