alter table public.professional_profiles
add column if not exists full_name text,
add column if not exists business_name text,
add column if not exists phone text,
add column if not exists whatsapp text,
add column if not exists email text,
add column if not exists city text,
add column if not exists province text,
add column if not exists secondary_specialties text,
add column if not exists working_days text,
add column if not exists working_hours text,
add column if not exists experience_years integer not null default 0,
add column if not exists license_number text,
add column if not exists availability_notes text;

alter table public.professional_profiles
drop constraint if exists professional_profiles_experience_years_check;

alter table public.professional_profiles
add constraint professional_profiles_experience_years_check check (experience_years >= 0);
