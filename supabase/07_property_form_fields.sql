alter table public.properties
add column if not exists province text,
add column if not exists neighborhood text,
add column if not exists bedrooms integer not null default 0,
add column if not exists bathrooms integer not null default 0,
add column if not exists total_area numeric,
add column if not exists covered_area numeric,
add column if not exists has_garage boolean not null default false,
add column if not exists has_yard boolean not null default false,
add column if not exists has_pool boolean not null default false,
add column if not exists pets_allowed boolean not null default false,
add column if not exists currency text not null default 'ARS';

alter table public.properties
drop constraint if exists properties_property_type_check;

alter table public.properties
add constraint properties_property_type_check check (
  property_type in ('casa', 'departamento', 'local', 'terreno', 'oficina', 'galpon', 'quinta', 'otro')
);

alter table public.properties
drop constraint if exists properties_currency_check;

alter table public.properties
add constraint properties_currency_check check (currency in ('ARS', 'USD'));

alter table public.properties
drop constraint if exists properties_bedrooms_check;

alter table public.properties
add constraint properties_bedrooms_check check (bedrooms >= 0);

alter table public.properties
drop constraint if exists properties_bathrooms_check;

alter table public.properties
add constraint properties_bathrooms_check check (bathrooms >= 0);

alter table public.properties
drop constraint if exists properties_total_area_check;

alter table public.properties
add constraint properties_total_area_check check (total_area is null or total_area >= 0);

alter table public.properties
drop constraint if exists properties_covered_area_check;

alter table public.properties
add constraint properties_covered_area_check check (covered_area is null or covered_area >= 0);

alter table public.properties
drop constraint if exists properties_area_order_check;

alter table public.properties
add constraint properties_area_order_check check (
  total_area is null
  or covered_area is null
  or covered_area <= total_area
);
