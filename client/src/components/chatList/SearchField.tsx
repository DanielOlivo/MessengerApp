import { ChangeEvent, useState, useRef } from "react"
import { useApDispatch } from "../../app/hooks"
import { clearResult, search, setState } from "../../features/chatList/chatListSlicer"

const SearchField = () => {

    const fieldRef = useRef<HTMLInputElement>(null)
    const [visible, setVisible] = useState<boolean>(false) 

    const dispatch = useApDispatch()

    const handleUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        setVisible(e.target.value.length > 0)
    }

    return (
        <div
            className="w-full flex flex-row justify-between items-center
            py-2 px-1" 
        >
            <input 
                type='text'
                className="w-4/5 px-3 py-2 flex-grow"
                placeholder="search..." 
                onChange={(e) => {
                    handleUpdate(e)
                    if(fieldRef.current!.value.length > 0){
                        dispatch(search({criteria: fieldRef.current!.value}))
                    }
                    else {
                        dispatch(clearResult())
                    }
                }
                }
                ref={fieldRef}
                onFocus={(e) => {
                    dispatch(setState('search'))
                }}
                onBlur={(e) => {
                    dispatch(setState('list'))
                }}

                

            />

            <button
                style={{visibility: visible ? 'visible' : 'hidden'}}
                className="w-4" 
                onClick={(e) => {
                    fieldRef.current!.value = ''
                    setVisible(false)
                    dispatch(setState('list'))
                }}
            >X</button>
        </div>
    )
}

export default SearchField