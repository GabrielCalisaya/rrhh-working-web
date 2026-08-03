# RRHH Working Web

MVP profesional de **RRHH Working (Argentina)** con sitio público de empleos y panel admin multiusuario.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Supabase (Auth, PostgreSQL, Storage)
- Vitest + Testing Library
- Deploy objetivo: Vercel

## Requisitos

- Node.js 20+
- npm 10+
- Proyecto Supabase creado

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `ENABLE_CV_UPLOAD=false`
- `ENABLE_MATCHING=false`
- `ENABLE_AUTO_EMAIL=false`
- `MATCHING_THRESHOLD=70`
- `EMAIL_PROVIDER` (`resend` o `brevo`)
- `RESEND_API_KEY` / `BREVO_API_KEY`

## Setup local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables en `.env.local`.
3. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir `http://localhost:3000`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`

## Supabase SQL

Aplicar en orden:

1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/seed.sql`

Nota: la postulación pública se inserta por API server usando **service role**, no directo desde cliente por RLS.
La carga de CV usa `/api/applications/upload-cv` y solo se habilita con `ENABLE_CV_UPLOAD=true`.

## Tests

Ejecutar:

```bash
npm run test
```

Incluye validaciones, filtros, guards, mapper y UI básica.

## Deploy en Vercel

1. Importar repositorio en Vercel.
2. Configurar las mismas variables de entorno.
3. Deploy automático en cada push/PR.
4. Verificar rutas públicas, admin, API y build.

## Roadmap fase 2

- Matching avanzado por skills + seniority + ponderaciones.
- Emails automáticos reales con Resend/Brevo detrás de feature flags.
- Notificaciones automáticas por cambios de estado de postulaciones.
- Auditoría de cambios de roles admin/recruiter.
