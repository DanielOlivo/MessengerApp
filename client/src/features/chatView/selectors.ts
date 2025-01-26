import { RootState } from "../../app/store";

export const onlyMessages = (state: RootState) => 
    state.chatView.messages