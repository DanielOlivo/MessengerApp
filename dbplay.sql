select * from public.users;
select * from chats;
select * from dms;
select * from groups;
select "chatId", content from messages;
select * from memberships;
select * from unread;

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
from gr, member;


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


-- change the role
with user1 as (
    select id from users where username='user1'
), 
user2 as (
    select id from users where username='user2'
),
gr as (
    select id from groups where name='dudes'
),
adminaction as (
    select "isAdmin" 
    from memberships 
    where 
        "userId"=(select * from user1) and "groupId"=(select * from gr)
)

-- WITH ranked_messages AS (
--   SELECT m.*, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id DESC) AS rn
--   FROM messages AS m
-- )
-- SELECT * FROM ranked_messages WHERE rn = 1;


-- selecting last 
with user1 as (
    select id from users where username = 'user1'
)
-- select * from user1;
, dmids as (
    select id from dms where "user1Id"=(select * from user1) or "user2Id" = (select * from user1)
)
-- select * from dmids;
, dmnames as (
    select "dmId" as "chatId", username as "chatName"
    from "users"
    join 
        (select id as "dmId", 
        case when "user1Id" = (select * from user1) then "user2Id"
        else "user1Id"
        end as "userId"
        from (select * from dms where "id" in (select * from dmids)))
    on "userId" = users.id
)
-- select * from dmnames;
, groupids as (
    select "groupId" from memberships where "userId" = (select * from user1)
)
-- select * from groupids union select * from dmids;
, groupnames as (
    select id as "chatId", name as "chatName"
    from groups 
    where "id" in (select * from groupids)
)
, chatnames as (
    select * from dmnames union select * from groupnames
)
, allids as (
    select * from dmids union select * from groupids
)
-- select * from groupnames;
-- select * from allids;
, last_messages as (
    select m.*, ROW_NUMBER() OVER (PARTITION by "chatId" order by created desc) as rn
    from (select * from messages where "chatId" in (select * from allids)) as m
)
select content, "chatName", lm."chatId", username
from (select * from last_messages where rn=1) as lm
join chatnames on chatnames."chatId"=lm."chatId"
join users on users.id=lm."userId";

select 
    id,
    content,
    "chatName"
from last_messages where rn=1
join (select * from chatnames) on chatnames."chatId"=last_messages."chatId";


-- return chat messages
with chatid as (
    select id from groups limit 1
)
, user1 as (
    select id from users where username='user1'
)
, unseen as (
    select "messageId" from unread where "userId"=(select * from user1) 
)
-- select * from chatid;
select 
    content, username, m.created,
    case when m."userId"=(select * from user1) then true else false end as "isOnwer",
    case when m.id in (select * from unseen) then true else false end as "unread"
from (select * from messages where "chatId"=(select * from chatid)) as m
join users on m."userId"=users.id
order by m.created asc;


-- is it possible to insert 0 values?

with usrs as (
    select username, hashed from users where username='user100'
)
-- select * from usrs;
insert into users (username, hashed)  (select * from usrs);


select * from unread;
select * from messages;


-- return chat list (count of unread included)
with user1 as (
    select id from users where username = 'user1'
)
, dmids as (
    select id from dms where "user1Id"=(select * from user1) or "user2Id" = (select * from user1)
)
, dmnames as (
    select "dmId" as "chatId", username as "chatName"
    from "users"
    join 
        (select id as "dmId", 
        case when "user1Id" = (select * from user1) then "user2Id"
        else "user1Id"
        end as "userId"
        from (select * from dms where "id" in (select * from dmids)))
    on "userId" = users.id
)
, groupids as (
    select "groupId" from memberships where "userId" = (select * from user1)
)
, groupnames as (
    select id as "chatId", name as "chatName"
    from groups 
    where "id" in (select * from groupids)
)
, chatnames as (
    select * from dmnames union select * from groupnames
)
, allids as (
    select * from dmids union select * from groupids
)
, last_messages as (
    select m.*, ROW_NUMBER() OVER (PARTITION by "chatId" order by created desc) as rn
    from (select * from messages where "chatId" in (select * from allids)) as m
)
,unseen as (
    with msgs as (
        select m.*, ROW_NUMBER() OVER (PARTITION by "chatId" order by created asc) as rn
        from (select * from messages) as m
    )
    , counts as (
        select "chatId", count(id) as count from messages group by "chatId"
    )
    select counts."chatId", counts.count, msgs.rn as first_unread,
        case when msgs.rn is null then 0 else counts.count-msgs.rn+1 end as "unreadCount"
     from msgs
    right join unread on "messageId"=msgs.id
    full join counts on counts."chatId"=msgs."chatId"
)
select content, "chatName", lm."chatId", username, "unreadCount"
from (select * from last_messages where rn=1) as lm
join chatnames on chatnames."chatId"=lm."chatId"
join users on users.id=lm."userId"
full join unseen on unseen."chatId"=lm."chatId";



with msgs as (
    select m.*, ROW_NUMBER() OVER (PARTITION by "chatId" order by created asc) as rn
    from (select * from messages) as m
)
, counts as (
    select "chatId", count(id) as count from messages group by "chatId"
)
select counts."chatId", counts.count, msgs.rn as first_unread from msgs
right join unread on "messageId"=msgs.id
full join counts on counts."chatId"=msgs."chatId";


with counts as (
    select "chatId", count(id) as count from messages group by "chatId"
)
select messages."chatId", count, "messageId" from unread 
left join messages on "messageId"=messages.id
left join counts on counts."chatId"=messages."chatId";

-- to add to socketController

-- get count of unread
with group_id as (
    select id from groups where name='dudes'
)
, chat_msgs as (
    select id, content, row_number() over() as idx from messages where "chatId"=(select * from group_id) order by created asc
) 
, total_count as (
    select count(id) as count from chat_msgs
)
, unread_idx as (
    select idx
    from chat_msgs
    right join unread on unread."messageId"=chat_msgs.id
)
select count, idx from total_count, unread_idx;


-- send message with checking if user is a member
with user4 as (select id from users where username='user4')
, user1 as (select id from users where username='user1')
-- select * from user4;
, group_id as (select id from groups where name='dudes')
-- select * from group_id;
, is_member as (
    select case when count=0 then false else true end as is_member
    from 
    (select count(id) from memberships where "userId"=(select * from user1) and "groupId"=(select * from group_id))
)
-- select * from is_member;
, to_insert as (
    select us.id as "userId", group_id.id as "chatId", 'message!!!' as content from user4 as us , group_id
    where (select * from is_member)
)
insert into messages ("userId", "chatId", content)
(select * from to_insert)
returning *;