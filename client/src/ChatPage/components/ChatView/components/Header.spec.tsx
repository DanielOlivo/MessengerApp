import { describe, test, expect } from "vitest";
import { render, screen } from '@testing-library/react'
import { getRandomState, getState } from "../../../../utils/getState";
import { Provider } from "react-redux";
import { Header } from "./Header";
import { createStore } from "../../../../app/store";

describe('Header', () => {

    test('no chat selected', () => {
        const store = createStore(getState({chat: {displayedChatId: ''}}))
        render(<Provider store={store}><Header /></Provider>)
        expect(screen.queryByLabelText('header')).not.toBeInTheDocument()
    })

    test('chat was selected', () => {
        const state = getRandomState()
        state.chat.displayedChatId = Object.keys(state.chat.chatInfo)[0]

        const store = createStore(state)
        render(<Provider store={store}><Header /></Provider>)

        expect(screen.queryByLabelText('header')).toBeInTheDocument()
    })

})

