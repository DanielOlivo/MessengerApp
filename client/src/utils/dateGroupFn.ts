import { Message } from "@shared/Types"

// eslint-disable-next-line @typescript-eslint/no-unused-vars 
export default function dateGroupFn({created}: Message): string {
    throw new Error('not implemented')
    // return created.toLocaleDateString('en-us', {
    //     year: 'numeric',
    //     month: '2-digit',
    //     day: 'numeric'
    // })
}