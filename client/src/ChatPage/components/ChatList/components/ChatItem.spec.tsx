import { describe, test, expect } from "vitest";
import { render, screen } from '@testing-library/react'
import { ChatItem } from "./ChatItem";
import { Provider } from "../../../../utils/Provider";
import { getRandomChatItem } from "../utils";

describe('ChatItem', () => {

    test('render', () => {
        const props = getRandomChatItem()

        render(<Provider><ChatItem {...props} /></Provider>)

        expect(screen.queryByText(new RegExp(props.title))).toBeInTheDocument()
        expect(screen.queryByText(new RegExp(props.content))).toBeInTheDocument()
    })
})