import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table
      .integer('table_session_id')
      .notNullable()
      .references('id')
      .inTable('table_sessions');
    table.string('table_number', 10).notNullable();
    table
      .enu('status', ['pending', 'preparing', 'completed'])
      .notNullable()
      .defaultTo('pending');
    table.integer('total_amount').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index('table_session_id', 'idx_orders_table_session');
    table.index('status', 'idx_orders_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('orders');
}
