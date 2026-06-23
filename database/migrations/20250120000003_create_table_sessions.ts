import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('table_sessions', (table) => {
    table.increments('id').primary();
    table.string('store_id', 50).notNullable();
    table.string('table_number', 10).notNullable();
    table.string('session_token', 255).notNullable().unique();
    table.timestamp('activated_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('completed_at').nullable();
    table.index('session_token', 'idx_table_sessions_token');
    table.index('is_active', 'idx_table_sessions_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('table_sessions');
}
