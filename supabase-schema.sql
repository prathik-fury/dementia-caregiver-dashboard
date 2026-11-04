-- Run in Supabase SQL Editor after enabling Email OTP authentication.
create extension if not exists pgcrypto;
create table if not exists public.devices (
 id uuid primary key default gen_random_uuid(),
 caregiver_id uuid not null references auth.users(id) on delete cascade,
 name text not null default 'ESP32 Wearable',
 patient_name text not null,
 device_key_hash text not null unique check (length(device_key_hash)=64),
 created_at timestamptz not null default now()
);
create table if not exists public.events (
 id bigint generated always as identity primary key,
 device_id uuid not null references public.devices(id) on delete cascade,
 event_type text not null check(event_type in ('normal_speech','background_noise','shouting','screaming','movement','emergency','device_online','device_offline')),
 confidence double precision check(confidence is null or (confidence>=0 and confidence<=1)),
 detail text not null default '',
 created_at timestamptz not null default now()
);
create index if not exists events_device_created_idx on public.events(device_id,created_at desc);
alter table public.devices enable row level security;
alter table public.events enable row level security;
-- Authenticated caregivers may only read their own devices and events.
create policy "Caregivers read own devices" on public.devices for select to authenticated using (caregiver_id=auth.uid());
create policy "Caregivers read own events" on public.events for select to authenticated using (exists(select 1 from public.devices d where d.id=events.device_id and d.caregiver_id=auth.uid()));
-- No public writes. Server-side API uses the service role, protected by a device secret.
-- Generate device key: openssl rand -hex 32
-- Generate hash: echo -n 'YOUR_DEVICE_KEY' | sha256sum
-- Insert after first signing in, using your auth.users UUID:
-- insert into public.devices (caregiver_id,patient_name,name,device_key_hash)
-- values ('YOUR_AUTH_USER_UUID','Patient 01','Wearable 01','YOUR_64_CHAR_SHA256_HASH');
