import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

    await knex.schema.createTable('users', table => {
        table.uuid('id').primary()
        table.string('username').notNullable().unique()
        table.string('hash').notNullable()
        table.string('iconSrc')
        table.date('created').notNullable()
    })

    await knex.schema.createTable('chats', table => {
        table.uuid('id').primary()
        table.boolean('isGroup').notNullable()
        table.date('created').notNullable()
    }) 

    await knex.schema.createTable('chatinfo', table => {
        table.uuid('id').primary()
        table.uuid('chatId').notNullable()
        table.string('name')
        table.string('iconSrc')

        table.foreign('chatId').references('id').inTable('chats').onDelete('CASCADE')
    })

    await knex.schema.createTable('pins', table => {
        table.uuid('id').primary() 
        table.uuid('chatId').notNullable()
        table.uuid('userId').notNullable()
        table.boolean('pinned').notNullable()

        table.foreign('chatId').references('id').inTable('chats').onDelete('CASCADE')
        table.foreign('userId').references('id').inTable('users').onDelete('CASCADE')
    })

    await knex.schema.createTable('memberships', table => {
        table.uuid('id').primary()
        table.uuid('userId').notNullable()
        table.uuid('chatId').notNullable()
        table.boolean('isAdmin').notNullable()
        table.date('created').notNullable()

        table.foreign('chatId').references('id').inTable('chats').onDelete('CASCADE')
        table.foreign('userId').references('id').inTable('users').onDelete('CASCADE')
    })

    await knex.schema.createTable('messages', table => {
        table.uuid('id').primary()
        table.uuid('chatId').notNullable()
        table.uuid('userId').notNullable()
        table.string('content').notNullable()
        table.date('timestamp').notNullable()
    }) 
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('messages')
    await knex.schema.dropTableIfExists('pins')
    await knex.schema.dropTableIfExists('memberships')
    await knex.schema.dropTableIfExists('chatinfo')
    await knex.schema.dropTableIfExists('chats')
    await knex.schema.dropTableIfExists('users')
}