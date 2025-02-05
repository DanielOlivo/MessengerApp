import { Knex } from "knex";
import { v4 as uuid } from "uuid";
import { hash } from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
    await knex('users').del()



    const user1 = await getUser('user1', '1234')
    const user2 = await getUser('user2', '1234')
    const user3 = await getUser('user3', '1234')
    const user4 = await getUser('user4', '1234')
    const user5 = await getUser('user5', '1234')
    const user6 = await getUser('user6', '1234')
    const user7 = await getUser('user7', '1234')
    const user8 = await getUser('user8', '1234')
    const user9 = await getUser('user9', '1234')

    const jane = await getUser('jane.doe', '1234')

    const dmChat = {id: uuid(), isDm: true}
    const dm = {id: dmChat.id, user1Id: user1.id, user2Id: user2.id}


    let janeChats = []
    let janeDms = []
    let msgs = []
    for(const user of [user1, user2, user3, user4, user5, user6, user7, user8, user9]){
        const _chat = {id: uuid(), isDm: true}
        const _dm = {id: _chat.id, user1Id: jane.id, user2Id: user.id}

        janeChats.push(_chat)
        janeDms.push(_dm)
        
        for(let i = 1; i < 10; i++){
            const msg = {
                id: uuid(), 
                userId: i % 2 == 0 ? jane.id : user.id,
                chatId: _chat.id,
                content: `message #${i}`
            }
            msgs.push(msg)
        }
    }
    
    const dudesChat = {id: uuid(), isDm: false}
    const dudes = {id: dudesChat.id, name: 'dudes'}

    const membership1 = {id: uuid(), groupId: dudes.id, userId: user1.id}
    const membership2 = {id: uuid(), groupId: dudes.id, userId: user2.id}
    const membership3 = {id: uuid(), groupId: dudes.id, userId: user3.id}

    const dmMsg1 = {id: uuid(), userId: user1.id, chatId: dm.id, content: 'hey'}
    const dmMsg2 = {id: uuid(), userId: user2.id, chatId: dm.id, content: 'whats up'}

    const dudesMsg1 = {id: uuid(), userId: user1.id, chatId: dudes.id, content: 'first'}
    const dudesMsg2 = {id: uuid(), userId: user2.id, chatId: dudes.id, content: 'second'}
    const dudesMsg3 = {id: uuid(), userId: user3.id, chatId: dudes.id, content: 'third'}

    


    await knex.transaction(async trx => {
        await trx('users').insert([user1, user2, user3, 
            user4, user5, user6, user7, user8, user9, jane])
        await trx('chats').insert([dmChat, dudesChat, ...janeChats])
        await trx('dms').insert([dm, ...janeDms])
        await trx('groups').insert([dudes])
        await trx('memberships').insert([membership1, membership2, membership3])
        await trx('messages').insert([
            dmMsg1, dmMsg2,
            dudesMsg1, dudesMsg2, dudesMsg3, ...msgs
        ])
    })
};

async function getUser(username: string, password: string){
    const saltRounds = 10
    const hashed = await hash(password, saltRounds)
    return {id: uuid(), username, hashed}
}
