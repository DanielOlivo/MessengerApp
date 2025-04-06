import { describe, test, expect } from "vitest";
import { render, screen } from '@testing-library/react'
import { getEmpty, makeChatWithUser, makeUser } from "../../../utils/getState";
import { createStore } from "../../../app/store";
import { Provider } from "react-redux";
import { ChatView } from "./ChatView";

describe('ChatView', () => {
   
    test('no chat selected', () => {
        const state = getEmpty()
        makeUser(state)
        makeChatWithUser(state)
        const store = createStore(state)
        render(<Provider store={store}><ChatView /></Provider>)
        expect(screen.queryByLabelText('header')).not.toBeInTheDocument()
        expect(screen.queryAllByLabelText('message-conteiner').length === 0).toBeTruthy()
        expect(screen.queryByLabelText('chat-input')).not.toBeInTheDocument()
    })    

    test('chat selected', () => {
        const state = getEmpty()
        makeUser(state)
        makeChatWithUser(state)
        const chatId = Object.keys(state.chat.chatInfo)[0]
        state.chat.displayedChatId = chatId
        const store = createStore(state)
        render(<Provider store={store}><ChatView /></Provider>)
        expect(screen.queryByLabelText('header')).toBeInTheDocument()
        expect(screen.queryAllByLabelText('message-container').length === 0).toBeFalsy()
        expect(screen.queryByLabelText('chat-input')).toBeInTheDocument()

        expect(screen.queryByText(new RegExp(state.chat.chatInfo[chatId].name, 'i'))).toBeInTheDocument()

        for(const msgId of state.chat.chatMessageIds[chatId]){
            expect(screen.queryByText(new RegExp(state.chat.messages[msgId].content, 'i'))).toBeInTheDocument()
        }

    })

})