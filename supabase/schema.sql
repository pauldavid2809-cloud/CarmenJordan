-- ====================================================================
-- SCRIPT DE ESQUEMA AISLADO Y SEGURO — PsicoOnline SaaS
-- Diseñado para coexistir con otras aplicaciones en el mismo Supabase
-- Sin DROP destructivos que borren datos de otros proyectos.
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run (Ctrl + Enter)
-- ====================================================================

-- 1. EXTENSIONES
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA AISLADA: PERFILES DE PSICÓLOGAS (psico_profiles)
-- Usa el prefijo psico_ para evitar cualquier colisión con tablas 'profiles' de otras apps.
-- ====================================================================
CREATE TABLE IF NOT EXISTS psico_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT DEFAULT 'Psicóloga Clínica',
  bio TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  whatsapp_phone TEXT NOT NULL,
  rates_info TEXT,
  -- Datos de cobro propios de la psicóloga
  pago_movil_banco TEXT,
  pago_movil_cedula TEXT,
  pago_movil_telefono TEXT,
  zelle_email TEXT,
  zelle_holder TEXT,
  -- Control de suscripción SaaS
  subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'expired', 'suspended')) DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 days'),
  subscription_ends_at TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CLIENTES / PACIENTES (Preserva datos existentes)
-- ====================================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna de aislamiento multi-tenant sin borrar datos previos
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS psychologist_id UUID REFERENCES psico_profiles(id) ON DELETE CASCADE;

-- 4. TABLA: CITAS / CONSULTAS (Preserva datos existentes)
-- ====================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  session_type TEXT DEFAULT 'Individual',
  amount_usd NUMERIC(10,2),
  amount_bs NUMERIC(14,2),
  currency TEXT CHECK (currency IN ('USD', 'BS')) DEFAULT 'USD',
  meet_link TEXT,
  status TEXT CHECK (status IN ('pendiente', 'pagada', 'completada', 'cancelada')) DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna de aislamiento multi-tenant sin borrar datos previos
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS psychologist_id UUID REFERENCES psico_profiles(id) ON DELETE CASCADE;

-- 5. TABLA: LINKS DE PAGO
-- ====================================================================
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  payment_method TEXT CHECK (payment_method IN ('pago_movil', 'zelle', 'ambos')) DEFAULT 'ambos',
  status TEXT CHECK (status IN ('pendiente', 'subido', 'verificado', 'rechazado')) DEFAULT 'pendiente',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: COMPROBANTES DE PAGO
-- ====================================================================
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_link_id UUID NOT NULL REFERENCES payment_links(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  payment_method_used TEXT CHECK (payment_method_used IN ('pago_movil', 'zelle')),
  client_name TEXT,
  client_phone TEXT,
  reference_number TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT
);

-- 7. ÍNDICES PARA RENDIMIENTO
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_psico_profiles_slug ON psico_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_clients_psico ON clients(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_psico ON appointments(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_payment_links_token ON payment_links(token);
CREATE INDEX IF NOT EXISTS idx_payment_links_appointment ON payment_links(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_link ON payment_proofs(payment_link_id);

-- 8. VISTA RESUMEN (payment_links_full)
-- ====================================================================
CREATE OR REPLACE VIEW payment_links_full AS
SELECT 
  pl.id,
  pl.token,
  pl.status,
  pl.payment_method,
  pl.expires_at,
  pl.created_at,
  a.id AS appointment_id,
  a.psychologist_id,
  a.scheduled_at,
  a.session_type,
  a.amount_usd,
  a.amount_bs,
  a.currency,
  a.meet_link,
  a.status AS appointment_status,
  c.id AS client_id,
  c.name AS client_name,
  c.phone AS client_phone,
  c.email AS client_email,
  p.full_name AS psychologist_name,
  p.slug AS psychologist_slug,
  p.pago_movil_banco,
  p.pago_movil_cedula,
  p.pago_movil_telefono,
  p.zelle_email,
  p.zelle_holder,
  pp.file_url,
  pp.payment_method_used,
  pp.reference_number,
  pp.submitted_at,
  pp.rejection_reason
FROM payment_links pl
JOIN appointments a ON a.id = pl.appointment_id
JOIN clients c ON c.id = a.client_id
LEFT JOIN psico_profiles p ON p.id = a.psychologist_id
LEFT JOIN payment_proofs pp ON pp.payment_link_id = pl.id;

-- 9. SEGURIDAD (Row Level Security - RLS)
-- ====================================================================
ALTER TABLE psico_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

-- Limpieza preventiva de políticas con el mismo nombre para permitir re-ejecución limpia
DROP POLICY IF EXISTS "public_read_psico_profiles" ON psico_profiles;
DROP POLICY IF EXISTS "users_insert_own_psico_profile" ON psico_profiles;
DROP POLICY IF EXISTS "users_update_own_psico_profile" ON psico_profiles;
DROP POLICY IF EXISTS "psychologist_all_clients" ON clients;
DROP POLICY IF EXISTS "psychologist_all_appointments" ON appointments;
DROP POLICY IF EXISTS "public_read_appointments" ON appointments;
DROP POLICY IF EXISTS "psychologist_manage_links" ON payment_links;
DROP POLICY IF EXISTS "public_read_links" ON payment_links;
DROP POLICY IF EXISTS "public_update_links" ON payment_links;
DROP POLICY IF EXISTS "psychologist_manage_proofs" ON payment_proofs;
DROP POLICY IF EXISTS "public_insert_proofs" ON payment_proofs;
DROP POLICY IF EXISTS "public_read_proofs" ON payment_proofs;

-- Políticas para psico_profiles
CREATE POLICY "public_read_psico_profiles" ON psico_profiles FOR SELECT USING (true);
CREATE POLICY "users_insert_own_psico_profile" ON psico_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own_psico_profile" ON psico_profiles FOR UPDATE USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM psico_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para Clientes
CREATE POLICY "psychologist_all_clients" ON clients FOR ALL USING (
  psychologist_id IS NULL OR psychologist_id = auth.uid() OR EXISTS (SELECT 1 FROM psico_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para Citas
CREATE POLICY "psychologist_all_appointments" ON appointments FOR ALL USING (
  psychologist_id IS NULL OR psychologist_id = auth.uid() OR EXISTS (SELECT 1 FROM psico_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "public_read_appointments" ON appointments FOR SELECT USING (true);

-- Políticas para Payment Links
CREATE POLICY "psychologist_manage_links" ON payment_links FOR ALL USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = payment_links.appointment_id 
    AND (a.psychologist_id IS NULL OR a.psychologist_id = auth.uid() OR EXISTS (SELECT 1 FROM psico_profiles WHERE id = auth.uid() AND is_admin = true))
  )
);
CREATE POLICY "public_read_links" ON payment_links FOR SELECT USING (true);
CREATE POLICY "public_update_links" ON payment_links FOR UPDATE USING (true);

-- Políticas para Payment Proofs
CREATE POLICY "psychologist_manage_proofs" ON payment_proofs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM payment_links pl
    JOIN appointments a ON a.id = pl.appointment_id
    WHERE pl.id = payment_proofs.payment_link_id 
    AND (a.psychologist_id IS NULL OR a.psychologist_id = auth.uid() OR EXISTS (SELECT 1 FROM psico_profiles WHERE id = auth.uid() AND is_admin = true))
  )
);
CREATE POLICY "public_insert_proofs" ON payment_proofs FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_proofs" ON payment_proofs FOR SELECT USING (true);

-- 10. STORAGE BUCKET PARA COMPROBANTES
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_upload_proofs" ON storage.objects;
DROP POLICY IF EXISTS "public_read_proofs_storage" ON storage.objects;

CREATE POLICY "public_upload_proofs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "public_read_proofs_storage" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-proofs');