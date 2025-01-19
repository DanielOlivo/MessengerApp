import {Knex} from 'knex'
import dotenv from 'dotenv'

dotenv.config()

export interface Conf {
  development: Knex.Config,
  test: Knex.Config,
  production: Knex.Config
}

const config: Conf = {

  development: {
    client: 'pg',
    connection: {
      port: Number(process.env.DBPORT),
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBDEV
    },
    migrations: {
      directory: "./config/migrations"
    },
    seeds: {
      directory: "./config/seeds/development"
    }
  },

  test: {
    client: 'pg',
    connection: {
      port: Number(process.env.DBPORT),
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBTEST
    },
    migrations: {
      directory: "./config/migrations"
    },
    seeds: {
      directory: "./config/seeds/test"
    }
  },


  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};

export default config