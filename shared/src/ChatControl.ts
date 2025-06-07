import { Message } from "./Message"
import { ChatId, MessageId, UserId } from "./Types"

export interface GroupCreateReq {
    name: string
    admins: UserId[]
    members: UserId[]
}

export interface GroupCreateRes extends GroupCreateReq {
    id: ChatId
    created: number // timestamp
    chatMessageIds: { [P: ChatId]: MessageId[] }
    messages: { [P: MessageId]: Message}
}