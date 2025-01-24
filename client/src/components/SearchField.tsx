import { ChangeEvent, useState, useRef } from "react"

const SearchField = () => {

    const fieldRef = useRef<HTMLInputElement>(null)
    const [visible, setVisible] = useState<boolean>(false) 


    const handleUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        setVisible(e.target.value.length > 0)
    }

    return (
        <div
            className="w-full flex flex-row justify-between items-center
            py-2 px-1" 
        >
            <input 
                className="w-4/5 px-3 py-2 flex-grow"
                placeholder="search..." 
                onChange={(e) => handleUpdate(e)}
                ref={fieldRef}
            />

            <button
                style={{visibility: visible ? 'visible' : 'hidden'}}
                className="w-4" 
                onClick={(e) => {
                    fieldRef.current!.value = ''
                    setVisible(false)
                }}
            >X</button>
        </div>
    )
}

export default SearchField