import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import { ChatItemProps } from "./components/ChatItem";
import dayjs from "dayjs";

export function getRandomChatItem(): ChatItemProps {
    return {
        chatId: uuid(),
        title: faker.lorem.sentence(),
        content: faker.lorem.sentences(),
        iconSrc: '',
        unseenCount: 0,
        selected: false,
        pinned: false,
        timestamp: dayjs().format('hh:mm')
    }
}