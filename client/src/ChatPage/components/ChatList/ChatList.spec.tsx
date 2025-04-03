import { describe, test, expect } from "vitest";
import { render, screen } from '@testing-library/react'
import { addRandomChat, getEmptyState } from "../../utils";
import { createStore } from "../../../app/store";
import { getState } from "../../../utils/getState";
import { Provider } from "react-redux";
import { ChatList } from "./ChatList";

describe('ChatList', () => {
    
    test('render', () => {
        const chat = getEmptyState()
        const chatId1 = addRandomChat(chat, true) 
        const chatId2 = addRandomChat(chat, false)

        const store = createStore(getState({chat}))

        render(<Provider store={store}><ChatList /></Provider>)

        expect(screen.queryByText(/all/i)).toBeInTheDocument()
        expect(screen.queryByText(/pinned/i)).toBeInTheDocument()
    })

})