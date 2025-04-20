import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

    await knex.schema.createTable('users', table => {

        table.uuid('id').notNullable().primary().defaultTo(knex.fn.uuid())
        table.string('username').unique().notNullable()
        table.string('hashed').notNullable()
        table.string('bio')
        table.timestamp('created').notNullable().defaultTo(knex.fn.now())

    })

    await knex.schema.createTable('chats', table => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid())
        table.boolean('isDm').notNullable()
        table.timestamp('created').defaultTo(knex.fn.now())
    })

    await knex.schema.createTable('chatNames', table => {
        table.increments('id').primary()

        table.uuid('chatId').notNullable()
        table.uuid('userId').notNullable()
        table.string("name").notNullable()

        table.foreign('chatId').references('id').inTable("chats").onDelete("CASCADE")
        table.foreign("userId").references("id").inTable('users').onDelete("CASCADE")
    })

    await knex.schema.createTable('dms', table => {
        table.increments('dmId').primary()

        table.uuid('id').unique().notNullable()

        table.uuid('user1Id').notNullable()
        table.uuid('user2Id').notNullable()
        table.timestamp('created').notNullable().defaultTo(knex.fn.now())

        table.foreign('id').references('id').inTable('chats').onDelete('CASCADE')
        table.foreign('user1Id').references('id').inTable('users').onDelete('CASCADE')
        table.foreign('user2Id').references('id').inTable('users').onDelete('CASCADE')

    })

    await knex.schema.createTable('groups', table => {
        table.increments('groupId').primary()

        table.uuid('id').notNullable().unique()
        table.string('name')
        table.timestamp('created').notNullable().defaultTo(knex.fn.now())

        table.foreign('id').references('id').inTable('chats').onDelete('CASCADE')
    })

    await knex.schema.createTable('memberships', table => {

        table.uuid('id').primary().defaultTo(knex.fn.uuid())
        table.uuid('groupId').notNullable()
        table.uuid('userId').notNullable()
        table.boolean('isAdmin').defaultTo(false)
        table.timestamp('created').defaultTo(knex.fn.now())

        table.foreign('userId').references('id').inTable('users').onDelete('CASCADE')
        table.foreign('groupId').references('id').inTable('groups').onDelete('CASCADE')
    })

    await knex.schema.createTable('messages', table => {
        table.uuid('id').notNullable().primary().defaultTo(knex.fn.uuid())

        table.uuid('userId').notNullable()
        table.uuid('chatId').notNullable()
        table.string('content').notNullable()
        table.timestamp('created').notNullable().defaultTo(knex.fn.now())
        table.boolean('read').notNullable().defaultTo(false)

        table.foreign('userId').references('id').inTable('users').onDelete('CASCADE')
        table.foreign('chatId').references('id').inTable('chats').onDelete('CASCADE')
    })

    // await knex.schema.createTable('unread', table => {
    //     table.uuid('id').primary().defaultTo(knex.fn.uuid())

    //     table.uuid('userId').notNullable()
    //     table.uuid('messageId').notNullable()

    //     table.foreign('userId').references('id').inTable('users').onDelete('CASCADE')
    //     table.foreign('messageId').references('id').inTable('messages').onDelete('CASCADE')
    // })

}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('unread')
    await knex.schema.dropTableIfExists('messages')
    await knex.schema.dropTableIfExists('memberships')
    await knex.schema.dropTableIfExists('chatNames')
    await knex.schema.dropTableIfExists('groups')
    await knex.schema.dropTableIfExists('dms')
    await knex.schema.dropTableIfExists('chats')
    await knex.schema.dropTableIfExists('users')
}

