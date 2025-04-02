import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { SearchCardProps } from "./components/SearchCard";

export type SearchReq = string


export interface SearchState {
    onSearch: boolean
    result: SearchCardProps[]
}

const initialState: SearchState = {
    onSearch: false,
    result: []
}

const slice = createSlice({
    name: 'search',
    initialState,
    reducers: {

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        search: (state, action: PayloadAction<SearchReq>) => {},
        
        handleSearch: (state, action: PayloadAction<SearchCardProps[]>) => {
            state.result = action.payload
        },

        reset: (state) => {
            state.onSearch = false
            state.result = []
        }
    }
})

export default slice.reducer