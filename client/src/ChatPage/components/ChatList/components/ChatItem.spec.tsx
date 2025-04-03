import { describe, test, expect } from "vitest";
import { render, screen } from '@testing-library/react'
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import { ChatItem, ChatItemProps } from "./ChatItem";
import dayjs from "dayjs";
import { Provider } from "../../../../utils/Provider";

describe('ChatItem', () => {

    test('render', () => {
        const props: ChatItemProps = {
            chatId: uuid(),
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            iconSrc: '',
            unseenCount: 0,
            selected: false,
            pinned: false,
            timestamp: dayjs().format('hh:mm')
        }

        render(<Provider><ChatItem {...props} /></Provider>)

        expect(screen.queryByText(new RegExp(props.title))).toBeInTheDocument()
        expect(screen.queryByText(new RegExp(props.content))).toBeInTheDocument()
    })
})