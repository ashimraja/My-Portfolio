-- Run once in Supabase → SQL Editor. Adds the visitor's city-level location to analytics events (no IP address is stored).
alter table public.events
  add column if not exists country_code text check (char_length(country_code) = 2),
  add column if not exists country      text check (char_length(country)      <= 60),
  add column if not exists region       text check (char_length(region)       <= 80),
  add column if not exists city         text check (char_length(city)         <= 80),
  add column if not exists lat          numeric(6,2),
  add column if not exists lon          numeric(6,2);
