-- =============================================
-- Schema: SaaS Psicóloga Carmen
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- =============================================
-- CLIENTES (pacientes de Carmen)
-- =============================================
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);

-- =============================================
-- CITAS
-- =============================================
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes int default 60,
  session_type text default 'Individual',
  amount_usd numeric(10,2),
  amount_bs numeric(14,2),
  currency text check (currency in ('USD', 'BS')) default 'USD',
  meet_link text,
  status text check (status in ('pendiente', 'pagada', 'completada', 'cancelada')) default 'pendiente',
  notes text,
  created_at timestamptz default now()
);

-- =============================================
-- LINKS DE PAGO
-- =============================================
create table payment_links (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references appointments(id) on delete cascade,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  payment_method text check (payment_method in ('pago_movil', 'zelle', 'ambos')) default 'ambos',
  status text check (status in ('pendiente', 'subido', 'verificado', 'rechazado')) default 'pendiente',
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- =============================================
-- COMPROBANTES DE PAGO
-- =============================================
create table payment_proofs (
  id uuid primary key default uuid_generate_v4(),
  payment_link_id uuid references payment_links(id) on delete cascade,
  file_url text not null,
  file_name text,
  payment_method_used text check (payment_method_used in ('pago_movil', 'zelle')),
  client_name text,
  client_phone text,
  reference_number text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  rejection_reason text
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table clients enable row level security;
alter table appointments enable row level security;
alter table payment_links enable row level security;
alter table payment_proofs enable row level security;

-- Carmen (autenticada) tiene acceso total
create policy "auth_all_clients" on clients for all using (auth.role() = 'authenticated');
create policy "auth_all_appointments" on appointments for all using (auth.role() = 'authenticated');
create policy "auth_all_payment_links" on payment_links for all using (auth.role() = 'authenticated');
create policy "auth_all_proofs" on payment_proofs for all using (auth.role() = 'authenticated');

-- Pacientes (sin cuenta) pueden leer su link por token y subir comprobante
create policy "public_read_link" on payment_links for select using (true);
create policy "public_insert_proof" on payment_proofs for insert with check (true);
create policy "public_read_proof" on payment_proofs for select using (true);

-- =============================================
-- STORAGE BUCKET (ejecutar después de crear el bucket manualmente)
-- Ir a: Storage → New bucket → nombre: "payment-proofs" → privado
-- Luego añadir estas políticas:
-- =============================================

-- Permite a cualquiera (pacientes) subir archivos
-- insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', true);

-- Si el bucket es público, cualquiera puede leer la URL directa.
-- Si es privado, usar signed URLs (más seguro para comprobantes).