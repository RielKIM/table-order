import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('store_id', 50).notNullable();
    table.string('username', 50).notNullable();
    table.string('hashed_password', 255).notNullable();
    table.integer('failed_attempts').defaultTo(0);
    table.timestamp('locked_until').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['store_id', 'username']);
    table.index(['store_id', 'username'], 'idx_users_store_username');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
