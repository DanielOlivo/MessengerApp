import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from "react-redux";
import { getState } from "../../../../utils/getState";
import { ChatItemMenu, ChatItemMenuProps } from "./ChatItemMenu";
import { createStore } from "../../../../app/store";
import { getSocketServer } from "../../../../utils/getSocketServer";

describe('ChatItemMenu', () => {
    const props: ChatItemMenuProps = {
        chatId: '',
        pinned: false
    }

    test('just render', () => {
        const store = createStore(getState())

        render(<Provider store={store}><ChatItemMenu {...props} /></Provider>)

        expect(screen.queryByText(/delete/i)).toBeInTheDocument()
        expect(screen.queryByText(/pin/i)).toBeInTheDocument()
    })

    test('handle toggle pin and delete requests', async() => {
        let toggledChatId = ''
        let toDeleteChatId = ''
        const io = getSocketServer()
        io.on('connection',  socket => {
            socket.on('togglePin', chatId => {
                toggledChatId = chatId
            })

            socket.on('deleteChat', chatId => {
                toDeleteChatId = chatId
            })

        })

        const store = createStore(getState(), true)

        render(<Provider store={store}><ChatItemMenu {...props} /></Provider>)

        await waitFor(() => expect(store.getState().socket.isConnected).toBeTruthy())

        const toggleBtn = screen.getByLabelText('chat-item-menu-toggle') 
        expect(toggleBtn).toBeDefined()

        fireEvent.click(toggleBtn) 
        await waitFor(() => expect(toggledChatId).toEqual(props.chatId))

        const deleteBtn = screen.getByLabelText('chat-item-menu-delete')
        expect(deleteBtn).toBeDefined()

        fireEvent.click(deleteBtn) 
        await waitFor(() => expect(toDeleteChatId).toEqual(props.chatId))
    })
})