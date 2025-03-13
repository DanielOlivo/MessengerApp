import { describe, test, expect } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createServer } from 'http'
import { Server } from 'socket.io'
import { faker } from '@faker-js/faker'

import { ChatItem, ChatItemProps } from "../src/ChatList/components/ChatItem";
// import { Provider } from '../src/utils/Provider'
import { Provider } from 'react-redux'
import { ChatList } from '../src/ChatList/ChatList'
import { wait } from '../src/utils/wait'
import { createStore } from '../src/app/store'
import { getState } from '../src/utils/getState'

const httpServer = createServer()
const io = new Server(httpServer)


io.on('connection', (socket) => {
    socket.on('fetching', data => {
        console.log('FETCHING___', data)
    })
})

describe('manually', () => {
    beforeAll(async () => {
        httpServer.listen(3000)
    })

    afterAll(() => {
        httpServer.close()
    })

    test('calling', async () => {
        const props: ChatItemProps = {
            chatId: 'id___1',
            title: faker.person.fullName(),
            content: faker.lorem.sentence(),
            iconSrc: '',
            unseenCount: 1,
            selected: false
        }
        const store = createStore(getState(), true)

        const { container } = render(<Provider store={store} ><ChatItem {...props} /></Provider>) 
        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())
        const chatItem = container.querySelector(".chat-item")
        expect(chatItem).toBeDefined()

        userEvent.click(chatItem!)

        await wait(1000)
    }) 

    test('sanity', () => {
        expect(true).toBeTruthy()
    })
})