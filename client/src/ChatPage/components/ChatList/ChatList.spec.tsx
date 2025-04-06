import { describe, test, expect } from "vitest";
import { render, screen } from '@testing-library/react'
import { createStore } from "../../../app/store";
import { useRState } from "../../../utils/getState";
import { Provider } from "react-redux";
import { ChatList } from "./ChatList";

describe('ChatList', () => {
    
    test('render', () => {
        const { state, makeUser, addChat } = useRState()
        makeUser()
        const { chatId: id1 } = addChat(true)
        const { chatId: id2 } = addChat(false)

        const store = createStore(state)
        render(<Provider store={store}><ChatList /></Provider>)

        expect(screen.queryByText(/all/i)).toBeInTheDocument()
        expect(screen.queryByText(/pinned/i)).toBeInTheDocument()
        expect(screen.queryByText(new RegExp(state.chat.chatInfo[id1].name, 'i'))).toBeInTheDocument()
        expect(screen.queryByText(new RegExp(state.chat.chatInfo[id2].name, 'i'))).toBeInTheDocument()
    })
})