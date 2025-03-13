import { faker } from '@faker-js/faker'
import { ChatItemProps } from '../ChatList/components/ChatItem'

export function getChatItem(): ChatItemProps {
    return {
        chatId: '',
        title: faker.person.fullName(),
        content: faker.lorem.sentence(),
        iconSrc: '',
        unseenCount: 0,
        selected: false,
        pinned: faker.datatype.boolean()
    }
}