# 03 — About / Contacto con envío de correo (Resend)

**Estado:** Aprobado
**Depende de:** SPEC 01, SPEC 02
**Fecha:** 2026-09-14

**Objetivo:** Implementar la pantalla `/about` de Arcade Vault portando `references/templates/home-about/about.jsx` tal cual, conectando su formulario de contacto a un endpoint real `app/api/contact/route.ts` que envía el correo del lado del servidor usando Resend.

## Alcance

**Incluye:**
- Nueva ruta `app/about/page.tsx`: port de `about.jsx` — hero "ACERCA DE" con `kicker`, título, misión, `highlight-row` (3 highlights con iconos `HEART`/`BROWSER`/`PLANT`), divisor de píxeles animado, y sección de contacto (`contact-grid` con intro + tips y formulario NOMBRE/CORREO ELECTRÓNICO/MENSAJE), siguiendo el mismo patrón de "página como client component" ya usado en el proyecto.
- Efecto reveal-on-scroll (`useReveal`, igual patrón que `app/page.tsx`) aplicado a `.reveal` (divisor y sección de contacto).
- Validación de campos vacíos con animación `shake`, igual que el prototipo.
- Endpoint `app/api/contact/route.ts` (Route Handler, `POST`): recibe `{ name, email, msg }`, valida los campos en el servidor (no solo confiar en el cliente), y llama a la API de Resend para enviar el correo a `julianagrolandia@gmail.com`.
- Estado de éxito: al recibir `200` del endpoint, se muestra el mismo terminal `.terminal-success` del prototipo con el nombre del remitente.
- Estado de error de red/servidor (no existe en el prototipo, necesario porque ahora el envío es real): si el `fetch` a `/api/contact` falla o responde con error, se muestra un mensaje de error inline en el formulario (reutilizando tokens de color existentes, p. ej. `neon-magenta`) y se permite reintentar sin perder lo escrito.
- Estado de carga mientras se espera la respuesta del endpoint (botón "▶ ENVIAR MENSAJE" deshabilitado con texto "ENVIANDO…").
- Dependencia `resend` agregada a `package.json`.
- Variable de entorno `RESEND_API_KEY` (en `.env.local`, no versionada) documentada como requerida por el endpoint. `.gitignore` actualizado para ignorar `.env*` (hoy no hay ninguna regla de `.env`).
- Actualizar `app/components/Nav.tsx`: agregar el link **"Sobre Nosotros"** (→ `/about`) tanto en el nav de escritorio como en el panel móvil, con su propio estado activo (`isActive`) cuando `pathname === "/about"`.
- Portar a `app/globals.css` las clases de `references/templates/home-about/styles.css` que usa About y que aún no existen en el proyecto: `about`, `about-hero` (+ `.kicker` dentro de ella), `about-title`, `about-mission`, `highlight-row`, `highlight` (+ `.cyan`/`.magenta`/`.green`), `hl-icon`, `hl-text`, `about-divider`, `div-bar`, `div-pixels` (+ `@keyframes pxblink`), `about-contact`, `contact-grid`, `contact-intro`, `contact-title`, `contact-sub`, `contact-tips` (+ `.tip`, `.tip-led` y variantes `.y`/`.m`), `contact-form` (+ `.shake` y `@keyframes shake`, `textarea`), `.btn.press:active`, `terminal-success`, `term-bar` (+ `.dot` `.r`/`.y`/`.g`, `.term-title`), `term-body` (+ `.line`, `.prompt`, `.dim`, `.success`, `.caret`, reutilizando el `@keyframes blink` ya existente). Las clases `.field`, `.btn` y sus variantes ya existen en `app/globals.css` (portadas en specs previos) y no se duplican.

**No incluye:**
- Persistencia de los mensajes de contacto (no se guardan en ninguna base de datos ni archivo; el único efecto es el envío del correo).
- Autenticación/relación del formulario con `useSession` — el formulario de contacto es público, no requiere sesión iniciada.
- Rate limiting, protección anti-spam (captcha, honeypot) o validación avanzada de formato de correo más allá de `type="email"` en el cliente y una validación básica de formato en el servidor.
- Configuración de un dominio propio verificado en Resend — se usa la dirección `from` de pruebas de Resend (`onboarding@resend.dev`) hasta que el usuario configure un dominio (ver Decisiones).
- Valor real de `RESEND_API_KEY` — el usuario la proporcionará después; el spec deja la integración lista para recibirla vía variable de entorno.
- Cualquier cambio a otras pantallas más allá de agregar el link "Sobre Nosotros" al Nav.

## Modelo de datos

No se introduce persistencia nueva. El contrato entre el cliente y el endpoint es efímero (solo vive en la request/response):

```ts
// Request body de POST /api/contact
type ContactPayload = {
  name: string;
  email: string;
  msg: string;
};

// Response
// 200: { ok: true }
// 400: { ok: false, error: string }  // validación fallida
// 500: { ok: false, error: string }  // fallo al enviar con Resend
```

## Plan de implementación

1. **Preparar dependencia y entorno.** Instalar `resend` (`npm install resend`), agregar `.env*` (excepto `.env.example` si se decide crear uno) a `.gitignore`, y documentar `RESEND_API_KEY` como variable requerida. El sistema sigue funcional (no hay cambios de comportamiento todavía).
2. **Portar el CSS de About.** Copiar a `app/globals.css` las clases listadas en Alcance desde `references/templates/home-about/styles.css`, sin tocar las que ya existen (`.field`, `.btn`, `.btn.ghost`, `@keyframes blink`, etc.).
3. **Construir `app/about/page.tsx`.** Client component con `useReveal` (mismo hook que `app/page.tsx`), hero, `highlight-row` con `HighlightIcon` (HEART/BROWSER/PLANT, mismos SVG pixel-art del prototipo), divisor animado, y el formulario de contacto con estados `form`, `sent`, `shake`, `loading` y `error`. En `onSubmit`: si hay campos vacíos, dispara `shake` (igual que el prototipo); si no, hace `POST` a `/api/contact` con `fetch` y `JSON.stringify(form)`; en éxito muestra `.terminal-success`; en error muestra el mensaje inline y permite reintentar.
4. **Construir `app/api/contact/route.ts`.** `POST` handler que lee el body, valida que `name`, `email` y `msg` no estén vacíos y que `email` tenga formato válido; si falla, responde `400` con `{ ok: false, error }`. Si pasa, instancia `new Resend(process.env.RESEND_API_KEY)` y llama a `resend.emails.send({ from: "onboarding@resend.dev", to: "julianagrolandia@gmail.com", replyTo: email, subject: "Nuevo mensaje de contacto — Arcade Vault", text: ... })`; si Resend devuelve error o `RESEND_API_KEY` no está configurada, responde `500` con `{ ok: false, error }`; si todo sale bien, responde `200` con `{ ok: true }`.
5. **Actualizar el Nav.** Agregar el link **"Sobre Nosotros"** (→ `/about`) en `app/components/Nav.tsx`, en el nav de escritorio y en el panel móvil, con su propio estado activo cuando `pathname === "/about"`.
6. **Revisión final.** Comparar `app/globals.css` contra `references/templates/home-about/styles.css` para confirmar que ninguna clase usada por About quedó fuera, y correr `npm run build`.
7. **Validación con Playwright MCP.** Con el servidor de desarrollo corriendo (sin `RESEND_API_KEY` real todavía): navegar a `/about` en viewport de escritorio y en viewport móvil (~400px), verificar que el link "Sobre Nosotros" del Nav lleva a `/about` y se marca activo, verificar que enviar el formulario vacío dispara el `shake`, y verificar que enviar el formulario con datos válidos muestra el estado de carga y luego el mensaje de error inline (esperado, porque el endpoint fallará al no tener `RESEND_API_KEY` configurada) — esto confirma que el wiring cliente↔servidor funciona aunque el envío real no pueda verificarse hasta que el usuario entregue la API key. Capturar screenshots de evidencia en `.playwright-screenshots/`.

## Criterios de aceptación

- [ ] `/about` muestra el hero, los 3 highlights, el divisor animado y la sección de contacto, con el mismo look pixel-art/neón del prototipo, en escritorio y en un viewport móvil (~400px).
- [ ] El efecto reveal-on-scroll se activa al hacer scroll en `/about`.
- [ ] El Nav muestra "Sobre Nosotros" (→ `/about`) tanto en escritorio como en el panel móvil, y se resalta como activo en `/about`.
- [ ] Enviar el formulario con algún campo vacío dispara la animación `shake` y no llama al endpoint.
- [ ] Enviar el formulario con datos válidos llama a `POST /api/contact` con `{ name, email, msg }`.
- [ ] Si `POST /api/contact` responde `200`, se muestra el `.terminal-success` con el nombre del remitente, igual que el prototipo.
- [ ] Si `POST /api/contact` responde error (400/500), se muestra un mensaje de error inline sin perder los datos escritos, y el usuario puede reintentar.
- [ ] `app/api/contact/route.ts` valida los campos en el servidor antes de llamar a Resend (no confía solo en la validación del cliente).
- [ ] `app/api/contact/route.ts` usa `process.env.RESEND_API_KEY` (no hardcodeada) y envía a `julianagrolandia@gmail.com`.
- [ ] `.env*` está en `.gitignore`; no se commitea ninguna API key.
- [ ] `npm run build` compila sin errores de tipos.

## Decisiones tomadas y descartadas

- **Envío vía Route Handler (`app/api/contact/route.ts`) en vez de Server Action.** Razón (indicación explícita del usuario): el usuario pidió explícitamente que el cliente llame a `/api/contact` y que este llame a Resend del lado del servidor.
- **Ruta `/about`** (no `/about-nosotros` ni otra variante). Razón (indicación explícita del usuario).
- **Link del Nav se llama "Sobre Nosotros"**, distinto al `"Acerca de"` que usa `about.jsx` como texto del `kicker`/título interno de la página. Razón (indicación explícita del usuario): el texto del link de navegación es una decisión aparte del contenido de la página, que sí sigue el template tal cual (`"▸ ACERCA DE"`, `"ACERCA DE ARCADE VAULT"`).
- **Destinatario `julianagrolandia@gmail.com` hardcodeado como constante** en el route handler, no como variable de entorno. Razón (indicación explícita del usuario, quien dio la dirección directamente sin pedir que fuera configurable).
- **`RESEND_API_KEY` se deja como variable de entorno sin valor real por ahora.** Razón (indicación explícita del usuario): la proporcionará después de esta implementación; el endpoint debe quedar listo para recibirla sin más cambios de código.
- **Dirección `from` = `onboarding@resend.dev`** (dirección de pruebas que Resend habilita sin verificar dominio). Razón: no se ha configurado un dominio propio verificado en Resend; esta es la única forma de enviar correos reales sin esa configuración adicional. Si el usuario verifica un dominio propio más adelante, cambiar el `from` es un ajuste de una línea, no un spec nuevo.
- **Se agregan estados de carga y error que no existen en el prototipo** (`loading`, mensaje de error inline). Razón: el prototipo simula el envío con un timeout falso que nunca falla; con un endpoint real que depende de una API externa, omitir el manejo de errores dejaría al usuario sin feedback ante un fallo real (p. ej. `RESEND_API_KEY` ausente, límite de la API, red caída). Se mantiene minimalista: un mensaje de texto reutilizando colores ya definidos, sin nuevos componentes.
- **No se agrega rate limiting ni protección anti-spam.** Razón: fuera del alcance pedido por el usuario; se deja como riesgo identificado para un spec futuro si se vuelve necesario.

## Riesgos identificados

- **No se puede verificar el envío real de correo en este spec**, porque `RESEND_API_KEY` no tiene valor real todavía. La validación de Playwright (paso 7) solo puede confirmar que el formulario llama al endpoint y maneja la respuesta de error esperada; la entrega real del correo queda pendiente de que el usuario entregue la API key.
- **`onboarding@resend.dev` es una dirección de pruebas de Resend** con límites y restricciones propias de esa cuenta (puede requerir que `to` sea la misma cuenta con la que se registró Resend, dependiendo del plan). Si el usuario ya tiene un dominio verificado, este dato debe confirmarse al recibir la API key, antes de dar por buena la entrega a producción.
- **Formulario público sin protección anti-spam.** Cualquiera que descubra `/api/contact` puede enviar solicitudes arbitrarias a la API de Resend usando la cuenta del proyecto; queda fuera de alcance pero documentado como riesgo para un spec futuro.
