import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const containerName = `chat-analytics-rls-${process.pid}`;
const migrationPath = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260921000000_create_chat_sessions_and_funnel_events.sql',
);

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
    if (expectFailure) {
      throw new Error('EXPECTED_SQL_FAILURE');
    }
    return;
  } catch (error) {
    if (expectFailure && error instanceof Error && error.message === 'EXPECTED_SQL_FAILURE') {
      throw new Error('Expected SQL authorization failure, but it succeeded.');
    }
    if (!expectFailure) throw error;
  }
};

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
  if (!ready) throw new Error('Postgres test container did not become ready.');

  let databaseReady = false;
  for (let attempt = 0; attempt < 40 && !databaseReady; attempt += 1) {
    try {
      psql('SELECT 1;');
      databaseReady = true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (!databaseReady) throw new Error('Postgres test database did not accept queries.');

  const setup = `
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `;
  psql(setup);
  psql(fs.readFileSync(migrationPath, 'utf8'));

  psql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_class WHERE relname = 'chat_sessions' AND relrowsecurity) THEN
        RAISE EXCEPTION 'chat_sessions RLS is not enabled';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_class WHERE relname = 'chat_funnel_events' AND relrowsecurity) THEN
        RAISE EXCEPTION 'chat_funnel_events RLS is not enabled';
      END IF;
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename IN ('chat_sessions', 'chat_funnel_events')) THEN
        RAISE EXCEPTION 'Direct client policies exist for non-PII chat tables';
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('chat_sessions', 'chat_funnel_events')
          AND column_name IN ('user_id', 'ip_address', 'user_agent', 'pathname', 'message', 'transcript')
      ) THEN
        RAISE EXCEPTION 'Prohibited identifier/path/message column found';
      END IF;
      IF NOT has_table_privilege('service_role', 'chat_sessions', 'INSERT') THEN
        RAISE EXCEPTION 'Migration did not grant deterministic service-role session privileges';
      END IF;
      IF NOT has_table_privilege('service_role', 'chat_funnel_events', 'INSERT') THEN
        RAISE EXCEPTION 'Migration did not grant deterministic service-role event privileges';
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'chat_funnel_events' AND column_name = 'visitor_type'
      ) THEN
        RAISE EXCEPTION 'visitor_type must be derived from chat_sessions, not duplicated';
      END IF;
    END $$;
  `);

  psql('SET ROLE anon; SELECT count(*) FROM public.chat_sessions;', { expectFailure: true });
  psql('SET ROLE authenticated; SELECT count(*) FROM public.chat_sessions;', { expectFailure: true });
  psql('SET ROLE authenticated; INSERT INTO public.chat_funnel_events DEFAULT VALUES;', { expectFailure: true });

  psql(`
    SET ROLE service_role;
    WITH inserted AS (
      INSERT INTO public.chat_sessions(audience, initial_route_family, expires_at)
      VALUES ('public', 'home', NOW() + INTERVAL '1 day')
      RETURNING id
    )
    INSERT INTO public.chat_funnel_events(session_id, event_type, route_family)
    SELECT id, 'suggestions_shown', 'home' FROM inserted;
    RESET ROLE;
  `);
  psql(`
    SET ROLE service_role;
    INSERT INTO public.chat_sessions(id, audience, initial_route_family, created_at, expires_at)
    VALUES ('11111111-1111-4111-8111-111111111111', 'public', 'home', NOW() - INTERVAL '400 days', NOW() - INTERVAL '399 days');
    INSERT INTO public.chat_funnel_events(session_id, event_type, route_family, occurred_at)
    VALUES ('11111111-1111-4111-8111-111111111111', 'chat_closed', 'home', NOW() - INTERVAL '400 days');
    SELECT * FROM public.purge_expired_chat_analytics(180, 5000);
    RESET ROLE;
  `);

  psql(`
    DO $$
    BEGIN
      IF (SELECT count(*) FROM public.chat_funnel_events) <> 1 OR
         (SELECT count(*) FROM public.chat_sessions) <> 1 OR
         EXISTS (SELECT 1 FROM public.chat_funnel_events WHERE session_id = '11111111-1111-4111-8111-111111111111') OR
         EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = '11111111-1111-4111-8111-111111111111') THEN
        RAISE EXCEPTION 'Chat analytics retention function did not preserve current rows and purge expired rows';
      END IF;
    END $$;
  `);

  console.log('Non-PII chat analytics RLS evidence passed in ephemeral Postgres.');
} finally {
  try {
    run('docker', ['rm', '-f', containerName]);
  } catch {
    // Container may already have exited because --rm was used.
  }
}
