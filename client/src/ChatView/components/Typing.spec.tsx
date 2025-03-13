import { faker } from '@faker-js/faker';
import dayjs from 'dayjs'
import { describe, test ,expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react'
import { getState } from '../../utils/getState';
import { Provider } from '../../utils/Provider';
import { Provider as RProvider } from 'react-redux'
import { Typing } from './Typing';
import { getSocketServer } from '../../utils/getSocketServer';
import { createStore } from '../../app/store';
import { Commands } from '../../../../shared/src/MiddlewareCommands';

describe('Typing', () => {

    test('when someone is typing', () => {
        const timestamp = dayjs().subtract(200, 'milliseconds').valueOf()
        const name = faker.person.firstName()

        const state = getState({
            chatView2: {
                typing: { timestamp, name}
            }
        })

        render(<Provider state={state}><Typing /></Provider>)
        
        expect(screen.getByText(/is typing/i)).toBeInTheDocument()
    })


    test('someone typed more than 2 seconds ago', () => {
        const timestamp = dayjs().subtract(2100, 'milliseconds').valueOf()
        const username = faker.person.firstName()

        const state = getState({
            chatView2: {
                typing: { timestamp, username}
            }
        })

        render(<Provider state={state}><Typing /></Provider>)
        screen.debug()
        
        expect(screen.queryByText(/is typing/i)).not.toBeInTheDocument()
    })

    test('get typing msg', async() => {
        const io = getSocketServer()
        const store = createStore(getState({
            chatView2: {
                typing: { timestamp: 0, username: ''}
            }
        }), true)

        render(<RProvider store={store}><Typing /></RProvider>)
        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())

        io.emit(Commands.TypingRes, {username: 'someone', userId: '1', chatId: '1'})


    })
})
