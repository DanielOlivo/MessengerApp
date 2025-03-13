import { Provider as ReduxProvider } from "react-redux";
import { PropsWithChildren } from "react";
import { createStore, RootState } from "../app/store";
import { DeepPartial, getState } from "./getState";


export interface ProviderProps {
    state?: DeepPartial<RootState>
}

export const Provider = ({state, children}: PropsWithChildren<ProviderProps> ) => {
    return (
        <ReduxProvider store={createStore(getState(state))}>
            {children}
        </ReduxProvider>
    )
}