import knex from 'knex'

export const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DB_LOCAL_URL,
  },
})
