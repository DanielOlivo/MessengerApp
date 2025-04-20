import { UserId, ChatId, MessageId } from "./Types"
import { Message } from "./Message"

export interface GroupCreateReq {
    name: string
    admins: UserId[]
    members: UserId[]
}

export interface GroupCreateRes extends GroupCreateReq {
    id: ChatId
    created: number // timestamp
    chatMessageIds: MessageId[]
    messages: { [P: MessageId]: Message}
}

export interface EditChanges {
    chatId: ChatId
    name: string
    iconSrc: string
    members: UserId[]
    admins: UserId[]
}