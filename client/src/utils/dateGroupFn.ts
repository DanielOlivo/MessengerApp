import { Message } from "@shared/Message"

// eslint-disable-next-line @typescript-eslint/no-unused-vars 
export default function dateGroupFn({timestamp}: Message): string {
    throw new Error('not implemented')
    // return created.toLocaleDateString('en-us', {
    //     year: 'numeric',
    //     month: '2-digit',
    //     day: 'numeric'
    // })
}