import conf from '../../knexfile'
import {knex, Knex} from 'knex'

const environment = process.env.NODE_ENV ||  'development' 
const config = conf[environment] as Knex.Config

export default knex(config)