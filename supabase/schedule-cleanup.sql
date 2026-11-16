-- Run AFTER deploying the function and creating these two secrets in Supabase Vault:
-- photobox_function_url = https://PROJECT_REF.supabase.co/functions/v1/photo-share
-- photobox_cron_key = the same random value as Edge Function secret PHOTOBOX_CRON_KEY
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'photobox-expired-photos',
  '*/10 * * * *',
  $$select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'photobox_function_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'photobox_cron_key')
    ),
    body := '{"action":"cleanup"}'::jsonb
  )
  where exists (select 1 from vault.decrypted_secrets where name = 'photobox_function_url')
    and exists (select 1 from vault.decrypted_secrets where name = 'photobox_cron_key');$$
);
