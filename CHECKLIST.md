# Checklist de Gabriel

Tareas que **no pude hacer yo** desde el entorno de trabajo, ordenadas por lo que bloquea el deploy.

Contexto de mis limitaciones, para que sepas qué está verificado y qué no:

- ✅ `npx tsc --noEmit` lo corrí y queda **limpio** después de cada cambio.
- ❌ `npm run build` y `npm run test` **nunca pudieron ejecutarse**: el binding nativo de Rolldown/SWC revienta con *bus error* sobre el sistema de archivos montado. Todo lo que dependa de ejecutar la app está sin verificar.
- ❌ No tengo acceso a tu proyecto Supabase, así que **ningún `.sql` fue aplicado**.
- ❌ No puedo crear cuentas en servicios externos (Cloudflare, Vercel).

---

## 🔴 Bloqueante — antes de cualquier deploy

### 1. Correr build y tests localmente

```bash
npm ci          # importante: reconcilia node_modules (ver nota al final)
npm run test
npm run build
```

Si algo falla, pasame la salida. Esperá que pasen **8 archivos de test nuevos o modificados**: `safe.redirect`, `api.error.boundary`, `api.auth.guard`, `client.ip`, `captcha`, más los que ya existían.

- [ ] `npm run test` en verde
- [ ] `npm run build` completa sin errores

### 2. Aplicar el SQL en Supabase (SQL Editor, en este orden exacto)

- [ ] `supabase/schema.sql`
- [ ] `supabase/rls.sql`
- [ ] `supabase/migrations/002_rate_limits.sql`
- [ ] `supabase/migrations/003_application_snapshot.sql`
- [ ] `supabase/migrations/004_compliance.sql`
- [ ] `supabase/migrations/005_housekeeping.sql`
- [ ] Crear los 2 usuarios en **Authentication > Users** con *Auto Confirm* activado:
      `admin@rrhhworking.com.ar` y `recruiter@rrhhworking.com.ar`
- [ ] `supabase/seed.sql` (falla si los usuarios no existen)
- [ ] `supabase/storage.sql`
- [ ] `supabase/verify.sql` — **si el total de políticas no da 7, parate acá y avisame**

> `verify.sql` cuenta las 7 políticas de las tablas originales. Las migraciones 004
> agregan 2 más (`audit_log` y `deletion_requests`), así que en `pg_policies` vas a
> ver 9 en total. Eso está bien.

> El punto crítico es `rls.sql`. La versión original definía una función llamada
> `current_role`, que es palabra reservada de PostgreSQL: el script abortaba y
> dejaba las 5 tablas con RLS activo y **cero políticas**. Ahora la migración a
> RLS real hace que la app dependa de esas políticas: si no se crearon, el panel
> no va a mostrar datos.

### 3. Variables de entorno en Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → **marcala como Sensitive**
- [ ] `SUPABASE_STORAGE_BUCKET=cvs`
- [ ] `ENABLE_CV_UPLOAD=false` (ver punto 7 antes de prenderla)
- [ ] `ENABLE_MATCHING=false`
- [ ] `ENABLE_AUTO_EMAIL=false` (el envío sigue siendo un stub, no manda nada)
- [ ] `MATCHING_THRESHOLD=70`
- [ ] `ENABLE_CAPTCHA=false` (ver punto 5)

No pongas `EMAIL_PROVIDER`, `RESEND_API_KEY` ni `BREVO_API_KEY`: no hay código que las lea.

### 4. Supabase Auth — URLs

En **Authentication > URL Configuration**:

- [ ] Site URL = tu dominio de producción
- [ ] Agregar `https://TU-DOMINIO/auth/callback` a Redirect URLs

---

## 🟡 Importante — primeros días

### 5. Cloudflare Turnstile (CAPTCHA)

El código está completo y apagado por flag. Solo faltan las claves:

- [ ] Crear un sitio en [dash.cloudflare.com](https://dash.cloudflare.com) > Turnstile (gratis, ilimitado)
- [ ] Agregar el dominio de producción **y** `localhost` para probar
- [ ] En Vercel: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (site key) y `TURNSTILE_SECRET_KEY` (secret, marcala Sensitive)
- [ ] Poner `ENABLE_CAPTCHA=true`
- [ ] Probar una postulación real: sin resolver el widget debe dar **400**

> Sin CAPTCHA, el rate limiting (5 postulaciones / 15 min por IP) es lo único
> que te separa de un bot con IPs rotativas llenándote la tabla `candidates`.

### 6. Limpieza automática de `rate_limits`

La tabla crece una fila por IP y por endpoint. Sin purga, crece para siempre.

- [ ] En **Database > Extensions**, habilitar `pg_cron`
- [ ] Ejecutar:
      ```sql
      select cron.schedule('purge-rate-limits', '0 * * * *', 'select public.purge_rate_limits()');
      ```

### 7. Validar el flujo de CV de punta a punta

Ahora sí existe la descarga (antes se guardaban CVs que nadie podía abrir). Antes de prender la carga en producción:

- [ ] `ENABLE_CV_UPLOAD=true` **en preview**, no en producción
- [ ] Postular con un PDF adjunto
- [ ] En `/admin/postulaciones`, botón **Ver CV** → debe abrir el PDF
- [ ] Verificar que la URL firmada muere: esperá 60 s y recargá, debe dar error
- [ ] Recién ahí, prenderlo en producción

### 8. Normalizar finales de línea (una sola vez)

Agregué `.gitattributes`. Faltaba esto para que deje de haber ~11.000 líneas de ruido en cada diff:

```bash
git add --renormalize .
git commit -m "chore: normalizar finales de línea"
```

- [ ] Hecho

### 9. Borrar `.eslintrc.json`

Config legacy muerta: ESLint 9 usa `eslint.config.mjs` e ignora ese archivo en silencio. El entorno no me dejó borrarlo.

```bash
git rm .eslintrc.json
```

- [ ] Hecho

### 10. Smoke test post-deploy

La migración a RLS es el cambio con más superficie. Probá con **las dos cuentas**:

| Prueba | Con admin | Con recruiter |
|---|:--:|:--:|
| Login entra al panel | [ ] | [ ] |
| `/admin` muestra contadores distintos de cero | [ ] | [ ] |
| `/admin/vacantes` lista vacantes | [ ] | [ ] |
| `/admin/candidatos` lista candidatos | [ ] | [ ] |
| `/admin/postulaciones` lista postulaciones | [ ] | [ ] |
| `/admin/usuarios` accesible | [ ] sí | [ ] **debe rebotar** |
| Crear vacante | [ ] | [ ] |
| Cambiar estado de postulación | [ ] | [ ] |
| Descargar CV | [ ] | [ ] |
| `/admin/privacidad` lista solicitudes | [ ] | [ ] |
| Paginación (crear >25 registros y navegar) | [ ] | [ ] |

Y sin login:

- [ ] `/empleos` lista solo vacantes `open`
- [ ] Filtrar por ciudad/modalidad/seniority cambia la URL y el resultado
- [ ] Copiar esa URL filtrada en otra pestaña muestra lo mismo
- [ ] `/postular/<id-de-una-vacante-draft>` da 404
- [ ] Postular funciona de punta a punta
- [ ] `/admin` redirige al login
- [ ] `/privacidad` carga y el formulario de baja responde OK
- [ ] El header muestra "Acceso staff" y, tras loguear, "Panel" y "Salir"

> Si un recruiter ve el panel vacío, casi seguro es la política
> `profiles read own` de `rls.sql` que no se creó. Verificá con `verify.sql`.

### 11. Verificar que el CSP no rompe nada

Agregué CSP y headers de seguridad en `next.config.ts`. No pude probarlos.

- [ ] Abrir el sitio desplegado con la consola del navegador
- [ ] Buscar errores `Content-Security-Policy` / `Refused to load`
- [ ] Si el widget de Turnstile no carga, avisame (falta un dominio en `frame-src`)

---

### 12. Contenido institucional — datos a confirmar

El sitio público se rehízo con el contenido del portafolio.

- [x] ~~Redes sociales~~ — confirmadas: Facebook e Instagram existen.
- [ ] **Logos de clientes.** `/nosotros` tiene 8 marcadores punteados donde van los logos.
      El portafolio tiene la sección "Nuestros Clientes" pero sin nombres legibles, así que
      no puse ninguna empresa. Pasame los logos y los coloco.

También reemplacé datos que estaban inventados en el sitio anterior: el email pasó de
`contacto@rrhhworking.com.ar` (inexistente en el portafolio) a `rrhhworking17@gmail.com`,
y saqué el horario de atención "Lunes a Viernes 9:00 a 18:00" porque el portafolio no lo menciona.

- [ ] Confirmar que `rrhhworking17@gmail.com` y `388-4079618` son los contactos que querés publicar

### 13. Retención automática (pg_cron)

La función de anonimización a 12 meses está lista pero **no programada**, a propósito: revisá
primero que el criterio te cierre. Devuelve las rutas de CV a borrar, así que si la programás
directo en pg_cron los archivos de Storage **no** se eliminan solos.

- [ ] Decidir si activarla y cómo ejecutar el borrado de los PDF que devuelve

---

## 🟢 Deuda que queda abierta (Fase 3, no bloquea)

Cosas que **decidimos no hacer** y conviene que tengas presentes:

- **Emails.** `sendMatchingEmailStub` no manda nada. Si prendés `ENABLE_AUTO_EMAIL` no pasa absolutamente nada. Es también lo que impide un doble opt-in para la supresión de datos: hoy la baja la ejecuta una persona desde el panel.
- **CSP con `'unsafe-inline'`.** Next inyecta scripts sin nonce. Para endurecerlo hace falta generar un nonce por request en el middleware.
- **Autorización por propietario en vacantes.** Cualquier recruiter puede editar cualquier vacante. Es una decisión de producto, no un olvido: en `005_housekeeping.sql` está comentada la policy alternativa si querés restringirlo.
- **Rate limiting falla abierto.** Si Supabase no responde, el request pasa. Es deliberado (no bloquear postulaciones legítimas por una caída), pero significa que una caída de la base es también una ventana de abuso.
- **Sin tests E2E.** La suite es unitaria. El flujo completo de postulación no está cubierto de punta a punta.
- **Filtro de texto en `/empleos` con `ilike`.** Funciona bien con cientos de vacantes; con miles conviene un índice de texto completo en Postgres.

### Cerrado en Fase 3

- ~~Retención y supresión de datos personales~~ → `/privacidad`, `/admin/privacidad`, `delete_candidate_data()`, `anonymize_stale_candidates()`
- ~~Paginación real~~ → `range()` + `count: exact` en candidatos, postulaciones y vacantes
- ~~Filtros de `/empleos` en cliente~~ → filtrado en Postgres, estado en la URL
- ~~Todas las rutas dinámicas~~ → el Header ya no resuelve sesión en el servidor; `getStaffSession` memoizada con `cache()`
- ~~Auditoría solo en logs~~ → tabla `audit_log`
- ~~`updated_at` que nunca se actualizaba~~ → trigger
- ~~Cobertura sin umbrales~~ → thresholds en `vitest.config.ts` + typecheck separado en CI

---

## Nota sobre `node_modules`

Mientras intentaba hacer correr los tests, un `npm install` en mi entorno borró los archivos `.d.ts` de varios paquetes `@supabase/*` y vació el binding de Rolldown para Windows. **Restauré ambos** desde el registry y `tsc` volvió a quedar limpio, pero quedó un binding de Linux de 7,5 MB en `node_modules/@rolldown/` que el sistema de archivos no me dejó borrar.

- [ ] Correr `npm ci` una vez para dejar `node_modules` en un estado limpio y reproducible

`package.json` y `package-lock.json` **no fueron modificados** (lo verifiqué con `git diff`).
