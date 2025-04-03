import { RootState } from "../app/store"

export const selectType = (state: RootState) => state.context.type
export const selectId = (state: RootState) => state.context.id
export const selectX = (state: RootState) => state.context.position.x
export const selectY = (state: RootState) => state.context.position.y