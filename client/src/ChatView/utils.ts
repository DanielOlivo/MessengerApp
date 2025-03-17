import { DateSeparatorProps } from "./components/DateSeparator/DateSeparator";
import { TextMessageProps } from "./components/TextMessage/TextMessage";

export function isTextMessage(obj: object): obj is TextMessageProps {
    return ['text', 'chatId', 'isOwn', 'timestamp'].every(prop => prop in obj)
}

export function isDateSeparator(obj: object): obj is DateSeparatorProps {
    return ['timestamp', 'chatId'].every(prop => prop in obj)
}

