import { describe, test, expect } from "vitest";
import { render, screen, waitFor } from '@testing-library/react'
import { ChatItem } from "./ChatItem";
import { Provider } from "../../../../utils/Provider";
import { Provider as RProvider } from "react-redux";
import { getRandomChatItem } from "../utils";
import { getState } from "../../../../utils/getState";
import { createStore } from "../../../../app/store";

describe('ChatItem', () => {

    test('render', () => {
        const props = getRandomChatItem()

        render(<Provider><ChatItem {...props} /></Provider>)

        expect(screen.queryByText(new RegExp(props.title))).toBeInTheDocument()
        expect(screen.queryByText(new RegExp(props.content))).toBeInTheDocument()
    })

    test('click opens the chat', async () => {
        const props = getRandomChatItem()
        const store = createStore(getState())

        render(<RProvider store={store}><ChatItem {...props} /></RProvider>)

        await waitFor(() => expect(store.getState().chat.displayedChatId).toEqual(props.chatId))
    })
})