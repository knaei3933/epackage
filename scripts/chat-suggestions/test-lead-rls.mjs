import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const containerName = `chat-lead-rls-${process.pid}`;
const baseDir = path.join(process.cwd(), 'supabase', 'migrations');
const sessionMigration = path.join(baseDir, '20260921000000_create_chat_sessions_and_funnel_events.sql');
const leadMigration = path.join(baseDir, '20260921120000_create_chat_leads_and_contacts.sql');

const run = (command, args = []) => execFileSync(command, args, {
  stdio: ['ignore', 'inherit', 'inherit'],
});

const psql = (sql, { expectFailure = false } = {}) => {
  try {
    execFileSync(
      'docker',
      ['exec', '-i', containerName, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'],
      { input: sql, stdio: ['pipe', 'inherit', 'inherit'] },
    );
    if (expectFailure) throw new Error('EXPECTED_SQL_FAILURE');
    return;
  } catch (error) {
    if (expectFailure && error instanceof Error && error.message === 'EXPECTED_SQL_FAILURE') {
      throw new Error('Expected SQL authorization failure, but it succeeded.');
    }
    if (!expectFailure) throw error;
  }
};

const psqlParallelValue = (sql) => new Promise((resolve, reject) => {
  const child = spawn(
    'docker',
    [
      'exec', '-i', containerName, 'psql', '-v', 'ON_ERROR_STOP=1',
      '-A', '-t', '-F', ',', '-U', 'postgres', '-d', 'postgres',
    ],
    { stdio: ['pipe', 'pipe', 'pipe'] },
  );
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code === 0) {
      resolve(stdout.trim());
    } else {
      reject(new Error(stderr.trim()));
    }
  });
  child.stdin.end(sql);
});

try {
  run('docker', ['run', '--rm', '-d', '--name', containerName, '-e', 'POSTGRES_PASSWORD=postgres', 'postgres:17-alpine']);

  let ready = false;
  for (let attempt = 0; attempt < 40 && !ready; attempt += 1) {
    try {
      execFileSync('docker', ['exec', containerName, 'pg_isready', '-U', 'postgres'], { stdio: 'ignore' });
      ready = true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (!ready) throw new Error('Postgres did not become ready.');

  let databaseReady = false;
  for (let attempt = 0; attempt < 40 && !databaseReady; attempt += 1) {
    try {
      psql('SELECT 1;');
      databaseReady = true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (!databaseReady) throw new Error('Postgres database did not accept queries.');

  psql(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id UUID PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS UUID
    LANGUAGE sql STABLE AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID
    $$;
    CREATE TABLE public.profiles(
      id UUID PRIMARY KEY,
      role TEXT NOT NULL,
      status TEXT NOT NULL
    );
    GRANT SELECT ON public.profiles TO authenticated;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  `);
  psql(fs.readFileSync(sessionMigration, 'utf8'));
  psql(fs.readFileSync(leadMigration, 'utf8'));

  psql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_class WHERE relname IN ('chat_leads','chat_lead_contacts','chat_lead_audit_events','chat_rate_limits','chat_lead_privacy_readiness') AND relrowsecurity) THEN
        RAISE EXCEPTION 'All chat lead tables must enable RLS';
      END IF;
      IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename IN ('chat_lead_contacts','chat_lead_audit_events','chat_rate_limits','chat_lead_privacy_readiness')) THEN
        RAISE EXCEPTION 'Direct client policies are prohibited on sensitive chat lead tables';
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name IN ('chat_leads','chat_lead_contacts','chat_lead_audit_events')
          AND column_name IN ('transcript','message','user_agent','ip_address','pathname')
      ) THEN
        RAISE EXCEPTION 'Prohibited identifier/path/message columns found';
      END IF;
    END $$;
  `);

  psql('SET ROLE anon; SELECT id FROM public.chat_leads;', { expectFailure: true });
  psql('SET ROLE anon; SELECT lead_id FROM public.chat_lead_contacts;', { expectFailure: true });
  psql('SET ROLE anon; SELECT id FROM public.chat_lead_audit_events;', { expectFailure: true });
  psql('SET ROLE anon; SELECT identifier_hash FROM public.chat_rate_limits;', { expectFailure: true });
  psql('SET ROLE anon; SELECT id FROM public.chat_lead_privacy_readiness;', { expectFailure: true });
  psql('SET ROLE authenticated; SELECT lead_id FROM public.chat_lead_contacts;', { expectFailure: true });
  psql('SET ROLE service_role; SELECT lead_id FROM public.chat_lead_contacts;', { expectFailure: true });
  psql('SET ROLE service_role; UPDATE public.chat_leads SET status = \'invalid\';', { expectFailure: true });
  psql('SET ROLE service_role; UPDATE public.chat_lead_contacts SET email = NULL;', { expectFailure: true });
  psql('SET ROLE service_role; UPDATE public.chat_lead_audit_events SET action = \'lead_created\';', { expectFailure: true });
  psql('SET ROLE service_role; UPDATE public.chat_rate_limits SET count = 1;', { expectFailure: true });
  psql('SET ROLE service_role; UPDATE public.chat_lead_privacy_readiness SET schema_version = 1;', { expectFailure: true });
  psql('SET ROLE service_role; SELECT id FROM public.chat_lead_audit_events;', { expectFailure: true });
  psql('SET ROLE service_role; SELECT identifier_hash FROM public.chat_rate_limits;', { expectFailure: true });
  psql('SET ROLE service_role; SELECT id FROM public.chat_lead_privacy_readiness;', { expectFailure: true });

  psql(`
    SET ROLE service_role;
    INSERT INTO public.chat_sessions(id, audience, initial_route_family, expires_at)
    VALUES ('22222222-2222-4222-8222-222222222222', 'member', 'member', NOW() + INTERVAL '1 day');
    RESET ROLE;
    INSERT INTO auth.users(id) VALUES ('33333333-3333-4333-8333-333333333333');
    INSERT INTO public.profiles(id, role, status)
    VALUES ('33333333-3333-4333-8333-333333333333', 'MEMBER', 'ACTIVE');
    INSERT INTO public.chat_leads(
      id, chat_session_id, member_user_id, member_linkage_state,
      member_linkage_consented_at, member_linkage_consent_version,
      intent, contents_description, route_family
    ) VALUES (
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
      'linked', NOW(), 1, 'quote', '粉体の健康食品', 'member'
    );
    INSERT INTO public.chat_lead_contacts(
      lead_id, contact_channel, email, preferred_channel, contact_window,
      contact_consent, privacy_consent, contact_consented_at,
      privacy_consented_at, consent_version, privacy_policy_version,
      retention_due_at
    ) VALUES (
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      'email', 'owner@example.jp', 'email', 'weekday_daytime',
      true, true, NOW(), NOW(), 1, 1, NOW() + INTERVAL '180 days'
    );
  `);

  psql(`
    SET ROLE authenticated;
    SET request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
    SELECT id, member_user_id, status, outcome, updated_at FROM public.chat_leads;
    RESET ROLE;
  `);
  psql(`
    SET ROLE authenticated;
    SET request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
    SELECT intent FROM public.chat_leads;
  `, { expectFailure: true });

  psql(`
    INSERT INTO auth.users(id) VALUES
      ('44444444-4444-4444-8444-444444444444'),
      ('55555555-5555-4555-8555-555555555555');
    INSERT INTO public.profiles(id, role, status) VALUES
      ('44444444-4444-4444-8444-444444444444', 'MEMBER', 'ACTIVE'),
      ('55555555-5555-4555-8555-555555555555', 'ADMIN', 'ACTIVE');
    INSERT INTO public.chat_sessions(id, audience, initial_route_family, expires_at)
    VALUES (
      '66666666-6666-4666-8666-666666666666',
      'member', 'member', NOW() + INTERVAL '1 day'
    );
    INSERT INTO public.chat_sessions(id, audience, initial_route_family, expires_at)
    VALUES (
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'member', 'member', NOW() + INTERVAL '1 day'
    );
    SET ROLE service_role;
    SELECT * FROM public.submit_chat_lead(
      '66666666-6666-4666-8666-666666666666',
      '44444444-4444-4444-8444-444444444444',
      true, 'quote', '粉体の健康食品', '3SKU / 各5000枚',
      '幅120mm×高さ200mm予定', 'アルミバリア・4色印刷', '来月中目安',
      'member', 'email', 'rpc-test@example.jp', NULL, NULL, NULL,
      'email', 'weekday_daytime', true, true, false,
      1, 1, 180, '77777777-7777-4777-8777-777777777777'
    );
    RESET ROLE;
    SET ROLE service_role;
    SELECT * FROM public.submit_chat_lead(
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      '44444444-4444-4444-8444-444444444444',
      true, 'technical', 'ロールフィルム', '300m', NULL, NULL, NULL,
      'member', 'phone', NULL, '050-1793-6500', NULL, NULL,
      'phone', 'unspecified', true, true, false,
      1, 1, 180, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    );
    RESET ROLE;
    SELECT id AS lead_id FROM public.chat_leads
    WHERE chat_session_id = '66666666-6666-4666-8666-666666666666' \\gset

    SET ROLE service_role;
    SELECT * FROM public.get_chat_lead_member_status(
      :'lead_id', '44444444-4444-4444-8444-444444444444',
      '77777777-7777-4777-8777-777777777778'
    );
    SELECT * FROM public.reveal_chat_lead_contact(
      :'lead_id', '55555555-5555-4555-8555-555555555555',
      '77777777-7777-4777-8777-777777777779'
    );
    SELECT * FROM public.update_chat_lead_workflow(
      :'lead_id', '55555555-5555-4555-8555-555555555555',
      'contacted', 'human_followup', 'requested',
      '77777777-7777-4777-8777-777777777780'
    );
    SELECT * FROM public.redact_and_unlink_chat_leads_for_member(
      '44444444-4444-4444-8444-444444444444',
      '77777777-7777-4777-8777-777777777781', 1
    );
    CREATE TEMP TABLE unlink_retry_result AS
    SELECT * FROM public.redact_and_unlink_chat_leads_for_member(
      '44444444-4444-4444-8444-444444444444',
      '77777777-7777-4777-8777-777777777782', 1
    );
    RESET ROLE;

    DO $$
    DECLARE
      v_retry record;
    BEGIN
      SELECT * INTO v_retry FROM unlink_retry_result;
      IF v_retry.unlinked_count <> 0 THEN
        RAISE EXCEPTION 'Account-deletion unlink retry is not idempotent';
      END IF;
    END $$;
    DROP TABLE unlink_retry_result;

    SELECT action, count(*) AS event_count
    FROM public.chat_lead_audit_events
    WHERE lead_id = :'lead_id'::UUID
    GROUP BY action ORDER BY action;
  `);

  const concurrentRateLimit = await Promise.all([
    psqlParallelValue(`SELECT * FROM public.check_chat_lead_rate_limit(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'guest_lead_submit', 1, 60
    );`),
    psqlParallelValue(`SELECT * FROM public.check_chat_lead_rate_limit(
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'guest_lead_submit', 1, 60
    );`),
  ]);
  if (!concurrentRateLimit.some((row) => row.includes('t,1,')) ||
      !concurrentRateLimit.some((row) => row.includes('f,2,'))) {
    throw new Error(`Concurrent durable limiter evidence failed: ${concurrentRateLimit.join(' | ')}`);
  }

  psql(`
    TRUNCATE public.chat_rate_limits;
    INSERT INTO public.chat_rate_limits(identifier_hash, action, window_started_at, count, expires_at)
    VALUES
      ('12121212-1212-4121-8121-121212121211', 'guest_lead_submit', NOW() - INTERVAL '2 hours', 2, NOW() - INTERVAL '1 hour'),
      ('12121212-1212-4121-8121-121212121212', 'member_lead_submit', NOW() - INTERVAL '2 hours', 2, NOW() - INTERVAL '1 hour'),
      ('13131313-1313-4131-8131-131313131311', 'guest_lead_submit', NOW(), 1, NOW() + INTERVAL '1 hour'),
      ('13131313-1313-4131-8131-131313131312', 'member_lead_submit', NOW(), 1, NOW() + INTERVAL '2 hours'),
      ('13131313-1313-4131-8131-131313131313', 'contact_reveal', NOW(), 1, NOW() + INTERVAL '3 hours');
    SET ROLE service_role;
    CREATE TEMP TABLE rate_cleanup_result AS
    SELECT * FROM public.purge_expired_chat_rate_limits(1000, 2);
    RESET ROLE;
    DO $$
    DECLARE
      v_result record;
    BEGIN
      SELECT * INTO v_result FROM rate_cleanup_result;
      IF v_result.deleted_expired <> 2
         OR v_result.deleted_overflow <> 1
         OR v_result.remaining_rows <> 2
         OR v_result.more_work_remaining THEN
        RAISE EXCEPTION 'Unexpected durable limiter cleanup result';
      END IF;
    END $$;
    DROP TABLE rate_cleanup_result;
    SELECT count(*) AS remaining_rate_rows,
           count(*) FILTER (WHERE expires_at < NOW()) AS expired_rate_rows
    FROM public.chat_rate_limits;
  `);

  psql(`
    INSERT INTO public.chat_lead_privacy_readiness(
      id, privacy_approval_record, privacy_policy_version, consent_version,
      contact_retention_days, summary_consent_retention_days,
      audit_retention_days, legacy_resolution, approved_at, schema_version
    ) VALUES (
      1, '88888888-8888-4888-8888-888888888881', 1, 1,
      100, 50, 2555, 'disabled', NOW(), 1
    );
  `, { expectFailure: true });

  psql(`
    INSERT INTO public.chat_leads(
      chat_session_id, intent, contents_description, route_family
    ) VALUES (
      '22222222-2222-4222-8222-222222222222',
      'quote', '電話09012345678', 'member'
    );
  `, { expectFailure: true });

  psql(`
    INSERT INTO public.chat_leads(
      id, chat_session_id, member_linkage_state,
      member_linkage_consented_at, member_linkage_consent_version,
      intent, contents_description, route_family
    ) VALUES (
      'efefefef-efef-4fef-8fef-efefefefefef',
      NULL, 'linked', NOW(), 1, 'quote', '不正なリンク状態', 'member'
    );
  `, { expectFailure: true });

  psql('DELETE FROM auth.users WHERE id = \'33333333-3333-4333-8333-333333333333\';', {
    expectFailure: true,
  });

  psql(`
    INSERT INTO public.chat_leads(
      chat_session_id, intent, contents_description, route_family,
      status, closed_at
    ) VALUES (
      '22222222-2222-4222-8222-222222222222',
      'quote', '通常要件', 'member', 'new', NOW()
    );
  `, { expectFailure: true });

  psql(`
    INSERT INTO public.chat_leads(
      id, chat_session_id, intent, contents_description, route_family
    ) VALUES (
      'cdcdcdcd-cdcd-4dcd-8cdd-cdcdcdcdcdcd',
      NULL,
      'quote', '通常要件', 'member'
    );
    INSERT INTO public.chat_lead_contacts(
      lead_id, contact_channel, email, preferred_channel, contact_window,
      contact_consent, privacy_consent, contact_consented_at,
      privacy_consented_at, consent_version, privacy_policy_version,
      retention_due_at, disposition
    ) VALUES (
      'cdcdcdcd-cdcd-4dcd-8cdd-cdcdcdcdcdcd',
      'email', 'constraint@example.jp', 'email', 'unspecified',
      true, true, NOW(), NOW(), 1, 1, NOW() + INTERVAL '180 days',
      'redacted'
    );
  `, { expectFailure: true });

  psql(`
    CREATE FUNCTION public.temp_fail_chat_lead_audit() RETURNS TRIGGER
    LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.request_id = 'ffffffff-ffff-4fff-8fff-ffffffffffff' THEN
        RAISE EXCEPTION 'intentional audit failure';
      END IF;
      RETURN NEW;
    END;
    $$;
    CREATE TRIGGER temp_chat_lead_audit_fail
      BEFORE INSERT ON public.chat_lead_audit_events
      FOR EACH ROW EXECUTE FUNCTION public.temp_fail_chat_lead_audit();
    INSERT INTO public.chat_sessions(id, audience, initial_route_family, expires_at)
    VALUES ('abababab-abab-4bab-8bab-abababababab', 'public', 'home', NOW() + INTERVAL '1 day');
    SET ROLE service_role;
    SELECT * FROM public.submit_chat_lead(
      'abababab-abab-4bab-8bab-abababababab',
      NULL, false, 'general', '一般相談', NULL, NULL, NULL, NULL,
      'home', 'email', 'rollback@example.jp', NULL, NULL, NULL,
      'email', 'unspecified', true, true, false,
      1, 1, 180, 'ffffffff-ffff-4fff-8fff-ffffffffffff'
    );
  `, { expectFailure: true });
  psql(`
    DROP TRIGGER temp_chat_lead_audit_fail ON public.chat_lead_audit_events;
    DROP FUNCTION public.temp_fail_chat_lead_audit();
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM public.chat_leads
        WHERE chat_session_id = 'abababab-abab-4bab-8bab-abababababab'
      ) OR EXISTS (
        SELECT 1 FROM public.chat_lead_contacts
        WHERE lead_id IN (
          SELECT id FROM public.chat_leads
          WHERE chat_session_id = 'abababab-abab-4bab-8bab-abababababab'
        )
      ) OR EXISTS (
        SELECT 1 FROM public.chat_lead_audit_events
        WHERE request_id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'
      ) THEN
        RAISE EXCEPTION 'Failed submit transaction did not roll back all lead data';
      END IF;
    END $$;
  `);

  psql(`
    INSERT INTO public.chat_lead_privacy_readiness(
      id, privacy_approval_record, privacy_policy_version, consent_version,
      contact_retention_days, summary_consent_retention_days,
      audit_retention_days, legacy_resolution, approved_at, schema_version
    ) VALUES (
      1, '88888888-8888-4888-8888-888888888888', 1, 1,
      1, 30, 31, 'disabled', NOW(), 1
    );
    SET ROLE service_role;
    SELECT * FROM public.check_chat_lead_rate_limit(
      '99999999-9999-4999-8999-999999999999', 'guest_lead_submit', 1, 60
    );
    SELECT * FROM public.check_chat_lead_rate_limit(
      '99999999-9999-4999-8999-999999999999', 'guest_lead_submit', 1, 60
    );
    SELECT * FROM public.check_chat_lead_rate_limit(
      '99999999-9999-4999-8999-999999999999', 'member_lead_submit', 1, 60
    );
    SELECT * FROM public.verify_chat_lead_readiness();
    RESET ROLE;
  `);

  psql(`
    INSERT INTO public.chat_sessions(id, audience, initial_route_family, expires_at)
    VALUES (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'public', 'home', NOW() + INTERVAL '1 day'
    );
    SET ROLE service_role;
    SELECT * FROM public.submit_chat_lead(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      NULL, false, 'sample', 'サンプル希望', '100枚', NULL, NULL, NULL,
      'home', 'phone', NULL, '050-1793-6500', NULL, NULL,
      'phone', 'unspecified', true, true, false,
      1, 1, 180, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    );
    RESET ROLE;
    SELECT id AS purge_lead_id FROM public.chat_leads
    WHERE chat_session_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' \\gset
    UPDATE public.chat_leads SET created_at = NOW() - INTERVAL '40 days'
    WHERE id = :'purge_lead_id';
    UPDATE public.chat_lead_contacts
    SET retention_due_at = NOW() - INTERVAL '1 day', created_at = NOW() - INTERVAL '40 days'
    WHERE lead_id = :'purge_lead_id';

    SET ROLE service_role;
    SELECT * FROM public.purge_expired_chat_lead_data(1000);
    RESET ROLE;

    SELECT
      (SELECT count(*) FROM public.chat_leads WHERE id = :'purge_lead_id') AS remaining_leads,
      (SELECT count(*) FROM public.chat_lead_audit_events
       WHERE lead_id = :'purge_lead_id' AND action = 'lead_deleted') AS deletion_evidence;
  `);
  psql(`
    INSERT INTO auth.users(id) VALUES ('66666666-6666-4666-8666-666666666666');
    INSERT INTO public.profiles(id, role, status)
    VALUES ('66666666-6666-4666-8666-666666666666', 'MEMBER', 'ACTIVE');
    SET ROLE service_role;
    SELECT * FROM public.redact_chat_lead_contact(
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      '66666666-6666-4666-8666-666666666666',
      '99999999-9999-4999-8999-99999999999a',
      'user_request'
    );
  `, { expectFailure: true });
  psql(`
    SET ROLE service_role;
    SELECT * FROM public.redact_chat_lead_contact(
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      '55555555-5555-4555-8555-555555555555',
      '99999999-9999-4999-8999-99999999999b',
      'user_request'
    );
    RESET ROLE;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM public.chat_leads
        WHERE member_linkage_state = 'linked'
          AND member_user_id IS NULL
      ) THEN
        RAISE EXCEPTION 'A linked chat lead has no member mapping';
      END IF;

      IF EXISTS (
        SELECT 1 FROM public.chat_leads
        WHERE member_linkage_state = 'unlinked'
          AND (member_user_id IS NOT NULL OR member_linkage_consented_at IS NULL
               OR member_linkage_consent_version IS NULL)
      ) THEN
        RAISE EXCEPTION 'Unlinked consent evidence is incomplete';
      END IF;

      IF EXISTS (
        SELECT 1 FROM public.chat_leads l
        JOIN public.chat_lead_contacts c ON c.lead_id = l.id
        WHERE l.member_linkage_state = 'unlinked'
          AND (c.email IS NOT NULL OR c.phone IS NOT NULL
               OR c.company_name IS NOT NULL OR c.contact_name IS NOT NULL
               OR l.contents_description IS NOT NULL
               OR l.quantity_description IS NOT NULL
               OR l.size_spec_state IS NOT NULL
               OR l.material_printing_needs IS NOT NULL
               OR l.deadline_text IS NOT NULL)
      ) THEN
        RAISE EXCEPTION 'Unlinked lead retains PII or requirement text';
      END IF;
    END $$;
  `);

  console.log('Chat lead local RLS/schema evidence passed in ephemeral Postgres.');
} finally {
  try {
    run('docker', ['rm', '-f', containerName]);
  } catch {
    // Container might already have exited.
  }
}
