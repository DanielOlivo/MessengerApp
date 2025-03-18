import dayjs from 'dayjs'
import { faker } from '@faker-js/faker'
import { v4 as uuid} from 'uuid'
import { ChatId } from '../../../shared/src/Types'
import { ContainerItem } from '../ChatView/slice'
import { TextMessageProps } from "../ChatView/components/TextMessage/TextMessage"
import { DateSeparatorProps } from "../ChatView/components/DateSeparator/DateSeparator"

export function* genTextMessage(chatId: ChatId): Generator<ContainerItem> {
    let timestamp = dayjs(faker.date.anytime().getTime())

    while(true){
        const nextTimestamp = timestamp.add(Math.floor(8 * Math.random()), 'hour')

        if(timestamp.day !== nextTimestamp.day){
            yield {chatId, timestamp: nextTimestamp.format('hh:mm')} as DateSeparatorProps
        }

        yield {
            id: uuid(),
            chatId,
            timestamp: nextTimestamp.format('hh:mm'),
            text: faker.lorem.sentence(),
            isOwn: faker.datatype.boolean(),
            status: 'seen'
        } as TextMessageProps

        timestamp = nextTimestamp
    }
}

export function getTextMessages(id: ChatId, count: number) {
    const gen = genTextMessage(id)
    return Array.from({length: count}, () => gen.next().value)
}

export function getItems(){
    const count = 1 + Number(Math.floor(Math.random() * 10))
    const items = {} as {[P in ChatId]: ContainerItem[]}

    for(let i = 0; i < count; i+=1){
        const id = uuid()
        items[id] = getTextMessages(id, 10 + i)
    }

    return items
}