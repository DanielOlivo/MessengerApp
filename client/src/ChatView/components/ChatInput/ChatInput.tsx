export const ChatInput = () => {
    return (
        <div className="w-full flex flex-row justify-between border-t-2 border-slate-300">
            <input type='text' placeholder="type here..." className="flex-grow" />
            <button>Send</button>
        </div>
    )
}
