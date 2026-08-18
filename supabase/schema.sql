-- ====================================================================
-- SCRIPT DE RESET COMPLETO Y CONFIGURACIÓN — SaaS Carmen Psicóloga
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run (Ctrl + Enter)
-- ====================================================================

-- 1. LIMPIEZA / FORMATEO PREVIO (Elimina tablas y vistas anteriores)
-- ====================================================================
DROP VIEW IF EXISTS payment_links_full CASCADE;
DROP TABLE IF EXISTS payment_proofs CASCADE;
DROP TABLE IF EXISTS payment_links CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- 2. EXTENSIONES
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TABLA: CLIENTES (Pacientes de Carmen)
-- ====================================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CITAS / CONSULTAS
-- ====================================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
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

-- 5. TABLA: LINKS DE PAGO
-- ====================================================================
CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  payment_method TEXT CHECK (payment_method IN ('pago_movil', 'zelle', 'ambos')) DEFAULT 'ambos',
  status TEXT CHECK (status IN ('pendiente', 'subido', 'verificado', 'rechazado')) DEFAULT 'pendiente',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: COMPROBANTES DE PAGO
-- ====================================================================
CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_link_id UUID REFERENCES payment_links(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_payment_links_token ON payment_links(token);
CREATE INDEX IF NOT EXISTS idx_payment_links_appointment ON payment_links(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_link ON payment_proofs(payment_link_id);

-- 8. VISTA RESUMEN (Para consultas consolidadas)
-- ====================================================================
CREATE OR REPLACE VIEW payment_links_full AS
SELECT 
  pl.id,
  pl.token,
  pl.status,
  pl.payment_method,
  pl.expires_at,
  pl.created_at,
  a.scheduled_at,
  a.session_type,
  a.amount_usd,
  a.amount_bs,
  a.currency,
  a.meet_link,
  a.status AS appointment_status,
  c.name AS client_name,
  c.phone AS client_phone,
  c.email AS client_email,
  pp.file_url,
  pp.payment_method_used,
  pp.reference_number,
  pp.submitted_at,
  pp.rejection_reason
FROM payment_links pl
JOIN appointments a ON a.id = pl.appointment_id
JOIN clients c ON c.id = a.client_id
LEFT JOIN payment_proofs pp ON pp.payment_link_id = pl.id;

-- 9. SEGURIDAD (Row Level Security - RLS)
-- ====================================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

-- Políticas para Carmen (Usuario autenticado): Acceso total
CREATE POLICY "auth_all_clients" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_appointments" ON appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_payment_links" ON payment_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_proofs" ON payment_proofs FOR ALL USING (auth.role() = 'authenticated');

-- Políticas públicas (Para pacientes accediendo a su link de pago sin login)
CREATE POLICY "public_read_link" ON payment_links FOR SELECT USING (true);
CREATE POLICY "public_update_link" ON payment_links FOR UPDATE USING (true);
CREATE POLICY "public_read_appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "public_read_clients" ON clients FOR SELECT USING (true);
CREATE POLICY "public_insert_proof" ON payment_proofs FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_proof" ON payment_proofs FOR SELECT USING (true);

-- 10. CONFIGURACIÓN DEL STORAGE (Bucket para comprobantes)
-- ====================================================================
-- Crear el bucket 'payment-proofs' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para subida de comprobantes
CREATE POLICY "public_upload_proofs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "public_read_proofs" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-proofs');