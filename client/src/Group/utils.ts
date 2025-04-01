import { GroupSliceState } from "./slice";

export function getDefault(): GroupSliceState {
    return {
        state: 'idle',
        groupId: '',
        isAdmin: false,

        inGroup: [],

        onSearch: false,
        searchResult: [] 
    } 
}