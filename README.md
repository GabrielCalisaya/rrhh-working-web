# RRHH Working Web

Aplicación web para búsquedas laborales y gestión de postulaciones. Incluye un sitio público de vacantes y un área administrativa con controles de acceso por rol.

## Implementado

- Listado, detalle y filtros de vacantes.
- Formularios y validaciones de postulación.
- Autenticación, roles y rutas protegidas.
- Persistencia con Supabase y políticas RLS versionadas.
- Middleware para actualización de sesión.
- Pruebas de validaciones, filtros, guards, APIs y componentes de interfaz.

## Stack

- Next.js 15 (App Router), React 19 y TypeScript.
- Tailwind CSS.
- Supabase: Auth, PostgreSQL y Storage.
- Vitest y Testing Library.

## Requisitos

- Node.js 22 o superior.
- npm 11 o superior.
- Proyecto Supabase configurado.

## Configuración local

1. Copiá `.env.example` como `.env.local` y completá sus variables.
2. Instalá dependencias y ejecutá el entorno de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

3. Abrí `http://localhost:3000`.

Las opciones de carga de CV, matching y correos automáticos se controlan mediante variables de entorno y permanecen deshabilitadas por defecto.

## Base de datos

Los scripts SQL están en `supabase/`. Para preparar una instancia local o remota, aplicá `schema.sql`, `rls.sql` y luego `seed.sql` según corresponda.

La postulación pública se procesa en el servidor; no se inserta directamente desde el cliente.

## Verificación

```bash
npm run lint
npm run test
npm run build
```
