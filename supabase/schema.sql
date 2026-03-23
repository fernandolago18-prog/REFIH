-- ==========================================
-- REFIH: Red de Intercambio de Fármacos Inter-Hospitalaria
-- Schema Definition (Supabase PostgreSQL)
-- ==========================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Hospitals (Profiles attached to auth.users)
create table public.hospitals (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    google_maps_url text,
    address text,
    place_id text,
    latitude double precision,
    longitude double precision,
    autonomous_community text not null,
    created_at timestamptz default now() not null
);

-- Medication Offers (Stock)
create table public.medication_offers (
    id uuid primary key default uuid_generate_v4(),
    hospital_id uuid references public.hospitals(id) on delete cascade not null,
    medication_name text not null,
    batch_number text not null,
    expiration_date date not null,
    quantity integer not null check (quantity > 0),
    value_per_unit numeric(10, 2) not null check (value_per_unit >= 0),
    total_value numeric(10, 2) generated always as (quantity * value_per_unit) stored,
    status text not null default 'available' check (status in ('available', 'claimed', 'expired')),
    created_at timestamptz default now() not null,
    
    -- Constraint: Expirations should make sense (rule of < 3 months can be handled in UI, but logically date must be future)
    constraint expiration_in_future check (expiration_date > current_date)
);

-- Exchanges (Loans/Requests)
create table public.medication_exchanges (
    id uuid primary key default uuid_generate_v4(),
    offer_id uuid references public.medication_offers(id) on delete cascade not null,
    requesting_hospital_id uuid references public.hospitals(id) on delete cascade not null,
    requested_quantity integer not null check (requested_quantity > 0),
    status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed')),
    requested_at timestamptz default now() not null,
    completed_at timestamptz,
    
    constraint not_self_request check (requesting_hospital_id != offer_id) -- (Will be enforced by RLS/Trigger but good to have)
);

-- Audit Logs (As per GEMINI-SEC.md)
create table public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    action text not null,
    table_name text not null,
    record_id uuid not null,
    old_data jsonb,
    new_data jsonb,
    timestamp timestamptz default now() not null
);

-- 3. ROW LEVEL SECURITY (RLS) - Zero Trust Policy

alter table public.hospitals enable row level security;
alter table public.medication_offers enable row level security;
alter table public.medication_exchanges enable row level security;
alter table public.audit_logs enable row level security;

-- Hospitals RLS:
-- Anyone can view hospitals (needed for the public map on the Home page)
create policy "Anyone can view hospitals" 
    on public.hospitals for select 
    using (true);

-- Hospitals can only update their own profile
create policy "Hospitals can update own profile" 
    on public.hospitals for update 
    to authenticated using (auth.uid() = id);

create policy "Hospitals can insert own profile" 
    on public.hospitals for insert 
    to authenticated with check (auth.uid() = id);

-- Offers RLS:
-- Anyone authenticated can view available offers
create policy "Authenticated users can view offers" 
    on public.medication_offers for select 
    to authenticated using (true);

-- Hospitals can only manage their own offers
create policy "Hospitals can insert own offers" 
    on public.medication_offers for insert 
    to authenticated with check (auth.uid() = hospital_id);

create policy "Hospitals can update own offers" 
    on public.medication_offers for update 
    to authenticated using (auth.uid() = hospital_id);

create policy "Hospitals can delete own offers" 
    on public.medication_offers for delete 
    to authenticated using (auth.uid() = hospital_id);

-- Exchanges RLS:
-- A hospital can see exchanges if they are the offer owner OR the requester
create policy "Hospitals view related exchanges" 
    on public.medication_exchanges for select 
    to authenticated using (
        auth.uid() = requesting_hospital_id OR 
        auth.uid() IN (SELECT hospital_id FROM public.medication_offers WHERE id = offer_id)
    );

-- Hospitals can create an exchange request
create policy "Hospitals can insert exchanges" 
    on public.medication_exchanges for insert 
    to authenticated with check (auth.uid() = requesting_hospital_id);

-- Only the offer owner can update the status of the exchange (e.g. accept/reject)
create policy "Offer owners can update exchanges" 
    on public.medication_exchanges for update 
    to authenticated using (
        auth.uid() IN (SELECT hospital_id FROM public.medication_offers WHERE id = offer_id)
    );

-- Audit Logs RLS:
-- Only service_role can view. Users can never view or modify this table directly.
-- Note: Insert is handled by a security definer trigger, so no INSERT policy is strictly needed for authenticated users.
create policy "No user access to audit logs" 
    on public.audit_logs for all 
    to authenticated using (false);


-- 4. FUNCTIONS AND TRIGGERS (Audit Trail & Automation)

-- Audit Trigger Function
create or replace function public.log_audit_event()
returns trigger as $$
begin
    insert into public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    values (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        coalesce(NEW.id, OLD.id),
        case when TG_OP = 'DELETE' then row_to_json(OLD)::jsonb else null end,
        case when TG_OP IN ('INSERT', 'UPDATE') then row_to_json(NEW)::jsonb else null end
    );
    return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- Apply Audit Trigger to critical tables
create trigger audit_offers_trigger
    after insert or update or delete on public.medication_offers
    for each row execute function public.log_audit_event();

create trigger audit_exchanges_trigger
    after insert or update or delete on public.medication_exchanges
    for each row execute function public.log_audit_event();

create trigger audit_hospitals_trigger
    after insert or update or delete on public.hospitals
    for each row execute function public.log_audit_event();

-- Initial Schema setup complete.
