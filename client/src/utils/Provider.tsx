import { FC } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PropsWithChildren } from "react";
import { createStore } from "../app/store";
import { getRandomState } from "./getState";


export const Provider: FC<PropsWithChildren> = ({children}) => {
    return (
        <ReduxProvider store={createStore(getRandomState())}>
            {children}
        </ReduxProvider>
    )
}