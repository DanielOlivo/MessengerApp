import { faker } from '@faker-js/faker'
import { ChatItemProps } from '../ChatPage/components/ChatList/components/ChatItem'
import { getRandomHumanIcon } from '../assets/assets'

export function getChatItem(): ChatItemProps {
    return {
        chatId: '',
        title: faker.person.fullName(),
        content: faker.lorem.sentence(),
        iconSrc: getRandomHumanIcon(),
        unseenCount: faker.number.int({min: 0, max: 10}),
        selected: false,
        pinned: faker.datatype.boolean()
    }
}