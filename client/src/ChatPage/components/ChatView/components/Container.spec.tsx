import { describe, test, expect } from "vitest";
import { render, screen } from '@testing-library/react'
import { getEmpty, makeChatWithUser, makeUser } from "../../../../utils/getState";
import { Provider } from "react-redux";
import { createStore } from "../../../../app/store";
import { Container } from "./Container";

describe('Container', () => {

    test('no chat selected', () => {
        const state = getEmpty()
        makeUser(state)
        makeChatWithUser(state)
        state.chat.displayedChatId = ''
        const store = createStore(state)
        render(<Provider store={store}><Container /></Provider>)
        expect(screen.queryAllByLabelText('message-container').length === 0).toBeTruthy()  
    })

    test('chat selected', () => {
        const state = getEmpty()
        makeUser(state)
        makeChatWithUser(state)
        state.chat.displayedChatId = Object.keys(state.chat.chatInfo)[0]
        const store = createStore(state)
        render(<Provider store={store}><Container /></Provider>)
        expect(screen.queryAllByLabelText('message-container').length > 0).toBeTruthy()
    })

})