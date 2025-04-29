import human1               from './icons/humans/1.jpg'
import human2               from './icons/humans/2.jpg'
import human3               from './icons/humans/3.jpg'
import human4               from './icons/humans/4.jpg'
import human5               from './icons/humans/5.jpg'
import human6               from './icons/humans/6.jpg'
import human7               from './icons/humans/7.jpg'
import human8               from './icons/humans/8.jpg'
import human9               from './icons/humans/9.jpg'
import human10              from './icons/humans/10.jpg'

import attachment       from './icons/chatview/attachment.svg'
import clock            from './icons/chatview/clock.svg'
import dots             from './icons/chatview/dots.svg'
import gear             from './icons/chatview/gear.svg'
import image            from './icons/chatview/image.svg'
import search           from './icons/chatview/search.svg'
import seen             from './icons/chatview/seen.svg'
import unseen           from './icons/chatview/unseen.svg'

import pin              from './icons/chatlist/pin.svg'

import userIcon         from './icons/userIcon.svg'
import groupIcon        from './icons/groupIcon.svg'


export const humanIcons = {
    human1, human2, human3, human4, human5, 
    human6, human7, human8, human9, human10
}

export const chatViewIcons = {
    attachment, clock, dots, gear, image, search, seen, unseen
}

export const chatListIcons = {
    pin, userIcon, groupIcon
}

export function getRandomHumanIcon(): string {
    const values = Object.values(humanIcons)
    const idx = Math.floor(Math.random() * values.length)

    return values[idx]
}

