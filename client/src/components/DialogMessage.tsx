export interface DialogMessageProp {
    message: string
}



const DialogMessage = ({message}: DialogMessageProp) => {
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
                {message}
            </div>
        </div>
    )
}

export default DialogMessage