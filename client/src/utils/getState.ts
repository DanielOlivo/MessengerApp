import { RootState } from "../app/store";
import { ChatId, MessageId, UserId, UserInfo } from "../../../shared/src/Types";
import { getRandomSliceState } from "../ChatPage/utils";
import { ChatInfo } from "../ChatPage/slice";
import { TextMessageProps } from "../ChatPage/components/ChatView/components/TextMessage/TextMessage";
import { getDefault } from "../Group/utils";
import { getRandomUsers } from "../users/utils";

export type DeepPartial<T> = T extends Array<infer U>
    ? T 
    : T extends object 
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

export function getState(state?: DeepPartial<RootState>): RootState {

    const chat = getRandomSliceState()
    const defaultGroup = getDefault()

    const st: RootState = {
        users: {
            users: state?.users?.users as {[P: UserId] : UserInfo} ?? getRandomUsers(),
            searchTerm: ''
        },
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
        group: {
            state: state?.group?.state ?? defaultGroup.state,
            groupId: state?.group?.groupId ?? defaultGroup.groupId,
            isAdmin: state?.group?.isAdmin ?? defaultGroup.isAdmin,
            inGroup: state?.group?.inGroup ?? defaultGroup.inGroup,
            onSearch: state?.group?.onSearch ?? defaultGroup.onSearch,
            searchResult: state?.group?.searchResult ?? defaultGroup.searchResult
        },
        auth: {
            authenticated: true,
        },
        socket: {
            isConnected: false,
        },
        search: {
            onSearch: state?.search?.onSearch ?? false,
            result: state?.search?.result ?? [] 
        }
    }

    return st
}