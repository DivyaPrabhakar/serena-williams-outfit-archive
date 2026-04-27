-- Migration: add discipline + round columns to outfits
-- Run this in the Supabase dashboard → SQL editor

-- 1. New columns
alter table outfits add column if not exists discipline text;
alter table outfits add column if not exists round text;
alter table outfits add column if not exists round_number integer;

-- discipline values: 'Singles' | 'Doubles' | 'Mixed'
-- round values:      'R1' | 'R2' | 'R3' | 'R4' | 'QF' | 'SF' | 'F'
-- round_number:      1–7, used for ordering within a tournament

-- 2. Back-fill existing rows as Singles (round to be filled in manually)
update outfits set discipline = 'Singles' where discipline is null;

-- 3. Check constraints
alter table outfits add constraint valid_discipline
  check (discipline in ('Singles', 'Doubles', 'Mixed'));

alter table outfits add constraint valid_round
  check (round in ('R1', 'R2', 'R3', 'R4', 'QF', 'SF', 'F') or round is null);

-- 4. Indexes for common query patterns
create index if not exists outfits_year_tournament on outfits(year, tournament);
create index if not exists outfits_discipline      on outfits(discipline);

-- 5. Verify — should show discipline = 'Singles' on all existing rows
select id, year, tournament, discipline, round, round_number
from outfits
order by year, tournament
limit 20;
