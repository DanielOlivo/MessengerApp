import { createAsyncThunk } from "@reduxjs/toolkit";
import { LoginInput } from "../Auth/components/Auth";
import { UserId } from "shared/src/Types";

export interface LoginResponse {
    token: string
    userId: UserId
    username: string
}

export const login = createAsyncThunk(
    'login',
    async (data: LoginInput): Promise<LoginResponse> => {
        throw new Error()
    }
)