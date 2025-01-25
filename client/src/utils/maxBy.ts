export default function maxBy<T>(arr: T[], fn: (a: T) => number) {
    if(arr.length == 1){
        return arr[0]
    }

    const [first, ...rest] = arr

    return rest.reduce((current, item) => fn(current) > fn(item) ? current : item, first)
}