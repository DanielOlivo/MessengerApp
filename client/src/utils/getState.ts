import { RootState } from "../app/store";
import { getChatItem } from "./getChatItem";
import { getItems } from "./textMessageGen";
import { ChatId } from "../../../shared/src/Types";
import { ContainerItem } from "../ChatView/slice";
import { faker } from "@faker-js/faker";
import { getRandomIcon } from "./getRandomIcon";

export type DeepPartial<T> = T extends Array<infer U>
    ? T 
    : T extends object 
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

export function getState(state?: DeepPartial<RootState>): RootState {

    const st: RootState = {
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
        group: {
            isOn: false,
            members: []
        },
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
            items: (state?.chatView2?.items as {[P in ChatId]: ContainerItem[]} | undefined) ?? getItems(),
            chatId: state?.chatView2?.chatId ?? '',
            header: {
                title: state?.chatView2?.header?.title ?? faker.person.fullName(),
                iconSrc: state?.chatView2?.header?.iconSrc ?? getRandomIcon().iconSrc
            },
            typing: {
                timestamp: state?.chatView2?.typing?.timestamp ?? 0,
                username: state?.chatView2?.typing?.username ?? faker.person.firstName(),
                userId: state?.chatView2?.typing?.userId ?? '',
                chatId: state?.chatView2?.typing?.chatId ?? ''
            }
        }
    }

    return st
}