import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('menus', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.integer('price').notNullable().checkPositive();
    table.string('category', 50).notNullable();
    table.text('description').nullable();
    table.string('image_url', 255).nullable();
    table.integer('display_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('category', 'idx_menus_category');
    table.index('name', 'idx_menus_name');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('menus');
}
