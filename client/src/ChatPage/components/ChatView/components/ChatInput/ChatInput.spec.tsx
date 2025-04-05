import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor} from '@testing-library/react'
import { getSocketServer } from "../../../../../utils/getSocketServer";
import { ChatInput } from "./ChatInput";
import { createStore } from "../../../../../app/store";
import { getState } from "../../../../../utils/getState";
import { Provider } from "react-redux";

describe('ChatInput', () => {

    test('type and send', async() => {
        let text = ''
        let id = ''
        const io = getSocketServer()
        io.on('connection', socket => {
            socket.on('msg', ({chatId, content}) => {
                text = content
                id = chatId
            })
        })

        const store = createStore(getState(), true)
        render(<Provider store={store}><ChatInput /></Provider>) 
        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())

        const field = screen.getByLabelText('chat-input-field')
        expect(field).toBeInTheDocument()

        const btn = screen.getByLabelText('chat-input-send')
        expect(btn).toBeInTheDocument()

        fireEvent.change(field, {target: {value: 'hello'}})       
        fireEvent.click(btn) 

        await waitFor(() => expect(text).toEqual('hello'))
        expect(id).toEqual(store.getState().chat.displayedChatId)

        io.close()
    })

})