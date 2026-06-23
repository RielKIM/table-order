import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('order_history', (table) => {
    table.increments('id').primary();
    table.integer('order_id').notNullable();
    table.integer('table_session_id').notNullable();
    table.string('table_number', 10).notNullable();
    table.string('status', 20).notNullable();
    table.integer('total_amount').notNullable();
    table.jsonb('items_snapshot').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('completed_at').notNullable();
    table.timestamp('archived_at').defaultTo(knex.fn.now());
    table.index('table_session_id', 'idx_order_history_session');
    table.index('completed_at', 'idx_order_history_completed');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_history');
}
