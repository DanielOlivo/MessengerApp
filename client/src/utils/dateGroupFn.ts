import { Message } from "@shared/Types"

export default function dateGroupFn({created}: Message): string {
    return created.toLocaleDateString('en-us', {
        year: 'numeric',
        month: '2-digit',
        day: 'numeric'
    })
}