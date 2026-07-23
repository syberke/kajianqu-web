begin;

-- Foreign-key indexes keep joins and cascading deletes predictable as data grows.
create index if not exists asatidz_documents_asatidz_id_idx on public.asatidz_documents(asatidz_id);
create index if not exists asatidz_documents_reviewed_by_idx on public.asatidz_documents(reviewed_by);
create index if not exists expertise_tags_created_by_idx on public.expertise_tags(created_by);
create index if not exists asatidz_expertise_tag_id_idx on public.asatidz_expertise(tag_id);
create index if not exists materials_published_by_idx on public.materials(published_by);
create index if not exists material_versions_created_by_idx on public.material_versions(created_by);
create index if not exists material_reviews_material_id_idx on public.material_reviews(material_id);
create index if not exists material_reviews_reviewer_id_idx on public.material_reviews(reviewer_id);
create index if not exists quiz_options_question_id_idx on public.quiz_options(question_id);
create index if not exists quiz_answers_attempt_id_idx on public.quiz_answers(attempt_id);
create index if not exists quiz_answers_question_id_idx on public.quiz_answers(question_id);
create index if not exists quiz_answers_selected_option_id_idx on public.quiz_answers(selected_option_id);
create index if not exists quran_practice_segments_session_id_idx on public.quran_practice_segments(session_id);
create index if not exists private_classes_asatidz_id_idx on public.private_classes(asatidz_id);
create index if not exists class_members_user_id_idx on public.class_members(user_id);
create index if not exists class_sessions_class_id_idx on public.class_sessions(class_id);
create index if not exists class_announcements_class_id_idx on public.class_announcements(class_id);
create index if not exists class_announcements_author_id_idx on public.class_announcements(author_id);
create index if not exists chat_rooms_class_id_idx on public.chat_rooms(class_id);
create index if not exists chat_rooms_created_by_idx on public.chat_rooms(created_by);
create index if not exists chat_room_members_user_id_idx on public.chat_room_members(user_id);
create index if not exists chat_messages_sender_id_idx on public.chat_messages(sender_id);
create index if not exists chat_messages_reply_to_id_idx on public.chat_messages(reply_to_id);
create index if not exists chat_attachments_message_id_idx on public.chat_attachments(message_id);
create index if not exists live_events_asatidz_id_idx on public.live_events(asatidz_id);
create index if not exists donation_transactions_program_id_idx on public.donation_transactions(program_id);
create index if not exists donation_transactions_donor_id_idx on public.donation_transactions(donor_id);
create index if not exists donation_transactions_reviewed_by_idx on public.donation_transactions(reviewed_by);
create index if not exists donation_proofs_transaction_id_idx on public.donation_proofs(transaction_id);
create index if not exists fees_material_id_idx on public.fees(material_id);
create index if not exists fees_asatidz_id_idx on public.fees(asatidz_id);
create index if not exists fees_decided_by_idx on public.fees(decided_by);
create index if not exists payouts_asatidz_id_idx on public.payouts(asatidz_id);
create index if not exists payouts_created_by_idx on public.payouts(created_by);
create index if not exists payout_items_fee_id_idx on public.payout_items(fee_id);
create index if not exists payout_proofs_payout_id_idx on public.payout_proofs(payout_id);
create index if not exists payout_proofs_uploaded_by_idx on public.payout_proofs(uploaded_by);
create index if not exists daily_prayers_category_id_idx on public.daily_prayers(category_id);
create index if not exists bahtsul_topics_author_id_idx on public.bahtsul_topics(author_id);
create index if not exists bahtsul_answers_topic_id_idx on public.bahtsul_answers(topic_id);
create index if not exists bahtsul_answers_author_id_idx on public.bahtsul_answers(author_id);
create index if not exists muamalat_topics_author_id_idx on public.muamalat_topics(author_id);
create index if not exists muamalat_answers_topic_id_idx on public.muamalat_answers(topic_id);
create index if not exists muamalat_answers_author_id_idx on public.muamalat_answers(author_id);
create index if not exists quotes_author_id_idx on public.quotes(author_id);
create index if not exists retrospectives_asatidz_id_idx on public.retrospectives(asatidz_id);
create index if not exists user_achievements_achievement_id_idx on public.user_achievements(achievement_id);
create index if not exists user_achievements_awarded_by_idx on public.user_achievements(awarded_by);
create index if not exists reports_reporter_id_idx on public.reports(reporter_id);
create index if not exists moderation_actions_report_id_idx on public.moderation_actions(report_id);
create index if not exists moderation_actions_moderator_id_idx on public.moderation_actions(moderator_id);
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists idempotency_keys_owner_id_idx on public.idempotency_keys(owner_id);
create index if not exists user_roles_granted_by_idx on public.user_roles(granted_by);

-- Merge admin access into user/public read policies so each role/action has one
-- permissive policy. Admin mutation policies are action-specific.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'student_profiles','expertise_tags','donation_programs','daily_prayers',
    'dhikr_items','quotes','retrospectives','achievements','live_events',
    'quran_practice_segments','chat_rooms','chat_room_members','chat_messages',
    'chat_attachments','donation_transactions','donation_proofs'
  ]
  loop
    execute format('drop policy if exists admin_full_access on public.%I', table_name);
  end loop;
end $$;

drop policy if exists student_profiles_own_select on public.student_profiles;
drop policy if exists student_profiles_own_insert on public.student_profiles;
drop policy if exists student_profiles_own_update on public.student_profiles;
create policy student_profiles_own_select on public.student_profiles
  for select to authenticated using ((select auth.uid()) = id or (select private.is_admin()));
create policy student_profiles_own_insert on public.student_profiles
  for insert to authenticated with check ((select auth.uid()) = id or (select private.is_admin()));
create policy student_profiles_own_update on public.student_profiles
  for update to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()))
  with check ((select auth.uid()) = id or (select private.is_admin()));
create policy student_profiles_admin_delete on public.student_profiles
  for delete to authenticated using ((select private.is_admin()));

drop policy if exists expertise_tags_public_read on public.expertise_tags;
drop policy if exists donation_programs_public_read on public.donation_programs;
drop policy if exists daily_prayers_public_read on public.daily_prayers;
drop policy if exists dhikr_items_public_read on public.dhikr_items;
drop policy if exists quotes_public_read on public.quotes;
drop policy if exists retrospectives_public_read on public.retrospectives;
drop policy if exists achievements_public_read on public.achievements;
drop policy if exists live_events_public_read on public.live_events;

create policy expertise_tags_anon_read on public.expertise_tags
  for select to anon using (is_active = true);
create policy expertise_tags_authenticated_read on public.expertise_tags
  for select to authenticated using (is_active = true or (select private.is_admin()));
create policy donation_programs_anon_read on public.donation_programs
  for select to anon using (is_active = true);
create policy donation_programs_authenticated_read on public.donation_programs
  for select to authenticated using (is_active = true or (select private.is_admin()));
create policy daily_prayers_anon_read on public.daily_prayers
  for select to anon using (is_published = true);
create policy daily_prayers_authenticated_read on public.daily_prayers
  for select to authenticated using (is_published = true or (select private.is_admin()));
create policy dhikr_items_anon_read on public.dhikr_items
  for select to anon using (is_published = true);
create policy dhikr_items_authenticated_read on public.dhikr_items
  for select to authenticated using (is_published = true or (select private.is_admin()));
create policy quotes_anon_read on public.quotes
  for select to anon using (is_published = true);
create policy quotes_authenticated_read on public.quotes
  for select to authenticated using (is_published = true or (select private.is_admin()));
create policy retrospectives_anon_read on public.retrospectives
  for select to anon using (is_published = true);
create policy retrospectives_authenticated_read on public.retrospectives
  for select to authenticated using (is_published = true or (select private.is_admin()));
create policy achievements_anon_read on public.achievements
  for select to anon using (is_active = true);
create policy achievements_authenticated_read on public.achievements
  for select to authenticated using (is_active = true or (select private.is_admin()));
create policy live_events_anon_read on public.live_events
  for select to anon using (visibility = 'public' and status <> 'cancelled');
create policy live_events_authenticated_read on public.live_events
  for select to authenticated using (
    (visibility = 'public' and status <> 'cancelled') or (select private.is_admin())
  );

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'expertise_tags','donation_programs','daily_prayers','dhikr_items',
    'quotes','retrospectives','achievements','live_events'
  ]
  loop
    execute format(
      'create policy admin_insert on public.%I for insert to authenticated with check ((select private.is_admin()))',
      table_name
    );
    execute format(
      'create policy admin_update on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      table_name
    );
    execute format(
      'create policy admin_delete on public.%I for delete to authenticated using ((select private.is_admin()))',
      table_name
    );
  end loop;
end $$;

drop policy if exists quran_segments_own_read on public.quran_practice_segments;
drop policy if exists quran_segments_own_insert on public.quran_practice_segments;
create policy quran_segments_own_read on public.quran_practice_segments
  for select to authenticated using (
    (select private.is_admin()) or exists (
      select 1 from public.quran_sessions
      where quran_sessions.id = quran_practice_segments.session_id
        and quran_sessions.user_id = (select auth.uid())
    )
  );
create policy quran_segments_own_insert on public.quran_practice_segments
  for insert to authenticated with check (
    (select private.is_admin()) or exists (
      select 1 from public.quran_sessions
      where quran_sessions.id = quran_practice_segments.session_id
        and quran_sessions.user_id = (select auth.uid())
    )
  );
create policy quran_segments_admin_update on public.quran_practice_segments
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy quran_segments_admin_delete on public.quran_practice_segments
  for delete to authenticated using ((select private.is_admin()));

drop policy if exists chat_rooms_member_read on public.chat_rooms;
drop policy if exists chat_members_member_read on public.chat_room_members;
drop policy if exists chat_messages_member_read on public.chat_messages;
drop policy if exists chat_messages_member_insert on public.chat_messages;
drop policy if exists chat_attachments_member_read on public.chat_attachments;
create policy chat_rooms_member_read on public.chat_rooms
  for select to authenticated using (
    (select private.is_admin()) or (select private.is_room_member(id))
  );
create policy chat_members_member_read on public.chat_room_members
  for select to authenticated using (
    (select private.is_admin()) or (select private.is_room_member(room_id))
  );
create policy chat_messages_member_read on public.chat_messages
  for select to authenticated using (
    (select private.is_admin()) or (select private.is_room_member(room_id))
  );
create policy chat_messages_member_insert on public.chat_messages
  for insert to authenticated with check (
    (select private.is_admin())
    or (sender_id = (select auth.uid()) and (select private.is_room_member(room_id)))
  );
create policy chat_attachments_member_read on public.chat_attachments
  for select to authenticated using (
    (select private.is_admin()) or exists (
      select 1 from public.chat_messages
      where chat_messages.id = chat_attachments.message_id
        and (select private.is_room_member(chat_messages.room_id))
    )
  );

do $$
declare
  table_name text;
begin
  foreach table_name in array array['chat_rooms','chat_room_members','chat_messages','chat_attachments']
  loop
    execute format(
      'create policy admin_update on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      table_name
    );
    execute format(
      'create policy admin_delete on public.%I for delete to authenticated using ((select private.is_admin()))',
      table_name
    );
  end loop;
end $$;
create policy chat_rooms_admin_insert on public.chat_rooms
  for insert to authenticated with check ((select private.is_admin()));
create policy chat_room_members_admin_insert on public.chat_room_members
  for insert to authenticated with check ((select private.is_admin()));
create policy chat_attachments_admin_insert on public.chat_attachments
  for insert to authenticated with check ((select private.is_admin()));

drop policy if exists donation_transactions_own_read on public.donation_transactions;
drop policy if exists donation_transactions_own_insert on public.donation_transactions;
drop policy if exists donation_proofs_own_read on public.donation_proofs;
create policy donation_transactions_own_read on public.donation_transactions
  for select to authenticated using (
    donor_id = (select auth.uid()) or (select private.is_admin())
  );
create policy donation_transactions_own_insert on public.donation_transactions
  for insert to authenticated with check (
    donor_id = (select auth.uid()) or (select private.is_admin())
  );
create policy donation_transactions_admin_update on public.donation_transactions
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy donation_transactions_admin_delete on public.donation_transactions
  for delete to authenticated using ((select private.is_admin()));
create policy donation_proofs_own_read on public.donation_proofs
  for select to authenticated using (
    (select private.is_admin()) or exists (
      select 1 from public.donation_transactions
      where donation_transactions.id = donation_proofs.transaction_id
        and donation_transactions.donor_id = (select auth.uid())
    )
  );
create policy donation_proofs_own_insert on public.donation_proofs
  for insert to authenticated with check (
    (select private.is_admin()) or exists (
      select 1 from public.donation_transactions
      where donation_transactions.id = donation_proofs.transaction_id
        and donation_transactions.donor_id = (select auth.uid())
    )
  );
create policy donation_proofs_admin_update on public.donation_proofs
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy donation_proofs_admin_delete on public.donation_proofs
  for delete to authenticated using ((select private.is_admin()));

commit;
