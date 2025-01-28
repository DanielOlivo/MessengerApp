import { createAsyncThunk } from "@reduxjs/toolkit"
import { RootState, AppDispatch } from "./store"

export default createAsyncThunk.withTypes<{
    state: RootState,
    dispatch: AppDispatch
}>()