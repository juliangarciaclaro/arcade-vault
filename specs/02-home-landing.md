# 02 — Home / Landing Page de Arcade Vault

**Estado:** Aprobado
**Depende de:** SPEC 01
**Fecha:** 2026-09-14

**Objetivo:** Implementar la landing page de Arcade Vault en `/`, portando `references/templates/home-about/home.jsx`, reubicando la pantalla de Biblioteca (hoy en `/`) a la nueva ruta `/games` y actualizando el Nav y los enlaces internos que asumían que `/` era la Biblioteca.

## Alcance

**Incluye:**
- Port de `home.jsx`: hero (silhouettes flotantes + CTAs), sección "¿Por qué Arcade Vault?" (feature-grid), sección "Juegos disponibles ahora" (mini-rail reutilizando `GAMES.slice(0, 6)` vía tarjetas `MiniCard`, enlazando a `/juegos/[id]`), bloque de stats, sección "Actividad en vivo" (ticker de últimas puntuaciones + top jugadores, hardcodeados como constantes igual que el prototipo), sección de precios + FAQ, y CTA final.
- Efecto reveal-on-scroll (hook con `IntersectionObserver` que agrega la clase `.in` a los elementos `.reveal`), portado igual que en el prototipo, con limpieza (`disconnect`) al desmontar.
- Mover el contenido actual de Biblioteca (buscador, chips de categoría, grid de `GameCard`) de `app/page.tsx` a una nueva ruta `app/games/page.tsx`, sin cambiar su comportamiento.
- Actualizar `app/components/Nav.tsx`: agregar un link "Inicio" (→ `/`) y renombrar el link "Biblioteca" para que apunte a `/games`, ajustando la lógica de estado activo (`isActive`) tanto en el nav de escritorio como en el panel móvil. El logo sigue apuntando a `/`.
- Actualizar los enlaces internos que hoy asumen que `/` es la Biblioteca, para que apunten a `/games`: botón "VOLVER AL VAULT" en `app/juegos/[id]/page.tsx`, enlace de regreso en `app/salon-de-la-fama/page.tsx`, redirect tras iniciar sesión/crear cuenta/entrar como invitado en `app/login/page.tsx`, y botón de salir en `app/components/GamePlayerScreen.tsx`.
- Portar a `app/globals.css` las clases de `references/templates/home-about/styles.css` que usa el Home: `home-hero`, `home-hero-inner`, `hero-eyebrow`, `home-title` (`line-1/2/3`), `home-sub`, `home-ctas`, `hero-scroll`, `home-silos` y sus `silo s1..s8` (con animaciones), `home-section`, `section-head`, `kicker`, `section-title`, `section-rule`, `feature-grid`, `feature-card`, `ft-icon`, `ft-title`, `ft-desc`, `mini-rail`, `mini-card`, `mini-cover`, `mini-meta`, `mini-title`, `mini-cat`, `home-stats`, `stats-inner`, `stat-block`, `stat-n`, `stat-u`, `stat-s`, `activity-grid`, `activity-card`, `ac-head`, `ac-title`, `lb-link`, `ticker`, `tick-row`, `tk-p`, `tk-mid`, `tk-s`, `tk-t`, `top-list`, `top-row` (`top1/2/3`), `tp-rk`, `tp-bar`, `tp-fill`, `tp-p`, `tp-s`, `pricing-grid`, `price-card`, `pc-label`, `pc-name`, `pc-amount` (`-n`/`-u`), `pc-tag`, `pc-list`, `pc-foot`, `pc-stamp`, `pricing-faq`, `faq-item`, `faq-q`, `faq-a`, `home-final`, `final-title`, `final-cta`, `final-tag`, y el patrón `.reveal`/`.in`.
- Componente(s) cliente para el contenido del Home, reutilizando `GAMES` de `app/data/games.ts`, siguiendo el mismo patrón de "página como client component" ya usado en el proyecto.

**No incluye:**
- La pantalla About/Contacto (`about.jsx`) — queda para un spec futuro (decisión explícita del usuario).
- Agregar el link "Acerca de" al Nav — no aplica mientras no exista esa pantalla.
- Conectar la sección "Actividad en vivo" a `seededScores` o a datos reales — se deja hardcodeada como constante, igual que el prototipo (decisión explícita del usuario).
- Cualquier cambio al comportamiento o a los datos de la Biblioteca (`GameCard`, filtros, buscador) más allá de moverla de ruta.
- Créditos/monetización funcional (el contador del Nav sigue siendo decorativo).

## Modelo de datos

No se introducen nuevas estructuras persistentes. El Home reutiliza `GAMES` de `app/data/games.ts` (`GAMES.slice(0, 6)`) para la sección "Juegos disponibles ahora". Las listas de "ÚLTIMAS PUNTUACIONES" y "TOP JUGADORES · HOY" quedan como constantes locales dentro del componente Home (mock estático embebido, igual que en el prototipo — no se centralizan en `app/data/` porque no representan un dataset reutilizable, solo contenido de ejemplo para esta sección).

## Plan de implementación

1. **Mover Biblioteca a `/games`.** Crear `app/games/page.tsx` con el contenido íntegro que hoy tiene `app/page.tsx` (buscador, chips, grid de `GameCard`), sin cambios de comportamiento. El sistema sigue funcional; `/games` ahora muestra la Biblioteca.
2. **Actualizar enlaces internos que apuntaban a `/`.** Cambiar a `/games`: "VOLVER AL VAULT" (`app/juegos/[id]/page.tsx`), el enlace de regreso en `app/salon-de-la-fama/page.tsx`, el redirect post-login/registro/invitado en `app/login/page.tsx`, y el botón de salir en `app/components/GamePlayerScreen.tsx`.
3. **Actualizar el Nav.** Agregar el link "Inicio" (→ `/`), renombrar el link "Biblioteca" para que apunte a `/games`, y ajustar `isActive`/equivalente (home activo solo en `/`; biblioteca activa en `/games` y `/juegos/*`) tanto en el nav de escritorio como en el panel móvil. El logo sigue apuntando a `/`.
4. **Portar el CSS.** Copiar a `app/globals.css` las clases listadas en Alcance desde `references/templates/home-about/styles.css`, incluyendo las animaciones de los silhouettes y el patrón `.reveal`/`.in`.
5. **Construir el Home (`app/page.tsx`).** Reemplazar el contenido que se movió en el paso 1 por la landing: hook `useReveal` (IntersectionObserver client-side, con `disconnect` al desmontar), `FloatingSilhouettes`, hero con CTAs ("EXPLORAR JUEGOS" → `/games`, "CREAR CUENTA" → `/login`), sección "¿Por qué Arcade Vault?" (feature-grid con `FeatureIcon`), sección "Juegos disponibles ahora" (mini-rail con `GAMES.slice(0, 6)` vía `MiniCard` enlazando a `/juegos/[id]`, botón "VER TODOS LOS JUEGOS →" a `/games`), sección de stats, sección "Actividad en vivo" (ticker + top-list hardcodeados, botón "VER SALÓN →" a `/salon-de-la-fama`), sección de precios + FAQ (CTA "EMPEZAR GRATIS →" a `/login`), y CTA final ("INSERTAR MONEDA →" a `/games`). Todo como client component en `app/page.tsx`, igual patrón que el resto del proyecto.
6. **Revisión final.** Comparar `app/globals.css` contra `references/templates/home-about/styles.css` para confirmar que ninguna clase usada por el Home quedó fuera, probar manualmente la navegación completa (`/`, `/games`, `/juegos/[id]`, `/login`, `/salon-de-la-fama`) y el drawer móvil, y correr `npm run build`.
7. **Validación con Playwright MCP.** Con el servidor de desarrollo corriendo, usar el MCP de Playwright para navegar `/` y `/games` en viewport de escritorio y en viewport móvil (~400px), verificar que los CTAs y links del Home (paso 5) y del Nav (paso 3) llevan a las rutas correctas, comprobar que el drawer móvil abre/cierra y que el efecto reveal-on-scroll se dispara, y capturar screenshots de evidencia (guardados en `.playwright-screenshots/`, según la convención del proyecto) de ambos viewports. Si algo no coincide con lo solicitado en este spec, corregirlo antes de dar el paso por terminado.

## Criterios de aceptación

- [ ] `/` muestra la nueva landing (hero, "¿por qué Arcade Vault?", "juegos disponibles ahora", stats, "actividad en vivo", precios, CTA final), con el efecto reveal-on-scroll activo al hacer scroll.
- [ ] `/games` muestra exactamente la pantalla de Biblioteca (buscador + chips + grid) que antes vivía en `/`, sin cambios de comportamiento.
- [ ] El Nav muestra "Inicio" (→ `/`) y "Biblioteca" (→ `/games`) como links separados, y resalta el link activo correctamente tanto en escritorio como en el drawer móvil.
- [ ] Desde el Home: "EXPLORAR JUEGOS" y "VER TODOS LOS JUEGOS →" navegan a `/games`; "CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/login`; las tarjetas de "juegos disponibles ahora" navegan a `/juegos/[id]`; "VER SALÓN →" navega a `/salon-de-la-fama`; "INSERTAR MONEDA →" navega a `/games`.
- [ ] "VOLVER AL VAULT" en el Detalle de juego, el enlace de regreso en el Salón de la Fama, el redirect tras iniciar sesión/crear cuenta/entrar como invitado, y el botón de salir en la pantalla "Jugar" apuntan todos a `/games`.
- [ ] El logo del Nav sigue apuntando a `/` desde cualquier pantalla.
- [ ] El look pixel-art/neón y el layout responsive del Home coinciden con el prototipo tanto en escritorio como en un viewport móvil (~400px de ancho).
- [ ] `npm run build` compila sin errores de tipos.

## Decisiones tomadas y descartadas

- **Home reemplaza a Biblioteca en `/`, y Biblioteca se muda a `/games`.** Razón (indicación explícita del usuario): alinear la estructura de rutas con el prototipo, donde el landing de marketing vive en la raíz y la Biblioteca es una pantalla aparte.
- **Los enlaces internos que antes daban por hecho que `/` era la Biblioteca** (volver al vault, regreso desde el salón, redirect post-login, salir de la partida) **se actualizan a `/games`**, no a `/`. Razón: son destinos funcionales dentro de la app (seguir jugando, ver el ranking), no la landing de marketing; mandarlos a `/games` preserva el flujo real de uso. Es una decisión no ambigua tomada al escribir este spec, documentada aquí para que quede explícita.
- **Sección "Actividad en vivo" se deja hardcodeada como constante**, igual que el prototipo, sin conectarla a `seededScores` ni a datos reales. Razón (indicación explícita del usuario): evitar complejidad innecesaria ahora; se puede conectar a datos reales en un spec futuro cuando exista persistencia real.
- **Sección "Juegos disponibles ahora" reutiliza el array `GAMES` ya existente** en `app/data/games.ts` en vez de crear un dataset nuevo. Razón (indicación explícita del usuario): no hay necesidad de un dataset separado para esta vista.
- **About/Contacto queda fuera de este spec.** Razón (indicación explícita del usuario): mantener el spec enfocado solo en Home; About se define en un spec futuro.
- **El CSS del Home se porta a `app/globals.css`**, siguiendo el mismo patrón que el spec 01, en vez de crear un archivo CSS separado. Razón: mantener consistencia con el resto del proyecto, que centraliza todos los estilos en un único `globals.css`.

## Riesgos identificados

- **Componente Home extenso.** Mantenerlo como un único client component en `app/page.tsx` sigue el patrón ya usado en el proyecto (ver `app/juegos/[id]/jugar/page.tsx`), pero es la pantalla con más secciones hasta ahora; no se divide en subcomponentes en este spec para no introducir abstracción prematura.
- **Limpieza del `IntersectionObserver`.** Al no haber recarga completa de página entre rutas de Next.js, el hook `useReveal` debe desconectar el observer al desmontar (igual que en el prototipo) para evitar fugas al navegar repetidamente hacia y desde `/`.
