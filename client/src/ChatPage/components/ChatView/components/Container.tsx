import { useAppSelector } from "../../../../app/hooks"
import { selectItems } from "../selectors"
import { isDateSeparator, isTextMessage } from "../utils"
import { DateSeparator } from "./DateSeparator/DateSeparator"
import { TextMessage } from "./TextMessage/TextMessage"

export const Container = () => {
    const items = useAppSelector(selectItems) 

    console.log('items', items)

    return (
        <div className="flex-grow flex flex-col justify-start items-stretch bg-slate-200 px-3 pt-14 overflow-y-auto">
            <div className="w-full">
                {items.map(item => {
                    switch(true){
                        case isTextMessage(item): return <TextMessage {...item} />
                        case isDateSeparator(item): return <DateSeparator {...item} />
                    }
                })}
            </div>
        </div>
    )
}
