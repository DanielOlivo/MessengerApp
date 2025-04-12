import { GroupSliceState } from "./slice";

export function getDefault(): GroupSliceState {
    return {
        state: 'idle',
        chatId: '',
        isAdmin: false,

        inGroup: [],

        onSearch: false,
        searchResult: [] 
    } 
}