import { useAppSelector } from "../../app/hooks"
import { selectItems } from "../selectors"
import { isDateSeparator, isTextMessage } from "../utils"
import { DateSeparator } from "./DateSeparator/DateSeparator"
import { TextMessage } from "./TextMessage/TextMessage"

export const Container = () => {
    const items = useAppSelector(selectItems) 

    return (
        <div className="flex flex-col justify-start items-stretch">
            {items.map(item => {
                switch(true){
                    case isTextMessage(item): return <TextMessage {...item} />
                    case isDateSeparator(item): return <DateSeparator {...item} />
                }
            })}
        </div>
    )
}
