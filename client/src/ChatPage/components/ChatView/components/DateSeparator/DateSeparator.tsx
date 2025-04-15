export interface DateSeparatorProps {
    chatId: string
    timestamp: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DateSeparator = ({chatId, timestamp}: DateSeparatorProps) => {

    return (
        <div className="w-full flex flex-row justify-center items-center border-b-2 border-slate-400">
            <p>{timestamp}</p>
        </div>
    )
}
