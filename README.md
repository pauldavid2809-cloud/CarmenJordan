# 🌸 Plataforma de Consultas Online — Carmen Psicóloga

Plataforma web y SaaS de marca personal para la psicóloga **Carmen**, diseñada con tonos claros, blancos y lavanda para gestión de consultas online, generación de links de pago, carga de comprobantes (Pago Móvil / Zelle) y panel administrativo.

---

## ✨ Características

- 🌿 **Landing Page de Marca Personal:** Presentación elegante, especialidades, flujo en 3 pasos y botón de contacto por WhatsApp.
- 💳 **Portal de Pago del Paciente (`/pay/[token]`):**
  - Links únicos generados por consulta (sin requerir registro previo del paciente).
  - Pestañas para Pago Móvil y Zelle.
  - Subida de comprobantes y estado del pago en tiempo real.
  - Acceso directo a Google Meet al verificar la consulta.
- 📊 **Dashboard Empresarial (`/dashboard`):**
  - Métricas en vivo (citas de hoy, comprobantes por verificar, ingresos USD).
  - Directorio de clientes con contacto rápido por WhatsApp.
  - Calendario y gestión de citas con links de Google Meet.
  - Generador de links de pago y bandeja de verificación/rechazo de comprobantes.
  - Reportes de rendimiento e ingresos.

---

## 🛠️ Tecnologías

- **Next.js 14+ / App Router** & **TypeScript**
- **Tailwind CSS v4** & Fuentes Google (*Playfair Display* + *Inter*)
- **Supabase** (PostgreSQL, RLS, Storage Buckets, Auth)
- **WhatsApp Web / API Direct Integration**

---

## 🚀 Configuración y Despliegue

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/pauldavid2809-cloud/CarmenJordan.git
cd CarmenJordan
npm install
```

### 2. Base de Datos (Supabase)
1. Ejecuta las sentencias de [`supabase/schema.sql`](supabase/schema.sql) en el **SQL Editor** de tu proyecto en Supabase.
2. Crea el bucket público `payment-proofs` en **Storage**.
3. Registra el usuario de Carmen en **Authentication -> Users**.

### 3. Variables de Entorno
Copia el archivo `.env.example` a `.env.local` y añade tus credenciales:
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000).
