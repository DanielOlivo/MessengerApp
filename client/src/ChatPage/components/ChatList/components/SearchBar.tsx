import { ChangeEvent } from "react"
import { useApDispatch } from "../../../../app/hooks"
import { search, disableSearch } from "../../../../users/slice"

export const SearchBar = () => {

    const dispatch = useApDispatch()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if(e.currentTarget.value.length < 2){
            dispatch(disableSearch())
            return
        }  
        dispatch(search(e.currentTarget.value))
    } 

    return (
        <input 
            aria-label="search-field"    
            type='text'
            placeholder="search..."
            className="border-b-2 border-[rgb(186,230,253)] px-1 py-1 mx-4 focus:outline-none bg-[rgba(0,0,0,0)] h-9 text-sky-200 font-Montserrat font-semibold"
            onChange={handleChange}
        />
    )
}
