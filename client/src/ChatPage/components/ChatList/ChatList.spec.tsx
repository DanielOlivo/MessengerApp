import { act } from 'react'
import { v4 as uuid } from "uuid";
import { describe, test, expect } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createStore } from "../../../app/store";
import { getState } from "../../../utils/getState";
import { Provider } from "react-redux";
import { ChatList } from "./ChatList";
import { getSocketServer } from "../../../utils/getSocketServer";
import { wait } from "../../../utils/wait";
import { ChatPinStatus, UserInfo } from '@shared/Types'
import { faker } from "@faker-js/faker";
import { Commands } from 'shared/src/MiddlewareCommands';
import userEvent from '@testing-library/user-event';
import { UnseenCount } from './components/UnseenCount';
import { UserInfoCollection } from 'shared/src/UserInfo';
// import { Commands } from "shared/src/MiddlewareCommands";

describe('ChatList', () => {

    let io: ReturnType<typeof getSocketServer>

    afterEach(() => {
        if(io){
            cleanup()
            io.close()
        }
    })

    test('render', () => {
        const { state, makeUser, addChat } = getState()
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
        io = getSocketServer()

        io.on('connection', socket => {
            let pinned = false

            socket.on(Commands.TogglePinReq, chatId => {
                pinned = !pinned
                const res: ChatPinStatus = {
                    chatId, pinned
                }
                socket.emit(Commands.TogglePinRes, res)
            })
        })

        const { state, addChat } = getState()
        const { chatId } = addChat()
        const chatInfo = state.chat.chatInfo[chatId]

        const store = createStore(state, true)
        const user = userEvent.setup()

        render(<Provider store={store}><ChatList /></Provider>)

        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())

        let item = screen.getByText(new RegExp(chatInfo.name, 'i'))
        expect(item).toBeInTheDocument()

        await user.pointer({keys: '[MouseRight]', target: item})

        let toggleBtn = screen.getByText(/Pin/)
        expect(toggleBtn).toBeInTheDocument()

        await user.click(toggleBtn)

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
    })

    // return

    test('delete chat', async() => {
        io = getSocketServer()

        const fns = {
            callMe: () => {}
        }
        const spy = vi.spyOn(fns, 'callMe')
        io.on('connection', socket => {
            socket.on(Commands.GroupDeleteReq, chatId => {
                fns.callMe()
                console.log('HEEEEEEEY')
                socket.emit(Commands.GroupDeleteRes, chatId)  
            })
        })


        const { state, addChat } = getState()
        const { chatId } = addChat()
        const chatInfo = state.chat.chatInfo[chatId]

        const store = createStore(state, true)
        const user = userEvent.setup()
        render(<Provider store={store}><ChatList /></Provider>)
        await waitFor(() => expect(store.getState().socket.isConnected))

        const item = screen.getByText(new RegExp(chatInfo.name, 'i'))
        expect(item).toBeInTheDocument()

        await user.pointer({keys: '[MouseRight]', target: item})
        const deleteBtn = screen.getByText(/Delete/)
        expect(deleteBtn).toBeInTheDocument()
        await user.click(deleteBtn)
        await wait(500) // it is necessary

        await waitFor(() => expect(spy).toHaveBeenCalled())
        await waitFor(() => expect(screen.queryByText(new RegExp(chatInfo.name, 'i'))).not.toBeInTheDocument())
    })  



    test('search', async() => {
        io = getSocketServer()
        const infos = Array.from({length: 4}, () => getRandomUserInfo())
        const collection: UserInfoCollection = Object.fromEntries(infos.map(info => [info.id, info]))

        const fns = {
            fn1: () => {},
            fn2: () => {},
            fn3: () => {}
        }

        // const spy1 = vi.spyOn(fns, 'fn1')
        // const spy2 = vi.spyOn(fns, 'fn2')
        const spy3 = vi.spyOn(fns, 'fn3')

        io.on('connection', (socket) => {

            socket.on(Commands.UsersRequest, () => {
                fns.fn1()
                socket.emit(Commands.UsersResponse, {})
            })

            socket.on(Commands.InitLoadingRequest, () => {
                fns.fn2()
                socket.emit(Commands.InitLoadingResponse, {
                    messages: {},
                    chatMessageIds: {},
                    chatInfo: {},
                    pinned: [],
                    admins: {},
                    members: {},
                    UnseenCount: {}
                })
            })

            socket.on(Commands.SearchReq, () => {
                fns.fn3()
                // console.log('.................SEARCH REQ..............')
                socket.emit(Commands.SearchRes, collection)
            })
        })

        const { state, addChat } = getState()
        addChat()
        const store = createStore(state, true)
        const user = userEvent.setup()
        render(<Provider store={store}><ChatList /></Provider>)
        await waitFor(() => expect(store.getState().socket.isConnected))

        // await wait(500)
        // await waitFor(() => expect(spy1).toHaveBeenCalled())
        // await wait(200)
        // await waitFor(() => expect(spy2).toHaveBeenCalled())

        const field = screen.getByLabelText('search-field')   
        expect(field).toBeInTheDocument()

        // console.log('========================SEARCH!!!!')
        await user.type(field, 'so')
        expect(store.getState().users.onSearch).toBeTruthy()
        await wait(500)

        await waitFor(() => expect(spy3).toHaveBeenCalled())

        await waitFor(() => expect(screen.getByText(/Search result/)).toBeInTheDocument()) 

        await waitFor(() => expect(screen.getByText(new RegExp(infos[0].name, 'i'))).toBeInTheDocument())
        for(const info of infos){
            expect(screen.getByText(info.name)).toBeInTheDocument()
        }

        fireEvent.change(field, { target: { value: ''}})

        expect(screen.queryByText(/Search result/)).not.toBeInTheDocument()

    })



    function getRandomUserInfo(): UserInfo {
        return {
            id: uuid(),
            name: faker.internet.username(),
            iconSrc: ''
        }
    }
})