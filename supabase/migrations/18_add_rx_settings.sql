-- Add rx_config to site_settings
alter table public.site_settings 
add column if not exists rx_config jsonb default '{"enabled": true, "allow_saved": true, "allow_manual": true, "allow_upload": true}'::jsonb;
