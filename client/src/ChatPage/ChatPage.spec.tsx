import { describe, test, expect } from "vitest";
import { render, screen, waitFor } from '@testing-library/react'
import { getSocketServer } from "../utils/getSocketServer";
import { Server } from "socket.io";
import { AppStore, createStore } from "../app/store";
import { getState } from "../utils/getState";
import { Provider } from "react-redux";
import { ChatPage } from "./ChatPage";

describe('ChatPage', () => {
    let io: Server
    let store: AppStore

    beforeAll(() => {
        io = getSocketServer()
        io.on('connection', socket => {

        })

        store = createStore(getState(), true)

        render(<Provider store={store}><ChatPage /></Provider>)

    })

    afterAll(() => io.close())

    test('connection check', async () => {
        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())
    })

    return

    test('init load', async() => {
        throwNotImplemented()
    })

    test('user selects chat 1', async () => {
        throwNotImplemented()
    })

    test('user types message to chat 1', async () => {
        throwNotImplemented()
    })

    test('user sends message to chat 1', async () => {
        throwNotImplemented()
    })

    test('other types a message to chat 1', async () => {
        throwNotImplemented()
    })   

    test('other sends a message to chat 2', async () => {
        throwNotImplemented()
    })

    test('user pins chat 1', async () => {
        throwNotImplemented()
    })

    test('user unpins chat 1', async () => {
        throwNotImplemented()
    })



})

function throwNotImplemented(): void{
    throw new Error('not implemented')
}