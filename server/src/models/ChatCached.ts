import { ChatId, MembershipId, UserId } from "shared/src/Types";

export interface ChatModel {
    id: ChatId
    isGroup: boolean
}

export interface MembershipModel {
    id: number
    chatId: ChatId
    userId: UserId
}

// const getMembershipCache() = {
//     const map = new Map<MembershipId, MembershipModel>()
// }


// for db
const model = {
    addMember: async () => { throw new Error() },
    removeMember: async () => { throw new Error() }
}