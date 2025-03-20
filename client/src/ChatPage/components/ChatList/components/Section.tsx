import { ChatItem, ChatItemProps } from "./ChatItem"

export interface SectionProps {
    title: string
    iconSrc: string
    items: ChatItemProps[]
}

export const Section = ({title, iconSrc, items}: SectionProps) => {

    if(items.length === 0){
        return null
    }

    return (
        <div className="flex flex-col justify-start items-stretch">
            <div className="flex flex-row">

                <div className="w-3 h-3">
                    <img src={iconSrc} className="object-contain" />
                </div>

                <p>{title}</p>
            </div>

            {items.map(item => <ChatItem key={item.chatId} {...item} />)}
        </div>
    )

}
