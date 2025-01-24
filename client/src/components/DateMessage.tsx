
export interface DateMessageProp {
    date: Date
}


const DateMessage = ({date}: DateMessageProp) => {

    return (
        <div
            className="w-full flex flex-row justify-center mt-2" 
        >
            <div
                className="w-2/5
                flex flex-row justify-center rounded-3xl px-5
                bg-gray-500
                text-white
                text-xs
                " 
            >
                {date.toLocaleDateString('en-us', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </div>
        </div>
    )
}

export default DateMessage