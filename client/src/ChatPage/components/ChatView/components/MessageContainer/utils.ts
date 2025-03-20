import { chatViewIcons } from "../../../../../assets/assets"
import { MessageContainerProps, MessageStatus } from "./MessageContainer"

const { clock, seen, unseen } = chatViewIcons

export function getIcon(status: MessageStatus): string{
    switch(status){
        case 'pending': return clock
        case 'seen': return seen
        case 'unseen': return unseen
    }
}

