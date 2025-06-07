export class AsyncTaskQueue {

    /* eslint-disable @typescript-eslint/no-explicit-any */
    private last: Promise<any> = Promise.resolve()
    public enqueue<T>(task: () => Promise<T>): Promise<T> {

        const taskPromise = this.last.then(() => task())
        this.last = taskPromise.catch(() => {})
        return taskPromise
    }
}