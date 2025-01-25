export default function dateGen(){
    const msNow = Date.now()
    let counter = 0
    return function(){
        const dt = new Date(msNow - 1000 * 60 * 60 * 24 * 300 + (1000 * 60 * 60 * 12 * counter++))
        return dt
    }
}