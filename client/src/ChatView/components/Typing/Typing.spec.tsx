import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs'
import { describe, test ,expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react'
import { getState } from '../../../utils/getState';
import { Provider } from '../../../utils/Provider';
import { Provider as RProvider } from 'react-redux'
import { Typing } from './Typing';
import { getSocketServer } from '../../../utils/getSocketServer';
import { createStore } from '../../../app/store';
import { Commands } from '../../../../../shared/src/MiddlewareCommands';
import { getActiveTyping, getNonactiveTyping } from './utils';
import { TypingInChat } from 'shared/src/Types';

describe('Typing', () => {

    test('when someone is typing', () => {
        const state = getState({
            chatView2: {
                chatId: '1',
                typing: { 
                    "1": [getActiveTyping()]
                }
            }
        })

        render(<Provider state={state}><Typing /></Provider>)
        expect(screen.getByText(/is typing/i)).toBeInTheDocument()
    })

    test('many types', () => {
        const state = getState({
            chatView2: {
                chatId: '1',
                typing: { 
                    "1": Array.from({length: 4}, () => getActiveTyping())
                }
            }
        })

        render(<Provider state={state}><Typing /></Provider>)
        expect(screen.queryByText(/are typing/i)).toBeInTheDocument()
    })

    test('someone typed more than two seconds ago', () => {
        const state = getState({
            chatView2: {
                chatId: '1',
                typing: { 
                    "1": [getNonactiveTyping()]
                }
            }
        })

        render(<Provider state={state}><Typing /></Provider>)
        expect(screen.queryByText(/is typing/i)).not.toBeInTheDocument()
    })

    test('someone started typing', async() => {
        const io = getSocketServer()

        const store = createStore(getState({
            chatView2: {
                chatId: '1',
                typing: {}
            }
        }), true)

        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())

        render(<RProvider store={store}><Typing /></RProvider>)
        expect(screen.queryByText(/is typing/i)).not.toBeInTheDocument()

        const entry: TypingInChat = {
            username: faker.internet.username(),
            chatId: '1',
            userId: uuid(),
            timestamp: dayjs().valueOf()
        }

        io.emit(Commands.TypingRes, entry)

        await waitFor(() => expect(store.getState().chatView2.typing['1'].length > 0).toBeTruthy())
        expect(screen.queryByText(/is typing/i)).toBeInTheDocument()
    })
})
