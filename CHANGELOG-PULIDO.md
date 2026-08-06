# Changelog — Pulido final

Cuatro bloques. TypeScript sin errores y ESLint sin errores en todos (queda un warning preexistente en `app/admin/page.tsx` por un `Link` sin usar, ajeno a estos cambios).

---

## Bloque 1 — Botón "Panel" y teléfono

**Archivos:** `lib/content/institucional.ts`, `components/layout/StaffNav.tsx`, `components/layout/Header.tsx`, `components/ui/Icon.tsx`

**Motivo.** El botón era un bloque sólido de color al final de la barra: más alto que los links vecinos y con mucho más peso visual del que le corresponde a un acceso interno que la mayoría de las visitas ni siquiera ve. Se leía como pegado encima de la navegación, no como parte de ella.

**Qué cambió.**

- Pastilla tenue con borde, de la misma altura que los demás ítems, que sólo se vuelve sólida al hacer hover.
- Ícono de panel a la izquierda del texto.
- `whitespace-nowrap`: "Panel" no se parte ni se recorta cuando la barra se comprime en tablet.
- Separador vertical de 1px antes del bloque de staff. Comunica "esto es otra categoría de acción" sin recurrir a color ni peso tipográfico.
- Nueva prop `variant`: en el menú mobile el alto sube a 44px y se omite el separador, porque ahí ya hay un borde que cumple ese rol.
- Teléfono actualizado a **388 329 5992** (`tel:+543883295992`).

**UX.** El acceso de staff deja de competir con la navegación pública. El texto es legible en los tres tamaños.

**Rendimiento.** Nulo: mismo componente, sin nodos ni dependencias nuevas.

**Accesibilidad.** Área táctil de 44px en mobile y 36px en desktop. El contraste del hover usa el par de tokens del botón primario, verificado en AA.

**A futuro.** `CONTACT` ya es punto único de cambio; si se suma WhatsApp, va ahí y aparece solo en el pie y en contacto.

---

## Bloque 2 — Modo claro / oscuro

**Archivos:** `app/globals.css`, `lib/theme.ts` (nuevo), `components/layout/ThemeToggle.tsx` (nuevo), `app/layout.tsx`, `components/layout/Header.tsx`, `components/ui/Button.tsx`, `components/ui/Pagination.tsx`, y 12 componentes con colores fijos.

**Estrategia.** El trabajo de tokens de la etapa anterior hizo que esto fuera mucho más barato de lo habitual: como todo el sitio consume `var(--color-*)`, alcanza con redefinir esas variables bajo `[data-theme="dark"]` para que cambie entero. El trabajo real fueron los **57 colores hardcodeados** que no pasaban por tokens.

**Decisiones que vale la pena registrar.**

- **`data-theme`, no `prefers-color-scheme`.** La preferencia explícita tiene que poder ganarle a la del sistema: alguien con el celular en oscuro puede querer este sitio en claro. El sistema se usa sólo como valor inicial.
- **Script bloqueante en el `<head>`.** Sin él, el sitio pinta en claro y salta a oscuro al hidratar: un fogonazo blanco en cada carga, justo lo que alguien que eligió modo oscuro no quiere ver. Un `useEffect` llega tarde por definición.
- **Tokens nuevos para el botón primario.** Tenía `text-white` fijo. En oscuro la relación se invierte (fondo medio, texto oscuro), y con blanco fijo el contraste caía por debajo de 2:1.
- **Tokens semánticos de estado.** Los verdes y rojos de Tailwind están calculados para fondos claros; en oscuro quedaban como manchas fluorescentes. Ahora `--color-success-*`, `--color-danger-*`, `--color-warning-*` y `--color-neutral-*` tienen su versión por tema.
- **Los íconos del selector se resuelven por CSS, no en React.** El servidor no sabe qué tema eligió el usuario: un render condicional mostraría el ícono equivocado hasta hidratar y avisaría de desajuste de hidratación. Con dos reglas CSS el HTML sirve para ambos temas.
- **View Transitions** para el cambio de tema, con degradación limpia donde no está soportado y desactivado si se pidió reducir movimiento.
- **Nombres semánticos por rol, no por valor.** `--color-primary-dark` significa "el color de marca que se lee sobre el fondo": en oscuro eso es un tono claro. Suena contradictorio leído fuera de contexto, pero es lo que permite cambiar de tema sin tocar una sola clase en los componentes.

**Paleta.** Desaturada, con los grises teñidos apenas del verde de marca en vez de neutros puros. El texto es `#e6ecec`, no blanco puro: el blanco sobre fondo muy oscuro produce halo y cansa la vista.

**Accesibilidad.** Los 20 pares de color (10 por tema) se verificaron con script contra WCAG AA, midiendo cada color contra **todas** las superficies sobre las que aparece. Rango: 4.52:1 a 15.16:1. `color-scheme` hace que scrollbars y menús nativos acompañen el tema.

**Rendimiento.** El script inline son ~15 líneas. No hay librería de temas ni contexto de React: el estado vive en un atributo del DOM.

**A futuro.** Falta una tercera opción "seguir al sistema" (hoy es claro/oscuro explícito, con el sistema sólo como valor inicial). Y las capturas OG siguen siendo del tema claro, que es lo correcto.

---

## Bloque 3 — Formulario de contacto y envío

**Archivos:** `lib/validators/contact.ts`, `lib/services/contact-email.ts`, `app/api/contact/route.ts`, `components/contact/ContactForm.tsx` (todos nuevos), `app/(public)/contacto/page.tsx`, `.env.example`

**Estrategia de envío: Resend por `fetch`, sin SDK.** Son cuatro campos en un JSON; el paquete sólo agregaría peso al despliegue. Plan gratuito de 3.000 envíos/mes. Sin dominio propio verificado, Resend sólo permite enviar a la casilla dueña de la cuenta — que acá es justo el destino fijo del formulario, así que la limitación no molesta.

**Reutiliza lo que ya existía**: `TurnstileWidget`, `assertCaptchaIsValid`, `rateLimit` y `errorResponse`. No se agregó ninguna dependencia.

**Decisiones.**

- **Las opciones de "Servicio de interés" se derivan de `SERVICES`.** Si mañana se agrega o renombra un servicio, el desplegable acompaña solo. Duplicar la lista garantizaba que en algún momento las dos versiones se separaran.
- **"Otro" abre un campo para especificar**, validado en el servidor con `refine`, no sólo en el cliente.
- **Sin API key configurada, el endpoint responde 503 con un mensaje claro.** El peor resultado posible es decirle "recibimos tu consulta" a un cliente potencial cuando el mail nunca salió: esa consulta se pierde y nadie se entera.
- **`reply_to` con el correo de quien consulta**: responder desde el cliente de mail le escribe directo a la persona.
- **Honeypot** además de Turnstile: frena bots simples sin fricción, incluso con el captcha desactivado.
- **El HTML del mail se escapa.** El cuerpo lo escribe un desconocido desde un formulario público.
- **Mensajes de error en español**, campo por campo, con foco automático al primero. Zod sin mensajes propios responde en inglés.
- **La página de contacto se reordenó**: antes sólo mostraba email y teléfono, así que quien quería contratar tenía que salir del sitio a redactar un correo de cero. Los canales directos siguen visibles en una columna lateral.

**UX.** Estado de carga con spinner en el botón, éxito con salida ("Enviar otra consulta"), contador de caracteres que aparece sólo cerca del límite.

**Rendimiento.** Un route handler nuevo. La página de contacto pasa a incluir un componente cliente; el resto sigue estático.

**Accesibilidad.** `aria-invalid` y `aria-describedby` por campo, errores con `role="alert"`, honeypot fuera del orden de tabulación, campos a 16px en mobile.

**Falta para que funcione:** cargar `RESEND_API_KEY` en Vercel (instrucciones paso a paso en `.env.example`).

**A futuro.** Guardar además la consulta en Supabase daría respaldo si el envío falla, a costa de una migración.

---

## Bloque 4 — Profundidad visual

**Archivos:** `app/globals.css`, `app/(public)/servicios/page.tsx`, `app/(public)/nosotros/page.tsx`

- **Fondo global**: dos halos radiales muy tenues del color de marca, fijos respecto del viewport. Es lo que separa un fondo "vacío" de uno "tratado". Van en el `body`, así que no agregan nodos ni capas de composición.
- **Reveal al scroll** extendido a servicios y nosotros, con `animation-timeline: view()` — sin JavaScript y sin riesgo de contenido invisible, porque el estado oculto sólo existe dentro del `@supports`.
- **CTA finales** con gradiente suave en lugar de blanco plano.

### Se retiró la sección "Nuestros clientes"

Tenía ocho recuadros punteados con el texto "Logo cliente", en producción, justo debajo de la presentación del equipo. En una sección cuyo propósito es generar confianza, ese marcador comunica exactamente lo contrario: que el sitio quedó a medio terminar. Un espacio vacío no resta; un vacío señalado, sí.

Se retiró completa, con las instrucciones para restituirla en un comentario en `nosotros/page.tsx`: guardar los logos en `/public/clientes/`, agregar `CLIENTS` en `institucional.ts` y recuperar la sección del historial de git.

---

## Pendiente de verificar fuera de este entorno

`npm test` y `npm run build` no pueden correr acá: `node_modules` tiene binarios compilados para Windows. Conviene correrlos antes de desplegar, y revisar el sitio en ambos temas.
