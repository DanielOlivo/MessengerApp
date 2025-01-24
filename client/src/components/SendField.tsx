const SenfField = () => {
    return (
        <div
            className="flex flex-row justify-between
            w-full h-10 
            " 
        >
            <input 
                className="flex-grow p-2"
                placeholder="type..." 
            />
            <button
                className="w-8" 
            >&#9654;</button>
        </div>
    )
}

export default SenfField