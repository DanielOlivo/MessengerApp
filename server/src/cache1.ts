import dayjs from 'dayjs'

type Label = string
type ID = string
type Status = 'c' | 'u' | 'd'

interface Item<T extends object> {
    data: T
    labels: Set<string>
}

export function getCache<T extends object>(getIdFn: (item: T) => ID){

    // how to define lifetime

    const now = () => dayjs().valueOf()
    const map = new Map<ID, T>() 
    const labels = new Map<ID, Set<Label>>()
    const allLabels = new Set<Label>()
    const requests = new Map<Label, number>()
    const status = new Map<ID, Status>()

    const getAllLabels = () => new Set( allLabels )
    const getReqTimestamp = (label: Label) => requests.get(label)
    const getLifeTime = () => { throw new Error() }

    const count = (st?: Status) => {
        if(!st){
            return map.size
        }
        let i = 0
        for(const s of status.values()){
            if(s === st){
                i += 1
            }
        }
        return i
    }

    const get = async (label: Label, fn: () => Promise<T[]>): Promise<T[]> => {
        if(allLabels.has(label)){
            requests.set(label, now())            
            return Array.from( map.keys() )
                .filter(id => labels.get(id)!.has(label))
                .map(id => map.get(id)!)
        }

        const extracted = await fn()
        const result: T[] = []
        for(const item of extracted){
            const id = getIdFn(item)
            if(!map.has(id)){
                map.set(id, item)
                result.push(item)
            }
            else {
                result.push(map.get(id)!)
            }

            if(!labels.has(id)){
                labels.set(id, new Set())
            }
            labels.get(id)!.add(label)

        }
        allLabels.add(label)
        requests.set(label, now())

        return result
    }

    // customLabels - dirty hack
    const create = (item: T, customLabels?: string[]) => {
        const id = getIdFn(item)
        status.set(id, 'c')
        map.set(id, item)
        const label = 'create=' + id
        let _labels = [ label ]
        if(customLabels){
            _labels = _labels.concat(customLabels)
        }
        for(const l of _labels){
            allLabels.add(l)
            requests.set(l, now())
        } 
        labels.set(id, new Set(_labels))
    }

    const updateLocal = (item: T, lbls?: string[]): void => {
        const id = getIdFn(item)
        if(!map.has(id)){
            throw new Error(`item with id ${id} not found`)
        }
        if(status.has(id) && status.get(id) === 'd'){
            throw new Error(`item with id ${id} is scheduled for removal`)
        }

        map.set(id, item)

        if(!status.has(id)){
            status.set(id, 'u')
        }

        if(lbls){
            for(const lbl of lbls){
                requests.set(lbl, now())
            }
        }
    }

    return { get, create, getAllLabels, getReqTimestamp, count, getLifeTime, updateLocal }
}