import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from '../../../../../utils/Provider'
import { MessageContainer, MessageContainerProps } from './MessageContainer'
// import { getSocketServer } from '../../../../../utils/getSocketServer'
// import { createStore } from '../../../../../app/store'
// import { getState } from '../../../../../utils/getState'
// import { genTextMessage } from '../../../../../utils/textMessageGen'
// import { isTextMessage } from '../../utils'
// import { TextMessage, TextMessageProps } from '../TextMessage/TextMessage'
// import { Commands } from 'shared/src/MiddlewareCommands'

describe('MessageContainer', () => {

    const props: MessageContainerProps = {
        id: '',
        isOwn: true,
        timestamp: '00:00',
        status: 'pending'
    }

    test('render', () => {
        render(
            <Provider>
                <MessageContainer {...props}>
                    <p>children</p>
                </MessageContainer>
            </Provider>
        )

        expect(screen.queryByText(/children/i)).toBeInTheDocument()
    })

    // TODO: return to this later
    // test('updating status from pending to unseen', async() => {
    //     const io = getSocketServer()
    //     const chatId = '1'

    //     const gen = genTextMessage(chatId)
    //     const textMsg = Array.from({length: 10}, () => gen.next().value).filter(item => isTextMessage(item))[0] as TextMessageProps

    //     const store = createStore(getState({
    //         chatView2: {
    //             chatId,
    //             items: {
    //                 [chatId] : [ textMsg ]
    //             }
    //         }
    //     }), true)  

    //     render(
    //         <Provider>
    //             <TextMessage {...textMsg} />
    //         </Provider>
    //     )

    //     expect(screen.queryByText(textMsg.text)).toBeInTheDocument()
    //     io.emit(Commands. {
    //         id: textMsg.id,
    //         chatId,
    //         status: 'unseen'
    //     })

    //     await waitFor(() => store.getState().chatView2.items[chatId].find(item => isTextMessage(item) && item.id === textMsg.id))
    // })

})