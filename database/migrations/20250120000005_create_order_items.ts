import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table
      .integer('order_id')
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.integer('menu_id').notNullable().references('id').inTable('menus');
    table.string('menu_name', 100).notNullable();
    table.integer('quantity').notNullable().checkPositive();
    table.integer('unit_price').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('order_id', 'idx_order_items_order');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_items');
}
