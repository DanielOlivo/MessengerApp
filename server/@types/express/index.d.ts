import { AuthPayload } from "../../../shared/src/Types";

declare global {
    namespace Express {
        interface Request {
            user: AuthPayload
        }
    }
}