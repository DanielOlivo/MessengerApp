import '@testing-library/react/dont-cleanup-after-each'

import { v4 as uuid } from 'uuid'
import { faker } from '@faker-js/faker';
import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { AppStore, createStore, RootState } from './app/store';
import { useRState } from './utils/getState';
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ChatId, Credentials, UserAuthData, UserId } from 'shared/src/Types';
import { initSocket } from './features/socket/socketSlice';
import { getSocketServer } from './utils/getSocketServer';
import { Message, MessagePostReq } from 'shared/src/Message';
import dayjs from 'dayjs';
import { ChatData, handleChatSelection } from './ChatPage/slice';
import { UserInfoCollection } from './users/slice';
import { wait } from './utils/wait';
import { ChatControlGetters, ChatListGetters, StoreGetters } from './utils/testUtils';
import { GroupCreateReq, GroupCreateRes } from 'shared/src/ChatControl';
import { EditChanges } from './ChatControl/slice';
import { Commands } from 'shared/src/MiddlewareCommands';


describe('App', () => {

    const baseUrl = import.meta.env.VITE__BASE_URL
    const loginResponse: UserAuthData = {
        id: uuid(),
        username: faker.internet.username(),
        token: 'token'
    }

    let clientState: RootState 
    let clientStore: AppStore

    // let actorId: UserId // this should be held in socket data

    const { state: serverState, addChat, addContact } = useRState()
    const otherChats = [
        addChat(false),
        addChat(false),
        addChat(true)
    ]
    const chatInfos = otherChats.map(ids => serverState.chat.chatInfo[ids.chatId])
    let userIdToSearch: UserId


    const getUsernameField = () => screen.getByLabelText('username-field')
    const getPasswordField = () => screen.getByLabelText('password-field')
    const getSwitchButton = () => screen.getByLabelText('switch-button')

    const getChatList = () => screen.getByLabelText('chat-list')
    const getChatView = () => screen.getByLabelText('chat-view') 

    const getPinnedLabel = () => screen.getByText(/Pinned/)
    const getAllLabel = () => screen.getByText(/All/)

    const getChatInputField = () => screen.getByLabelText('chat-input-field')
    const getChatInputSend = () => screen.getByLabelText('chat-input-send')

    const getChatControl = () => screen.queryByLabelText('chat-control')
    // const getNameField = () => screen.queryByLabelText('chat-control-name-field') 

    const getMessageCount = (chatId: ChatId) => clientStore.getState().chat.chatMessageIds[chatId].length

    const loginUrl = new URL('/api/user/login', baseUrl).href
    const handlers = [
        http.post(loginUrl, async ({request}) => {
            const data = await request.json() as Credentials
            expect(data.username).toEqual('username')
            expect(data.password).toEqual('password')
            
            return HttpResponse.json(loginResponse)
        }) 
    ]

    const server = setupServer(...handlers)
    const io = getSocketServer()

    const emitMessage = (chatId: ChatId): Message => {
        const res: Message = {
            messageId: uuid(),
            sender: otherChats.find(({chatId: id}) => id === chatId)!.chatId,
            content: faker.lorem.word(),
            timestamp: dayjs().valueOf(),
            chatId
        }
        serverState.chat.messages[res.messageId] = res
        serverState.chat.chatMessageIds[chatId].unshift(res.messageId)
        io.emit(Commands.MessagePostRes, res)
        return res
    }

    io.on('connect', socket => {
        socket.on(Commands.UsersRequest, () => {
            socket.emit(Commands.UsersResponse, serverState.users.users)
        })

        socket.on(Commands.InitLoadingRequest, () => {
            socket.emit(Commands.InitLoadingResponse, serverState.chat)
        })

        socket.on(Commands.MessagePostReq, (req: MessagePostReq) => {
            const { chatId, content } = req
            const res: Message = {
                chatId, content,
                sender: loginResponse.id,
                timestamp: dayjs().valueOf(),
                messageId: uuid()
            } 

            serverState.chat.chatMessageIds[chatId].unshift(res.messageId)
            serverState.chat.messages[res.messageId] = res
            socket.emit(Commands.MessagePostRes, res)
        })

        socket.on(Commands.SearchReq, () => {
            userIdToSearch = addContact()
            const res: UserInfoCollection = { [userIdToSearch]: serverState.users.users[userIdToSearch] }
            // console.log('handleSearch', res)
            socket.emit(Commands.SearchRes, res)
        })

        socket.on(Commands.ChatWithUserReq, (userId) => {
            const chatId = uuid()
            const chatInfo: ChatData = {
                chatId,
                info: {
                    name: serverState.users.users[userIdToSearch].name,
                    iconSrc: '',
                    status: 'online',
                    isGroup: false
                },
                messages: {},
                chatMessageIds: { [chatId]: [] } ,
                members: [userId],
                admins: []
            }
            socket.emit(Commands.ChatWithUserRes, chatInfo)
        })

        socket.on(Commands.GroupCreateReq, (req: GroupCreateReq) => {

            const chatId = uuid()
            const timestamp = dayjs().valueOf()

            const message: Message = {
                messageId: uuid(),
                sender: '',
                content: `Chat ${req.name} was created`,
                timestamp,
                chatId
            }

            const res: GroupCreateRes = {
                ...req,
                id: chatId,
                // actor: actorId!,
                created: timestamp,
                chatMessageIds: [ message.messageId ],
                messages: { [message.messageId ]: message }
            }

            socket.emit(Commands.GroupCreateRes, res)
        })

        socket.on(Commands.GroupEditReq, (arg: EditChanges) => {
            socket.emit(Commands.GroupEditRes, arg)
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

        // actorId = clientStore.getState().auth.data.id
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
        expect(clientStore.getState().chat.displayedChatId).toEqual(chatId)
        

        const field = getChatInputField()
        const btn = getChatInputSend()
        expect(field).toBeInTheDocument()
        expect(btn).toBeInTheDocument()

        
        const count1 = getMessageCount(chatId)
        
        const newMessageContent = faker.lorem.sentence()
        fireEvent.change(field, { target: { value: newMessageContent }})
        fireEvent.click(btn)
        expect(clientStore.getState().chat.displayedChatId).toEqual(chatId)
        
        await waitFor(() => expect(getMessageCount(chatId) - count1).toEqual(1))
        // somehow handleChatSelection triggered
        expect(clientStore.getState().chat.displayedChatId).toEqual(chatId) // it fails here. why?

        // this line still returns error: fix later
        const chatList = getChatList()
        const chatView = getChatView() 

        expect(within(chatList).getByText(newMessageContent)).toBeInTheDocument()
        expect(within(chatView).getByText(newMessageContent)).toBeInTheDocument()
        // to be displayed both at chat view and chat item, as it is a last message
        expect(screen.getAllByText(new RegExp(newMessageContent)).length === 2).toBeTruthy()

        await wait(200)
    })  

    // sometimes this fails
    test('handle message from other chat', async () => {
        // deselect chat
        clientStore.dispatch(handleChatSelection(''))

        const message = emitMessage(otherChats[2].chatId)
        await waitFor(() => expect(screen.getByText(new RegExp(message.content))).toBeInTheDocument()) 
    })

    test('search some other user and reset', async () => {
        const field = screen.getByLabelText('search-field')
        expect(field).toBeInTheDocument()

        fireEvent.change(field, { target: {value: 'some other user'}})        
        expect(clientStore.getState().users.onSearch).toBeTruthy()

        await waitFor(() => expect(clientStore.getState().users.searchResult.length === 1).toBeTruthy())
        const name = serverState.users.users[userIdToSearch].name
        expect(screen.getByText(new RegExp(name))).toBeInTheDocument()

        // disable search
        fireEvent.change(field, { target: { value: ''}})
        expect(clientStore.getState().users.onSearch).toBeFalsy()
    }) 

    test('search user and start chat', async () => {
        const field = screen.getByLabelText('search-field')        
        const getUserCount = () => Object.keys(clientStore.getState().users.users).length
        const count = getUserCount()

        fireEvent.change(field, { target: { value: 'some other user'}})

        expect(() => expect(clientStore.getState().users.onSearch).toBeTruthy())
        await waitFor(() => expect(getUserCount() - count).toEqual(1))

        const newUser = serverState.users.users[userIdToSearch]
        const item = screen.getByText(new RegExp(newUser.name))
        expect(item).toBeInTheDocument()

        // not yet implemented
        fireEvent.click(item) 
        
        // should be twice: in chat items and header
        await waitFor(() => expect(screen.getAllByText(new RegExp(newUser.name)).length === 2).toBeTruthy())
    })

    test('deselect chat, should be not visible in chat items', async () => {
        clientStore.dispatch(handleChatSelection(''))
        const searchField = screen.getByLabelText('search-field')
        fireEvent.change(searchField, { target: { value: ''}})

        const newUser = serverState.users.users[userIdToSearch]
        await waitFor(() => expect(screen.queryByText(new RegExp(newUser.name))).not.toBeInTheDocument())
    })

    test('user presses create group button', async () => {
        const btn = screen.getByLabelText('new-group-btn')
        expect(btn).toBeInTheDocument()

        fireEvent.click(btn)        

        const panel = getChatControl()        
        expect(panel).toBeInTheDocument()

        const nameField = ChatControlGetters.getNameField()
        expect(nameField).toBeInTheDocument()
        expect(nameField).not.toBeDisabled()

        const membership = ChatControlGetters.getMembershipDiv()
        expect(membership).toBeInTheDocument()


        const expectedUsers = StoreGetters.getAllUsers(clientStore)
        for(const info of expectedUsers){
            const contact = within(membership!).getByText(info.name)
            expect(contact).toBeInTheDocument()
        }

        const createBtn = ChatControlGetters.getCreateBtn()          
        expect(createBtn).toBeInTheDocument()
    })

    test('user closes the panel', () => {
        const closeBtn = ChatControlGetters.getCloseControlsBtn() 
        expect(closeBtn).toBeInTheDocument()

        fireEvent.click(closeBtn!)  

        const panel = ChatControlGetters.getPanel()
        expect(panel).not.toBeInTheDocument()
    })

    test('user opens new group controls again, types name and chooses two other users', () => {
        const newGroupBtn = ChatListGetters.getNewGroupBtn()
        expect(newGroupBtn).toBeInTheDocument()

        fireEvent.click(newGroupBtn!)

        const nameField = ChatControlGetters.getNameField() 
        expect(nameField).toBeInTheDocument()

        fireEvent.change(nameField!, { target: {value: 'My new group'}})

        const expectedUsers = StoreGetters.getAllUsers(clientStore).slice(0, 2)
        expect(StoreGetters.getInGroup(clientStore).length).toEqual(0)

        const panel = screen.getByLabelText('chat-control')
        const membership = within(panel).getByLabelText('membership')
        expect(membership).toBeInTheDocument()

        const item1 = within(membership).getByTestId(expectedUsers[0].id)
        expect(item1).toBeInTheDocument()
        const add1 = within(item1).getByRole('button')

        fireEvent.click(add1) // this somehow destroys the chat control panel

        const item2 = within(membership).getByTestId(expectedUsers[1].id)
        expect(item2).toBeInTheDocument()
        const add2 = within(item2).getByRole('button')
        expect(add2).toBeInTheDocument()

        fireEvent.click(add2)

        const inGroup = clientStore.getState().group.inGroup
        expect(inGroup.length).toEqual(2)
    })

    test('user presses Create button', async () => {
        const createBtn = ChatControlGetters.getCreateBtn()
        expect(createBtn).toBeInTheDocument()

        fireEvent.click(createBtn)

        const panel = screen.queryByLabelText('chat-control')
        expect(panel).not.toBeInTheDocument()

        await waitFor(() => expect(screen.queryAllByText(/My new group/i).length > 0).toBeTruthy())
    })

    // todo: test case when someone else creates the group

    test('"My new group" is being renamed', async () => {
        const item = screen.getAllByText(/My new group/)[0]
        expect(item).toBeInTheDocument()

        fireEvent.click(item)

        const header = screen.getByLabelText('header')
        expect(header).toBeInTheDocument()

        expect(within(header).getByText(/My new group/)).toBeInTheDocument()
        const btn = within(header).getByLabelText('chat-info-button')
        expect(btn).toBeInTheDocument()

        fireEvent.click(btn)

        const panel = screen.getByLabelText('chat-control')
        expect(panel).toBeInTheDocument()

        const nameField = screen.getByLabelText('chat-control-name-field') 
        expect(nameField).toBeInTheDocument()

        fireEvent.change(nameField, {target: { value: 'GROUP2' }})

        const applyBtn = within(panel).getByText(/Apply/)   
        expect(applyBtn).toBeInTheDocument()

        fireEvent.click(applyBtn)

        expect(screen.queryByLabelText('chat-control')).not.toBeInTheDocument()

        await waitFor(() => expect(screen.getAllByText('GROUP2').length > 0).toBeTruthy())
    })



})