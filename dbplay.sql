select * from public.users;
select * from chats;
select * from dms;
select * from groups;
select "chatId", content from messages;
select * from memberships;

delete from public.users;
delete from chats;
delete from messages;

INSERT INTO users (username, hashed) VALUES 
    ('user1', 'password'),
    ('user2', 'password'),
    ('user3', 'password');



select id from users where username = 'user1';
select id from users where username = 'user2';



-- create dm
with id as (
    insert into chats("isDm") values (true) returning id
), user1 as (
    select id from users where username='user1'
), user2 as (
    select id from users where username='user2'
)
insert into dms(id, "user1Id", "user2Id") values (
    (select * from id),
    (select * from user1),
    (select * from user2)
);

-- create group
with id as (
    insert into chats("isDm") values (false) returning id
)
insert into groups(id, name) values (
    (select * from id),
    'dudes'
);


-- create group and membership
with id as (
    insert into chats("isDm") values (false) returning id
), gr as (
    insert into groups(id, name) values (
        (select * from id),
        'dudes'
    ) returning id, name, created
), user1 as (
    select id from users where username = 'user1'
), member as (
    insert into memberships ("groupId", "userId", "isAdmin") values (
        (select * from id),
        (select * from user1),
        true
    ) returning id, "groupId", "userId", "isAdmin", created
)
select gr.id as group_id, gr.name, gr.created as group_created, member.id as member_id, member."groupId", member."userId", member."isAdmin", member.created as member_created
from gr 
join member on gr.id = member."groupId";

(select * from gr) 
union 
(select * from member);



insert into groups(id, name) values (
    (select * from id),
    'dudes'
);




-- make dm messages
select id from users where username = 'user1';
select id from users where username = 'user2';

with user1 as (
    select id from users where username = 'user1'
), user2 as (
    select id from users where username = 'user2'
), chatid as (
    select id from dms where "user1Id" = (select * from user1) and "user2Id" = (select * from user2)
)
-- select * from chatid;
insert into messages ("chatId", "userId", "content") values
    ( (select * from chatid), (select * from user1), 'hey' ),
    ( (select * from chatid), (select * from user2), 'dude' ),
    ( (select * from chatid), (select * from user1), 'whats' ),
    ( (select * from chatid), (select * from user2), 'up' );


-- insert memberships
with user1 as (
    select id from users where username = 'user1'
), user2 as (
    select id from users where username = 'user2'
), groupid as (
    select id from groups where name='dudes'
)
insert into memberships ("userId", "groupId", "created") values 
    ( (select * from user1), (select * from groupid), '1999-12-01'),
    ( (select * from user2), (select * from groupid), '2001-01-01');




-- make group messages
with user1 as (
    select id from users where username = 'user1'
), user2 as (
    select id from users where username = 'user2'
), groupid as (
    select id from groups where name='dudes'
)
insert into messages("chatId", "userId", "content", "created") VALUES
    ( (select * from groupid), (select * from user1), 'one', '2000-01-01'),
    ( (select * from groupid), (select * from user1), 'two', '2000-01-02'),
    ( (select * from groupid), (select * from user1), 'three', '2000-01-03'),
    ( (select * from groupid), (select * from user1), 'four', '2000-01-04'),
    ( (select * from groupid), (select * from user2), 'five', '2002-01-04'),
    ( (select * from groupid), (select * from user1), 'six', '2002-01-04');

 
-- get messages

with user1 as (
    select id from users where username = 'user1'
), user2 as (
    select id from users where username = 'user2'
), dmid as (
    select id from dms where "user1Id" = (select * from user1) and "user2Id" = (select * from user2)
), groupid as (
    select id from groups where name='dudes'
), date1 as (
    select created from memberships where memberships."userId" = (select * from user1)
), date2 as (
    select created from memberships where memberships."userId" = (select * from user2)
)
-- select * from date2;
-- select * from date1;
select "messages".content 
from messages 
inner join chats on chats.id = messages."chatId"
where 
    (messages."chatId" = (select * from dmid)) AND (
        (select "isDm" from chats where chats.id = (select * from dmid))
        OR
        (messages.created >= (select * from date2))
    );
