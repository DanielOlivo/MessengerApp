import { ActionCreatorWithPayload, MiddlewareAPI } from "@reduxjs/toolkit"
import { SocketInterface } from "../features/socket/SocketFactory"

export const inputHandlers: ((store: MiddlewareAPI, socket: SocketInterface) => void)[] = []

export const outputHandlers: ((action: unknown, socket: SocketInterface) => void)[] = []

export function addInputHandler<T> (
        name: string, 
        handler: (args: T, store: MiddlewareAPI) =>  void
    ) {
        const action = (store: MiddlewareAPI, socket: SocketInterface) => {(socket.socket.on(name, (args) => handler(args, store)))}
        inputHandlers.push(action)
    }

export function addOutputHandler<T> (reducer: ActionCreatorWithPayload<T>, name: string){
    const fn = (action: unknown, socket: SocketInterface) => {
        if(reducer.match(action) && socket){
            socket.socket.emit(name, action.payload)
        }
    }
    outputHandlers.push(fn)
}