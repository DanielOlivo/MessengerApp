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

})