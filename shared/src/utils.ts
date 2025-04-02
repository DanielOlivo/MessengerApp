export function wait(ms: number){
    return new Promise(res => setTimeout(res, ms))
}

// export function repeat(ms: number, fn: () => void){
             
// }