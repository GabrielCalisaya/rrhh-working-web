# Auditoría de interfaz — RRHH Working

**Fecha:** 2026-08-05
**Alcance:** páginas públicas (`/`, `/nosotros`, `/servicios`, `/empleos`, `/postular/[id]`, `/contacto`, `/privacidad`), sistema de componentes y formulario de postulación.
**Estado:** análisis. **No se modificó ni una línea de código.**

---

## 0. Diagnóstico general

El sistema está bien construido a nivel arquitectura: Server Components donde corresponde, filtros en la URL, RLS real, CSP estricta, Turnstile, retención de datos. El problema no es técnico, es de **percepción**.

La página hoy se lee como un **documento** bien maquetado, no como el sitio de una consultora. Tres causas concretas:

1. **La tipografía elegida nunca se carga.** `globals.css` declara `font-family: Inter`, pero Inter no se importa por ningún lado (ni `next/font`, ni `@font-face`, ni link a Google Fonts — que además la CSP bloquearía). El sitio entero se está renderizando con la fuente por defecto del sistema. Es el hallazgo de mayor impacto visual del informe y se corrige en 5 líneas.

2. **Casi todo el texto de párrafo usa `--color-primary-dark` (#5f7c80).** Un gris azulado apagado. El resultado: no hay contraste real entre títulos y cuerpo, todo flota en el mismo tono, y la página se percibe "lavada". Además está justo por debajo del mínimo de accesibilidad (medido: 4.49:1 sobre blanco, AA exige 4.5:1). El token `--color-text` (#1f2937) existe pero casi no se usa en párrafos.

3. **No hay sistema de diseño, solo 5 variables.** No hay escala tipográfica, ni de sombras, ni de radios, ni de duraciones de animación. Cada página inventa su propio ritmo vertical (`gap-12` en home, `space-y-14` en servicios y nosotros, `space-y-6` en empleos, `space-y-8` en contacto). Sin esa base, cualquier microinteracción que agreguemos va a sentirse pegada encima en vez de parte del sistema.

**Contraste medido (sobre blanco):**

| Uso actual | Color | Ratio | WCAG AA |
|---|---|---|---|
| Texto de párrafo | `#5f7c80` | 4.49:1 | ✗ (por 0.01) |
| Botón primario (texto blanco) | `#7c9a9d` | 3.01:1 | ✗ falla claro |
| Texto principal | `#1f2937` | 14.7:1 | ✓ |

El botón primario es el elemento más importante de conversión del sitio y su texto no cumple AA. Se arregla oscureciendo el primario sin cambiar la identidad (mantiene el verde-gris de marca).

---

## 1. Hallazgos por área

### 1.1 Sistema de componentes

| # | Hallazgo | Impacto |
|---|---|---|
| S1 | Inter declarada pero nunca cargada → toda la tipografía es fallback | Muy alto |
| S2 | `Button` no tiene estado `:focus-visible` propio ni `:active`; el foco del navegador casi no se ve sobre el fondo verde | Alto (a11y) |
| S3 | `Card` tiene `shadow-sm` fija, sin hover ni transición. Todas las cards del sitio son planas | Alto |
| S4 | `Input` usa `ring-2` sin `ring-offset`, el foco se pega al borde y se lee sucio | Medio |
| S5 | `Badge` tiene un solo tono para todo: modalidad, seniority, tipo de contrato y audiencia se ven idénticos → cero jerarquía en las tarjetas de empleo | Medio |
| S6 | No existe `prefers-reduced-motion` en ningún lado. Requisito previo a agregar cualquier animación | Alto (a11y) |
| S7 | No hay tokens de duración/easing → cada transición usa el default de Tailwind | Medio |

### 1.2 Layout y navegación

| # | Hallazgo | Impacto |
|---|---|---|
| L1 | Todo el sitio vive dentro de `max-w-6xl` en el layout raíz. Ninguna sección puede ir a ancho completo → imposible dar aire, ritmo o contraste de fondos. Es la causa estructural del "todo se ve igual" | Muy alto |
| L2 | Header sticky pero sin transición al scroll: no cambia sombra, altura ni fondo. Se siente estático | Alto |
| L3 | El header no marca el link activo. El usuario no sabe en qué página está | Alto (UX) |
| L4 | En mobile el nav no colapsa: 5 links + accesos de staff se apilan en 2–3 filas y comen el viewport inicial | Alto |
| L5 | Ritmo vertical inconsistente entre páginas (ver arriba) | Medio |
| L6 | Footer de 3 elementos en una línea. Cierra la página sin presencia de marca ni navegación | Medio |

### 1.3 Home

| # | Hallazgo | Impacto |
|---|---|---|
| H1 | El hero es una card blanca sobre fondo casi blanco, sin imagen, sin profundidad, sin ancla visual. Es el elemento más plano del sitio y es lo primero que se ve | Muy alto |
| H2 | Sin señales de confianza (años de trayectoria, cantidad de búsquedas, rubros cubiertos). Para una consultora, la confianza *es* el producto | Alto (negocio) |
| H3 | Las 3 cards de servicios son idénticas a las de `/servicios` → la home no aporta nada nuevo, solo repite | Medio |
| H4 | El bloque de valores es una lista de icono+título sin peso visual, se lee como pie de página | Medio |
| H5 | La página termina en un botón secundario. No hay cierre fuerte ni CTA final | Medio (conversión) |

### 1.4 Nosotros

| # | Hallazgo | Impacto |
|---|---|---|
| N1 | **8 placeholders punteados que dicen "Logo cliente"** en producción. Esto resta credibilidad activamente: comunica "sitio sin terminar" justo en la sección que debería generar confianza | Muy alto (negocio) |
| N2 | Avatares del equipo con iniciales sobre círculo plano | Bajo |
| N3 | Cinco secciones seguidas con la misma estructura (título + subtítulo + grilla de cards) → monotonía de scroll | Medio |

### 1.5 Empleos y postulación

| # | Hallazgo | Impacto |
|---|---|---|
| E1 | **La página de la vacante no muestra los requisitos.** El `select` de `/postular/[vacancyId]` no trae `requirements` ni `nice_to_have`, aunque existen en la base. El candidato postula a ciegas — y el formulario le pide "usá las mismas palabras que aparecen en los requisitos" que nunca vio | Muy alto |
| E2 | **Sin metadata dinámica en `/postular/[id]`.** Cada vacante compartida por WhatsApp o redes muestra el título genérico del sitio. Para una consultora que difunde búsquedas en redes, es pérdida directa de postulaciones | Muy alto (negocio) |
| E3 | Sin datos estructurados `JobPosting` → las búsquedas no aparecen en Google Jobs. Es la mejora de SEO con mejor relación impacto/riesgo de todo el informe | Alto (negocio) |
| E4 | La barra de filtros flota sin contenedor, se confunde con el contenido | Medio |
| E5 | Filtrar navega sin ningún feedback (no hay `loading.tsx` en todo el proyecto). En conexión lenta parece que no pasó nada | Alto |
| E6 | `JobCard`: sin fecha de publicación, tarjeta no clickable entera, y el CTA es un link de texto en la esquina inferior derecha — afordancia débil | Alto (conversión) |
| E7 | Estado vacío = un párrafo dentro de un recuadro. Sin icono, sin acción sugerida | Medio |
| E8 | Sin `error.tsx` ni `not-found.tsx`: una vacante cerrada cae en el 404 genérico de Next, sin salida hacia `/empleos` | Alto |
| E9 | Sin CTA fijo de postulación en mobile: en una vacante larga hay que scrollear de vuelta | Medio |

### 1.6 Estados, feedback y validación (Parte 5)

| # | Hallazgo | Impacto |
|---|---|---|
| F1 | **Los mensajes de error de Zod salen en inglés.** No hay mensajes personalizados en `application.ts`, así que el candidato lee "Invalid email" o "String must contain at least 3 character(s)" | Alto |
| F2 | Solo se muestra `issues[0].message`, al pie del formulario. Nunca se marca *qué* campo falló ni se hace scroll hacia él | Alto |
| F3 | El límite de 2000 caracteres de la carta se valida solo en el servidor: el usuario escribe de más y recién ahí se entera | Medio |
| F4 | El input de archivo es nativo: sin nombre de archivo visible, sin drag & drop, y el límite de 5 MB se anuncia pero no se valida en cliente (se sube el archivo entero antes de fallar) | Alto |
| F5 | El checkbox de consentimiento no tiene estado de error visual | Medio |
| F6 | La pantalla de éxito es un callejón sin salida: no ofrece ver otras búsquedas ni volver | Medio (conversión) |
| F7 | Si Turnstile no carga, no hay mensaje: el botón simplemente no funciona | Alto |
| F8 | Sin skeletons en ninguna carga | Medio |

### 1.7 SEO e infraestructura

| # | Hallazgo | Impacto |
|---|---|---|
| O1 | No existe `sitemap.ts` ni `robots.ts` | Alto |
| O2 | `twitter:card` declara `summary_large_image` pero no hay imagen OG definida → al compartir se ve una tarjeta rota/vacía | Alto |
| O3 | Sin JSON-LD de `Organization` / `LocalBusiness` (relevante para búsquedas locales en Jujuy) | Medio |

---

## 2. Parte 4 — El formulario de postulación es un formulario de IT

### 2.1 Qué delata el sesgo

| Elemento actual | Por qué no sirve fuera de IT |
|---|---|
| `Skills (separadas por coma) *`, placeholder `React, TypeScript, Testing` | Un cocinero, un operario o una recepcionista no piensan en "skills". Y es **obligatorio**: hoy es la principal fuente de abandono del formulario |
| Ayuda: "Usá las mismas palabras que aparecen en los requisitos de la vacante" | Los requisitos ni siquiera se muestran en la página (E1) |
| `Portfolio` | Concepto de IT/diseño. En gastronomía, salud o logística no significa nada |
| `LinkedIn` como campo destacado | Fuera de perfiles profesionales urbanos, la mayoría no tiene |
| Seniority: `Junior / Semi Senior / Senior / Lead` | Escalafón importado de IT. Nadie en construcción o comercio se identifica así |
| `Full-time / Part-time` | Anglicismos innecesarios |
| CV marcado como "(opcional)" | Invertido: fuera de IT, el CV suele ser **el único** documento del candidato |

### 2.2 Propuesta — universal y **sin tocar Supabase**

La restricción clave: `seniority` y `employment_type` tienen `CHECK` constraints en la base. Cambiar los valores exigiría una migración. **No hace falta:** se puede mantener el valor almacenado y cambiar solo la etiqueta que ve el usuario, con un mapa en el front. Cero migración, cero riesgo, admin intacto.

**Seniority → "Nivel de experiencia"** (mismo valor en DB, otra etiqueta en UI):

| Valor en DB | Etiqueta propuesta |
|---|---|
| `Junior` | Sin experiencia previa o hasta 1 año |
| `Semi Senior` | Experiencia intermedia (1 a 3 años) |
| `Senior` | Amplia experiencia (más de 3 años) |
| `Lead` | Jefatura, coordinación o supervisión |

**Tipo de contratación** (ídem):

| Valor en DB | Etiqueta propuesta |
|---|---|
| `Full-time` | Jornada completa |
| `Part-time` | Media jornada |
| `Contrato` | Contrato temporal / por obra |
| `Pasantía` | Pasantía |

**El cambio central — reemplazar el campo "Skills":**

En lugar de pedirle al candidato que invente términos, mostrarle **chips seleccionables generados a partir de los `requirements` y `nice_to_have` de esa vacante** (que ya están en la base y son propios de cada rubro), más un campo libre para agregar. Nueva etiqueta: **"Experiencia y conocimientos"**, ayuda: *"Marcá lo que ya hiciste o sabés hacer. Podés agregar lo que quieras."*

Por qué esto resuelve el problema de raíz:

- Funciona en cualquier rubro: una vacante de gastronomía listará "manejo de caja, atención al público, manipulación de alimentos"; una de IT listará "React, SQL". El formulario se adapta solo.
- Elimina la barrera de vocabulario: el candidato reconoce en vez de recordar.
- Usa la misma columna `skills text[]`. **Sin migración.**
- **Mejora `calculateSkillsScore`**: hoy el match falla siempre que el candidato escribe la palabra distinta al requisito. Con chips, las coincidencias son exactas y el score pasa a ser útil de verdad para el equipo de RRHH.

**Otros ajustes de terminología:**

- `Portfolio` → **"Enlace a tus trabajos o perfil profesional (opcional)"** — sirve para un fotógrafo, un carpintero con Instagram o un desarrollador.
- `LinkedIn` → agrupar ambos enlaces bajo "Enlaces (opcional)", visualmente secundarios.
- CV: sacarle el "(opcional)", darle peso visual como recomendado y sumarle drag & drop con validación de tamaño en cliente.
- Carta de presentación → **"Contanos sobre vos"** con preguntas guía: *¿Qué experiencia tenés en este tipo de trabajo? ¿Por qué te interesa? ¿Cuál es tu disponibilidad horaria?* Esto captura, sin agregar columnas, los datos que en rubros no-IT más importan (disponibilidad, movilidad, estudios).
- Dividir el formulario en tres bloques con encabezado — *Tus datos · Tu experiencia · Documentación* — para bajar la carga percibida.

> **Nota:** disponibilidad horaria, nivel de estudios y movilidad propia serían campos valiosos para rubros como logística, salud o industria, pero exigen columnas nuevas. Se dejan fuera por la restricción de no tocar Supabase y se cubren parcialmente vía las preguntas guía.

---

## 3. Plan priorizado

Orden pensado para que cada etapa se apoye en la anterior. Una etapa por vez, con revisión de responsive, accesibilidad y build al cierre de cada una.

### Etapa 0 — Fundaciones (invisible sola, habilita todo lo demás)

| # | Mejora | Justificación | Riesgo |
|---|---|---|---|
| 0.1 | Cargar Inter con `next/font` (self-hosted, compatible con la CSP actual) | Es la fuente que el diseño ya asume. Hoy no se está viendo | Nulo |
| 0.2 | Escala de tokens: tipografía, sombras, radios, espaciado, duraciones + corrección de contraste AA | Base de todo lo visual. Sin esto cada cambio es un parche | Nulo |
| 0.3 | Primitivas de animación + `prefers-reduced-motion` (~40 líneas de CSS, sin librerías) | Requisito de accesibilidad **antes** de animar nada | Nulo |

### Etapa 1 — Identidad visual y navegación

| # | Mejora | Justificación | Riesgo |
|---|---|---|---|
| 1.1 | Header: transición al scroll, link activo, menú mobile | L2, L3, L4. Es lo que más se ve y se toca | Bajo |
| 1.2 | Permitir secciones a ancho completo (mover el contenedor del layout a cada página) | Desbloquea todo el ritmo visual (L1) | Medio — tocar el layout raíz, se revisa página por página |
| 1.3 | Rediseño del hero + banda de credibilidad | H1, H2. Primera impresión y confianza | Bajo |
| 1.4 | Refinar `Button`, `Card`, `Input`, `Badge` (elevación al hover, `focus-visible`, variantes de badge) | S2–S5. Un solo cambio mejora todas las páginas a la vez | Bajo |
| 1.5 | Reveal al scroll con IntersectionObserver (~30 líneas, sin librería, respeta reduced-motion) | Parte 2. Cero impacto en Lighthouse | Bajo |
| 1.6 | Footer con estructura y marca | L6 | Nulo |
| 1.7 | Quitar o reemplazar los 8 placeholders "Logo cliente" | N1. Hoy resta credibilidad en producción | Nulo |

### Etapa 2 — Empleos y conversión

| # | Mejora | Justificación | Riesgo |
|---|---|---|---|
| 2.1 | Mostrar requisitos y deseables en la página de la vacante | E1. Es información que ya está en la base y no se muestra | Bajo |
| 2.2 | `generateMetadata` por vacante + imagen OG | E2, O2. Impacto directo en postulaciones desde redes | Bajo |
| 2.3 | JSON-LD `JobPosting` + `sitemap.ts` + `robots.ts` | E3, O1. Google Jobs. Invisible para el usuario, alto retorno | Bajo |
| 2.4 | Rediseño de `JobCard`: tarjeta clickable, fecha, jerarquía de badges | E6. Es la unidad de conversión del sitio | Bajo |
| 2.5 | `loading.tsx` con skeletons + barra de filtros contenida | E4, E5, F8 | Bajo |
| 2.6 | Estado vacío con acción, `error.tsx` y `not-found.tsx` | E7, E8 | Bajo |

### Etapa 3 — Formulario universal (Parte 4 + Parte 5)

| # | Mejora | Justificación | Riesgo |
|---|---|---|---|
| 3.1 | Mapa de etiquetas para seniority y tipo de contratación | Universaliza sin migración | Nulo |
| 3.2 | Skills → chips desde los requisitos + campo libre | El cambio central de la Parte 4. Además arregla el score de match | Medio — es el campo con más lógica |
| 3.3 | Terminología: portfolio, enlaces, CV, carta con preguntas guía | Elimina el resto del sesgo IT | Bajo |
| 3.4 | Mensajes de Zod en español + errores por campo + foco al primer error | F1, F2. Hoy el candidato lee errores en inglés | Bajo |
| 3.5 | Campo de archivo mejorado: nombre visible, validación de tamaño en cliente, drag & drop | F4 | Bajo |
| 3.6 | Contador de caracteres, estado de error del consentimiento, fallback de Turnstile | F3, F5, F7 | Bajo |
| 3.7 | Formulario en tres bloques + pantalla de éxito con próximos pasos | F6. Baja la carga percibida y da salida | Bajo |

### Etapa 4 — Pulido institucional

| # | Mejora | Justificación |
|---|---|---|
| 4.1 | Ritmo y composición en `/nosotros` y `/servicios` (alternar fondos, romper la monotonía de grillas) | N3, L5 |
| 4.2 | JSON-LD `Organization` / `LocalBusiness` | O3 — búsquedas locales en Jujuy |
| 4.3 | Repaso de `/contacto` y `/privacidad` | Consistencia |

**Restricciones respetadas en todo el plan:** sin librerías nuevas (animaciones en CSS + IntersectionObserver nativo), sin tocar Supabase, sin cambios de arquitectura, sin modificar APIs, sin romper responsive.

---

## 4. Parte 6 — Bolsa de talentos (solo análisis, sin código)

### ¿Conviene implementarla?

**Sí — pero después de la Etapa 3.** El sentido de la bolsa de talentos es captar candidatos que no encuentran una vacante que les calce. Si el formulario todavía suena a IT, la bolsa se llenaría del mismo perfil que ya llega y no resolvería nada. Universalizar primero, abrir la puerta después.

### Ventajas

- **Base de datos propia.** Hoy la consultora solo tiene candidatos que postularon a una búsqueda concreta. Con una bolsa, cuando entra un pedido nuevo se puede empezar buscando internamente en vez de desde cero. Es el activo que diferencia a una consultora.
- **Captura la demanda que hoy se pierde.** Todo el que entra a `/empleos`, no ve nada que le sirva y se va, hoy es tráfico perdido.
- **Sinergia directa con los servicios de armado de CV.** Un candidato que deja su CV es un lead calificado para ese servicio.
- **Costo marginal casi nulo:** reutiliza formulario, subida de CV, Turnstile, rate limit, consentimiento y retención de datos ya construidos.

### Desventajas y riesgos

- **Expectativa de respuesta.** Quien deja el CV espera novedades. Sin un flujo de contacto claro, genera frustración y mala reputación. Hay que ser explícito en la UI sobre qué va a pasar y en cuánto tiempo.
- **Volumen de spam y CVs irrelevantes.** Turnstile y el rate limit mitigan lo automatizado, no lo humano de baja calidad. Requiere trabajo de curaduría del equipo.
- **Carga operativa en el panel.** Sin filtros y etiquetas, una base de 500 CVs sin ordenar es tan inútil como no tenerla.
- **Superficie de datos personales más grande.** Más PII almacenada, más exposición ante un incidente. La retención de 12 meses ya existente lo acota.

### Impacto sobre la arquitectura

**Bajo.** Encaja en lo que ya existe:

- 1 página pública nueva (`/talentos` o similar).
- 1 variante del formulario actual — sin `vacancyId`, sin chips de requisitos.
- 1 endpoint API nuevo, calcado del de postulaciones (mismo patrón de service role + captcha + rate limit).
- 1 vista de admin, o un filtro sobre la de candidatos ya existente.

Sin cambios en middleware, auth, CSP ni estructura de rutas.

### Impacto sobre Supabase y reutilización del modelo

**El modelo actual ya lo soporta sin migración.** Este es el punto clave: `candidates` es una tabla **independiente** de `applications`. Un candidato puede existir sin ninguna postulación asociada. Una candidatura espontánea es, literalmente, una fila en `candidates` sin fila en `applications`.

- `candidates` ya tiene todo lo necesario: `full_name`, `email` (único), `phone`, `city`, `skills[]`, `cv_file_path`, `consent`, `created_at`.
- El bucket `cvs` y sus políticas de storage se reutilizan tal cual.
- Las políticas RLS de lectura para staff ya cubren la tabla.
- La inserción va por API con service role, igual que hoy — **no requiere políticas RLS nuevas.**

Reutilización estimada: **~90% del modelo de datos, sin migración obligatoria.**

Único ajuste recomendable (opcional, una columna): un `source text default 'application'` en `candidates` para distinguir postulación dirigida de candidatura espontánea. Es un `ALTER TABLE ADD COLUMN` con default — no rompe nada existente. Sin él, el criterio sería "candidato sin aplicaciones", que funciona pero es frágil.

### ¿Alcanza el plan gratuito de Supabase?

**Sí, con margen amplio.** El límite que importa no es la base de datos, es el almacenamiento:

| Recurso | Límite plan gratuito | Consumo estimado |
|---|---|---|
| Base de datos | 500 MB | Una fila de candidato pesa < 1 KB → **más de 100.000 candidatos** |
| Storage | 1 GB | Un CV en PDF pesa ~300 KB → **~3.000 CVs** |
| Usuarios activos | 50.000 MAU | Solo el staff usa auth → irrelevante |

El cuello de botella real son los **~3.000 CVs de storage**. Para una consultora regional es un techo lejano, y la política de retención de 12 meses que ya está implementada lo mantiene acotado de forma permanente: los CVs viejos se van borrando solos.

Advertencia operativa: el plan gratuito **pausa el proyecto tras 7 días sin actividad**. Con un sitio en producción recibiendo tráfico eso no ocurre, pero conviene tenerlo presente.

**Complejidad estimada:** baja-media. El grueso es diseño de la experiencia y las herramientas de curaduría en el panel, no desarrollo.

---

## 5. Qué sigue

El método acordado es una mejora por vez, con aprobación previa. La recomendación es arrancar por la **Etapa 0**: es invisible por sí sola, pero sin la tipografía cargada y la escala de tokens definida, todo lo que se haga después va a ser un parche sobre una base que no existe.
