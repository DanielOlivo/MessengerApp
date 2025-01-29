import conf, { Conf } from '../knexfile'
import {knex, Knex} from 'knex'

const environment = process.env.NODE_ENV || 'production' // 'development' 
const config = conf[environment as keyof Conf] as Knex.Config

export default knex(config)