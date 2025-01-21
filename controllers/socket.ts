import {Socket} from 'socket.io'
import { ChatId, TokenPayload, MessageId, SearchResult } from '../types/Types'

const controller = {

    searchReq: async(payload: TokenPayload, criteria: string): Promise<SearchResult> => {
        throw new Error()
    },

    // group actions
    createGroupReq: async(payload: TokenPayload, groupName?: string) => {

    },

    removeGroupReq: async(payload: TokenPayload, chatId: ChatId) => {

    },

    addMemberReq: async(payload: TokenPayload, chatId: ChatId, userId: ChatId) => {

    },

    leaveGroupReq: async(payload: TokenPayload, chatId: ChatId) => {

    },


    // messaging

    // sendMessageReq: async(payload: TokenPayload, chatId: ChatId, content: stirng): Promise<Message>

    sendMessageReadReq: async(payload: TokenPayload, messageId: MessageId) => {

    }

}

export default controller