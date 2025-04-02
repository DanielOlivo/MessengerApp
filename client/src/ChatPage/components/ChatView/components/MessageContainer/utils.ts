import { chatViewIcons } from "../../../../../assets/assets"
import { MessageStatus } from "@shared/Types"

const { clock, seen, unseen } = chatViewIcons

export function getIcon(status: MessageStatus): string{
    switch(status){
        case 'pending': return clock
        case 'seen': return seen
        case 'unseen': return unseen
        default: return clock
    }
}

