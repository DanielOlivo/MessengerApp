import { RootState } from "../app/store";
import { getChatItem } from "./getChatItem";
import { getItems } from "./textMessageGen";
import { ChatId, MessageId, UserId } from "../../../shared/src/Types";
import { ContainerItem } from "../ChatPage/components/ChatView/slice";
import { faker } from "@faker-js/faker";
import { getRandomIcon } from "./getRandomIcon";
import { Typings } from "../ChatPage/components/ChatView/components/Typing/utils";
import { getRandomSliceState } from "../ChatPage/utils";
import { ChatInfo } from "../ChatPage/slice";
import { TextMessageProps } from "../ChatPage/components/ChatView/components/TextMessage/TextMessage";
import { getDefault } from "../Group/utils";

export type DeepPartial<T> = T extends Array<infer U>
    ? T 
    : T extends object 
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

export function getState(state?: DeepPartial<RootState>): RootState {

    const msgs = getItems()
    const currentChatId = Object.keys(msgs)[0]

    const chat = getRandomSliceState()

    const st: RootState = {
        chat: {
            chatMessageIds: state?.chat?.chatMessageIds as {[P in ChatId]: MessageId[]} ?? chat.chatMessageIds,
            chatInfo: state?.chat?.chatInfo as {[P in ChatId]: ChatInfo} ?? chat.chatInfo,
            messages: state?.chat?.messages as {[P in MessageId]: TextMessageProps} ?? chat.messages,
            unseenCount: state?.chat?.unseenCount as {[P in ChatId]: number} ?? chat.unseenCount,
            pinned: state?.chat?.pinned ?? chat.pinned,
            displayedChatId: state?.chat?.displayedChatId ?? chat.displayedChatId,
            typing: state?.chat?.typing as {[P in ChatId]: {[U in UserId]: number}} ?? chat.typing,
            users: state?.chat?.users as {[P in UserId]: string} ?? chat.users
        },
        group: getDefault(),
        auth: {
            authenticated: true,
        },
        chatList: {
            list: [],
            state: 'list',
            searchResult: [] 
        },
        chatView: {
            userId: '',
            chatId: '',
            header: {
                chatName: '',
                count: 0
            },
            messages: []
        },
        header: {
            typingTrigger: false
        },
        // group: {
        //     isOn: false,
        //     members: []
        // },
        socket: {
            isConnected: false,
            rooms: [],
            msg: '',
            user: {
                id: '',
                username: '',
                hashed: '',
                created: new Date(),
            },
            users: {},
            dms: {},
            groups: {},
            memberships: {},
            messages: {},
            typing: [],
            online: [],
            overlayed: false
        },
        state: {
            state: 'idle'
        },
        chatList2: {
            items: state?.chatList2?.items ?? Array.from({length: 20}, () => getChatItem())
        },
        chatView2: {
            items: (state?.chatView2?.items as {[P in ChatId]: ContainerItem[]} | undefined) ?? msgs,
            chatId: state?.chatView2?.chatId ?? currentChatId,
            header: {
                title: state?.chatView2?.header?.title ?? faker.person.fullName(),
                iconSrc: state?.chatView2?.header?.iconSrc ?? getRandomIcon().iconSrc
            },
            typing: state?.chatView2?.typing as Typings ?? {}
        }
    }

    return st
}