import db from '../config/db'

export default {
    search
}

export function search (criteria: string) {
    return db('users').whereLike('username', '%' + criteria + '%').select('id', 'username')
}