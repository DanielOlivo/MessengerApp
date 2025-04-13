import '@testing-library/react/dont-cleanup-after-each'

import { v4 as uuid } from 'uuid'
import { faker } from '@faker-js/faker';
import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AppStore, createStore, RootState } from './app/store';
import { useRState } from './utils/getState';
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ChatId, Credentials, UserAuthData } from 'shared/src/Types';
import { initSocket } from './features/socket/socketSlice';
import { getSocketServer } from './utils/getSocketServer';
import { Message, MessagePostReq } from 'shared/src/Message';
import dayjs from 'dayjs';


describe('App', () => {

    const baseUrl = import.meta.env.VITE__BASE_URL
    const loginResponse: UserAuthData = {
        id: uuid(),
        username: faker.internet.username(),
        token: 'token'
    }

    let clientState: RootState 
    let clientStore: AppStore

    const { state: serverState, addChat } = useRState()
    const otherChats = [
        addChat(false),
        addChat(false),
        addChat(true)
    ]
    const chatInfos = otherChats.map(ids => serverState.chat.chatInfo[ids.chatId])

    const getUsernameField = () => screen.getByLabelText('username-field')
    const getPasswordField = () => screen.getByLabelText('password-field')
    const getSwitchButton = () => screen.getByLabelText('switch-button')

    const getPinnedLabel = () => screen.getByText(/Pinned/)
    const getAllLabel = () => screen.getByText(/All/)

    const getChatInputField = () => screen.getByLabelText('chat-input-field')
    const getChatInputSend = () => screen.getByLabelText('chat-input-send')

    const getMessageCount = (chatId: ChatId) => clientStore.getState().chat.chatMessageIds[chatId].length

    const loginUrl = new URL('/api/user/login', baseUrl).href
    const handlers = [
        http.post(loginUrl, async ({request}) => {
            console.log('HEEELOO')
            const data = await request.json() as Credentials
            expect(data.username).toEqual('username')
            expect(data.password).toEqual('password')
            
            return HttpResponse.json(loginResponse)
        }) 
    ]

    const server = setupServer(...handlers)
    const io = getSocketServer()

    io.on('connect', socket => {
        socket.on('requestUsers', () => {
            socket.emit('handleUsers', serverState.users.users)
        })

        socket.on('initLoading', () => {
            socket.emit('initLoadingRes', serverState.chat)
        })

        socket.on('msg', (req: MessagePostReq) => {
            const { chatId, content } = req
            const res: Message = {
                chatId, content,
                sender: loginResponse.id,
                timestamp: dayjs().valueOf(),
                messageId: uuid()
            } 

            serverState.chat.chatMessageIds[chatId].unshift(res.messageId)
            serverState.chat.messages[res.messageId] = res
            socket.emit('msgRes', res)
        })
    })

    beforeAll(() => {
        server.listen()

        const { state } = useRState()
        clientState = state

        clientStore = createStore(clientState) 

        render(
            <BrowserRouter>
                <Provider store={clientStore}>
                    <App />
                </Provider>
            </BrowserRouter>
        )
    })

    afterAll(() => {
        // server.close()
        io.close()
    })

    test('start with Auth page', () => {
        const header = screen.queryByText(/Messenger App/)
        expect(header).toBeInTheDocument()
    })

    test('Auth: on login', async () => {
        const loginHeader = screen.queryByText(/Login/)
        expect(loginHeader).toBeInTheDocument()
    })

    test('Auth: contains username and passord field', () => {
        const usernameField = getUsernameField()
        const passwordField = getPasswordField()
        expect(usernameField).toBeInTheDocument()
        expect(passwordField).toBeInTheDocument()

    })

    test('Auth: contains switch button', () => {
        const btn = getSwitchButton()
        expect(btn).toBeInTheDocument()
    })

    test('Auth: switch to register', () => {
        const btn = getSwitchButton()
        fireEvent.click(btn)

        const header = screen.getByText(/Register/)
        expect(header).toBeInTheDocument()
    })

    test('Auth: switch back to Login', () => {
        const btn = getSwitchButton()
        expect(btn).toBeInTheDocument()
        fireEvent.click(btn)
        const header = screen.getByText(/Login/)
        expect(header).toBeInTheDocument()
    })

    test('start socket', async () => {
        expect(clientStore.getState().socket.isConnected).toBeFalsy()
        clientStore.dispatch(initSocket())
        await waitFor(() => expect(clientStore.getState().socket.isConnected).toBeTruthy())
    })

    test('Auth: login to account', async () => {
        server.listen()
        const usernameField = getUsernameField()
        const passwordField = getPasswordField()
        const submitBtn = screen.getByLabelText('submit-button')
        expect(submitBtn).toBeInTheDocument()

        fireEvent.change(usernameField, { target: { value: 'username'}})
        fireEvent.change(passwordField, { target: { value: 'password'}})
        fireEvent.click(submitBtn)

        await waitFor(() => expect(screen.queryByText(/Login/)).not.toBeInTheDocument())
        server.close()
    }) 

    test('ChatList, chat list loaded', async () => {
        await waitFor(() => expect(getAllLabel()).toBeInTheDocument())
        expect(getPinnedLabel()).toBeInTheDocument()

        for(const chatInfo of chatInfos){
            expect(screen.getByText(new RegExp(chatInfo.name))).toBeInTheDocument()
        }
    }) 

    test('select all chat one by one and check messages', () => {
        for(let i = 0; i < otherChats.length; i++){
            const { chatId } = otherChats[i]
            const chatInfo = serverState.chat.chatInfo[chatId]
            const item = screen.getByText(new RegExp(chatInfo.name))

            fireEvent.click(item)

            expect(clientStore.getState().chat.displayedChatId).toEqual(chatId)
            expect(screen.getAllByText(new RegExp(chatInfo.name)).length).toEqual(2)

            const messageIds = serverState.chat.chatMessageIds[chatId]

            for(const msgId of messageIds){
                const message = serverState.chat.messages[msgId]
                expect(screen.getAllByText(new RegExp(message.content)).length > 0).toBeTruthy()
            }
        }
    })

    test('select chat and send message', async () => {
        const { chatId } = otherChats[0]
        const chatInfo = serverState.chat.chatInfo[chatId]

        const item = screen.getAllByText(new RegExp(chatInfo.name))[0]  
        fireEvent.click(item)

        const field = getChatInputField()
        const btn = getChatInputSend()
        expect(field).toBeInTheDocument()
        expect(btn).toBeInTheDocument()

        
        const count1 = getMessageCount(chatId)
        
        const newMessageContent = faker.lorem.sentence()
        fireEvent.change(field, { target: { value: newMessageContent }})
        fireEvent.click(btn)

        
        await waitFor(() => expect(getMessageCount(chatId) - count1).toEqual(1))

        // to be displayed both at chat view and chat item, as it is a last message
        expect(screen.getAllByText(new RegExp(newMessageContent)).length === 2).toBeTruthy()
    })  
})