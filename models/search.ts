import db from '../config/db'

export const search = (criteria: string) => {
    return db('users').whereLike('username', '%' + criteria + '%').select('id', 'username')
}