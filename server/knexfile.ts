import 'tsconfig-paths/register'
import type { Knex } from "knex";
import dotenv from 'dotenv'
dotenv.config()

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      port: Number(process.env.DBPORT),
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBDEV
    },
    migrations: {
      directory: "./src/config/migrations"
    },
    seeds: {
      directory: "./src/config/seeds/development"
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
      directory: "./src/config/migrations"
    },
    seeds: {
      directory: "./src/config/seeds/test"
    }

  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DBPROD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/config/migrations'
    },
    seeds: {
      directory: "./src/config/seeds/production"
    }
  }

};


// module.exports = config;
export default config
