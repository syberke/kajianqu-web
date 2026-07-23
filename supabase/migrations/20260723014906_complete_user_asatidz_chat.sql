-- Complete the existing user <-> asatidz chat model without introducing a second chat system.

alter table public.conversations
  add column if not exists updated_at timestamptz not null default now();

-- Preserve existing messages by attaching them to the canonical student/asatidz conversation.
with message_pairs as (
  select
    case when sender.role = 'siswa' then message.sender_id else message.receiver_id end as student_id,
    case when sender.role = 'asatidz' then message.sender_id else message.receiver_id end as asatidz_id,
    coalesce(message.created_at, now()) as sent_at
  from public.messages message
  join public.profiles sender on sender.id = message.sender_id
  join public.profiles receiver on receiver.id = message.receiver_id
  where message.conversation_id is null
    and ((sender.role = 'siswa' and receiver.role = 'asatidz')
      or (sender.role = 'asatidz' and receiver.role = 'siswa'))
)
insert into public.conversations (student_id, asatidz_id, created_at, updated_at)
select student_id, asatidz_id, min(sent_at), max(sent_at)
from message_pairs
group by student_id, asatidz_id
on conflict (student_id, asatidz_id) do update
set updated_at = greatest(public.conversations.updated_at, excluded.updated_at);

update public.messages message
set conversation_id = conversation.id
from public.conversations conversation, public.profiles sender
where message.conversation_id is null
  and sender.id = message.sender_id
  and (
    (sender.role = 'siswa' and conversation.student_id = message.sender_id and conversation.asatidz_id = message.receiver_id)
    or
    (sender.role = 'asatidz' and conversation.asatidz_id = message.sender_id and conversation.student_id = message.receiver_id)
  );

create index if not exists conversations_student_updated_idx
  on public.conversations(student_id, updated_at desc);
create index if not exists conversations_asatidz_updated_idx
  on public.conversations(asatidz_id, updated_at desc);
create index if not exists messages_unread_receiver_idx
  on public.messages(receiver_id, created_at desc)
  where is_read = false;

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists conversations_participant_select on public.conversations;
create policy conversations_participant_select
on public.conversations for select to authenticated
using (
  student_id = (select auth.uid())
  or asatidz_id = (select auth.uid())
  or (select app_private.is_admin())
);

drop policy if exists messages_participant_select on public.messages;
create policy messages_participant_select
on public.messages for select to authenticated
using (
  sender_id = (select auth.uid())
  or receiver_id = (select auth.uid())
  or (select app_private.is_admin())
);

-- Read receipts may only be changed by the receiver of the message.
drop policy if exists messages_receiver_mark_read on public.messages;
create policy messages_receiver_mark_read
on public.messages for update to authenticated
using (receiver_id = (select auth.uid()))
with check (receiver_id = (select auth.uid()));

grant select on public.conversations, public.messages to authenticated;
grant update (is_read) on public.messages to authenticated;
