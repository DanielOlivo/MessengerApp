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
            className="border border-slate-200 rounded-lg px-1 py-1 mx-2"
            onChange={handleChange}
        />
    )
}
