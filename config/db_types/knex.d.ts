// all types into a single namespace 'DB'.
import type * as DB from './tables'

// for the SchemaBuilder.
import type { Tables } from 'knex/types/tables'

// === PART 1: QUERY BUILDER ==============================================
declare module 'knex/types/tables' {
  interface Tables {
    // === TABLES ===
    users: DB.User
  }
}

// === PART 2: SCHEMA BUILDER =============================================
declare module 'knex' {
  namespace Knex {
    interface SchemaBuilder {
      hasTable(tableName: keyof Tables): Promise<boolean>

      dropTable(tableName: keyof Tables): Knex.SchemaBuilder

      dropTableIfExists(tableName: keyof Tables): Knex.SchemaBuilder

      renameTable(from: keyof Tables, to: string): Knex.SchemaBuilder

      alterTable(from: keyof Tables, to: string): Knex.SchemaBuilder

      // The `table` method is used for altering existing tables.
      table<TTableName extends keyof Tables>(
        tableName: TTableName,
        callback: (tableBuilder: Knex.TableBuilder) => any
      ): Knex.SchemaBuilder
    }
  }
}
