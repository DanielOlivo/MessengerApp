export interface AsyncQueue {
    enqueue<T>(task: () => Promise<T>): Promise<T>
    count: number
}

export class AsyncTaskQueue implements AsyncQueue {

    /* eslint-disable @typescript-eslint/no-explicit-any */
    private last: Promise<any> = Promise.resolve()
    count: number = 0

    public enqueue<T>(task: () => Promise<T>): Promise<T> {
        this.count += 1
        const taskPromise = this.last.then(() => task())
            .finally(() => {
                this.count -= 1
            })
        this.last = taskPromise.catch(() => {})
        return taskPromise
    }
}