# 01 — MVP Pantallas Visuales de Arcade Vault

**Estado:** Implementado
**Depende de:** ninguno
**Fecha:** 2026-09-13

**Objetivo:** Implementar en Next.js App Router (con rutas de archivo reales) las cinco pantallas visuales de Arcade Vault —Biblioteca, Detalle de Juego, Jugar, Login y Salón de la Fama— portando el diseño y comportamiento del prototipo estático en `references/templates/`, con datos ficticios en `app/data/` como placeholder de una futura base de datos, sin implementar ningún juego real.

## Alcance

**Incluye:**
- Migración de las 5 pantallas del prototipo (`references/templates/*.jsx`) a rutas reales de App Router, en TypeScript, con los tipos generados (`PageProps<...>`, `LayoutProps<...>`).
- Navegación (`Nav`) sticky con menú responsive (drawer móvil), igual al prototipo.
- Datos ficticios (catálogo de juegos, categorías, jugadores y generador de puntuaciones `seededScores`) centralizados en `app/data/`, documentados como placeholder que eventualmente vendrá de una base de datos.
- Sesión de usuario simulada 100% client-side (login/registro/invitado), persistida en `localStorage`, igual que el prototipo.
- Pantalla "Jugar" implementada como maqueta/placeholder que replica tal cual el comportamiento visual del prototipo (HUD, arena CRT animada por CSS, puntuación autoincremental falsa, modal de fin de partida con guardado de puntuación en `localStorage`). No es un juego real ni contiene lógica de ningún juego específico — es el mismo placeholder genérico para los 8 juegos del catálogo, a la espera de que cada juego real se integre en un spec futuro.
- Reutilización del CSS ya portado en `app/globals.css` (clases `pixel`, `neon-*`, `.card`, `.btn`, `.crt`, etc.) y de las fuentes ya configuradas en `app/layout.tsx` (Press Start 2P / JetBrains Mono). Cualquier maquetación nueva que no dependa del look pixel-art específico del prototipo se hace con utilidades de Tailwind.
- Diseño responsive igual al del prototipo (breakpoints ya definidos en `globals.css`).

**No incluye:**
- Ningún motor de juego real ni lógica de juego específica por título (bloque buster, caída, serpentina, etc.). La pantalla "Jugar" es únicamente una maqueta genérica.
- Backend, base de datos o API real. Todo dato es mock estático o simulado en `localStorage`.
- Autenticación real (contraseñas verificadas, OAuth funcional, JWT, etc.). Los botones "GOOGLE"/"GITHUB" son solo visuales, no funcionales.
- Persistencia real de puntuaciones que alimente el Salón de la Fama o el leaderboard del Detalle: esas tablas siguen usando el generador `seededScores` (mock determinista), igual que en el prototipo. Guardar una puntuación en la pantalla "Jugar" la escribe en `localStorage` pero no se refleja en esas tablas (limitación heredada del prototipo, fuera de alcance de este spec).
- Créditos/monedas funcionales (el contador "CRÉDITOS · 03" del Nav es decorativo, igual que en el prototipo).
- Tests automatizados (no hay test runner configurado en el proyecto).

## Modelo de datos

Todo vive en `app/data/` como TypeScript, con la nota explícita (comentario en el archivo) de que es un placeholder temporal hasta que exista una base de datos real.

- **`app/data/games.ts`**
  - `type Game = { id: string; title: string; short: string; long: string; cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS"; cover: string; color: "cyan" | "magenta" | "green" | "yellow"; best: number; plays: string }`
  - `GAMES: Game[]` — los mismos 8 juegos del prototipo (bloque-buster, caida, serpentina, gloton, invasores, rocas, ranaria, duelo-pixel), con los mismos campos.
  - `CATS: string[]` — `["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]`.
- **`app/data/players.ts`**
  - `PLAYERS: string[]` — lista de nombres ficticios para generar tablas de puntuaciones.
  - `type ScoreRow = { rank: number; name: string; score: number; date: string }`
  - `seededScores(seed: number, count?: number): ScoreRow[]` — mismo generador pseudoaleatorio determinista del prototipo (LCG simple), portado a TypeScript.
- **Sesión de usuario (client-side, no en `app/data/`):**
  - `type User = { name: string }` guardado en `localStorage["av_user"]`.
  - Entradas de puntuación guardadas al terminar una partida: `{ game: string; score: number; name: string; at: number }` en `localStorage["av_scores"]` (array).

## Plan de implementación

1. **Datos mock.** Crear `app/data/games.ts` y `app/data/players.ts` portando `GAMES`, `CATS`, `PLAYERS` y `seededScores` desde `references/templates/data.jsx` a TypeScript tipado. El sistema queda funcional (compila, aunque sin UI nueva).
2. **Sesión global + Nav.** Crear un hook/contexto cliente para leer/escribir el usuario en `localStorage["av_user"]` (equivalente a `handleLogin`/`handleSignOut` de `app.jsx`), y un componente `Nav` (client component) que lo consuma, con logo, links a `/` y `/salon-de-la-fama`, botón de auth, contador de créditos decorativo y drawer móvil. Se monta en `app/layout.tsx` para que aparezca en todas las rutas. El sitio ya navega (aunque las páginas destino aún sean las actuales).
3. **Biblioteca (`app/page.tsx`).** Reemplazar el `Home` actual por la pantalla completa: hero con flicker, buscador, chips de categoría, grid de `GameCard` (con el tilt 3D al mover el mouse) enlazando a `/juegos/[id]` vía `next/link`. Estado de filtro (`q`, `cat`) en un client component.
4. **Detalle (`app/juegos/[id]/page.tsx`).** Portada, tags, descripción, stat-strip (partidas, mejor global, dificultad), botones "JUGAR AHORA" (→ `/juegos/[id]/jugar`) y "VOLVER AL VAULT", y leaderboard lateral usando `seededScores`. Usa `PageProps<'/juegos/[id]'>` y `await params`. Si el `id` no existe en `GAMES`, usar `notFound()`.
5. **Jugar (`app/juegos/[id]/jugar/page.tsx`).** Client component con el HUD (jugador, puntuación, vidas, nivel), botones pausa/fin/salir, el marco `crt` con la arena animada por CSS (nave + enemigos), y el modal de fin de partida con input de iniciales y botón "GUARDAR PUNTUACIÓN" que escribe en `localStorage["av_scores"]`. Replica el comportamiento del prototipo (puntuación autoincremental cada 220ms mientras no esté en pausa/fin, subida de nivel cada 2500 puntos).
6. **Login (`app/login/page.tsx`).** Tarjeta con tabs "INICIAR SESIÓN"/"CREAR CUENTA", campos usuario/correo/contraseña, botón "JUGAR COMO INVITADO", botones sociales decorativos. Al enviar el formulario (o entrar como invitado), guarda el usuario simulado en `localStorage["av_user"]` y redirige a `/`.
7. **Salón de la Fama (`app/salon-de-la-fama/page.tsx`).** Tabs por juego (uno por cada `Game`), podio (2°/1°/3°) y tabla completa usando `seededScores`, más la fila "TU MEJOR MARCA" cuando hay sesión activa, igual que el prototipo.
8. **Revisión final.** Comparar `app/globals.css` contra `references/templates/styles.css` para confirmar que ninguna clase quedó fuera, y probar manualmente los 5 flujos de navegación (incluida la versión móvil del Nav) en el servidor de desarrollo.

## Criterios de aceptación

- [ ] `/` muestra la Biblioteca: buscador y chips de categoría filtran el grid en tiempo real; cada tarjeta enlaza a `/juegos/[id]`.
- [ ] `/juegos/[id]` muestra la información del juego correspondiente y una tabla de puntuaciones generada con `seededScores`; un `id` inexistente muestra la página 404 de Next.js.
- [ ] Desde el Detalle, "JUGAR AHORA" navega a `/juegos/[id]/jugar` y muestra el HUD, la arena CRT animada y los controles de pausa/fin/salir.
- [ ] Al finalizar la partida (botón "FIN"), aparece el modal con la puntuación final; al guardar, se persiste en `localStorage["av_scores"]` y se muestra el mensaje de confirmación.
- [ ] `/login` permite iniciar sesión, crear cuenta o entrar como invitado; cualquiera de las tres acciones guarda un usuario en `localStorage["av_user"]`, redirige a `/` y el Nav pasa a mostrar el nombre de usuario.
- [ ] Cerrar sesión desde el Nav borra `localStorage["av_user"]` y el Nav vuelve a mostrar "Iniciar Sesión".
- [ ] `/salon-de-la-fama` permite cambiar de juego con los tabs, muestra podio y tabla, y agrega la fila "TU MEJOR MARCA" únicamente cuando hay una sesión activa.
- [ ] El Nav (incluido el drawer móvil) y todas las pantallas conservan el look pixel-art/neón del prototipo en escritorio y en un viewport móvil (~400px de ancho).
- [ ] `npm run build` compila sin errores de tipos.

## Decisiones tomadas y descartadas

- **Rutas reales de App Router** en vez de replicar el hash-router del prototipo. Razón: es lo idiomático en Next.js 16 y evita reinventar el enrutador manual del SPA original.
- **Datos ficticios centralizados en `app/data/`**, explícitamente documentados como placeholder de una futura base de datos, en vez de dejarlos embebidos dentro de cada componente. Razón: facilita el reemplazo futuro por una fuente real sin tocar la UI.
- **Pantalla "Jugar" como maqueta genérica** que replica el comportamiento visual del prototipo (incluyendo el guardado de puntuación en `localStorage`), en vez de omitirla o dejarla como enlace roto. Razón (indicación explícita del usuario): es un placeholder temporal mientras se integran los juegos reales uno por uno en specs futuros; conservar el comportamiento del prototipo evita perder esa referencia visual.
- **Sesión y puntuaciones simuladas en `localStorage`**, sin backend, igual que el prototipo. Razón (indicación explícita del usuario): "igual que el guardado de puntuaciones" — se mantiene consistencia entre ambos mecanismos de persistencia falsa.
- **CSS existente en `app/globals.css` se reutiliza tal cual** (ya fue portado desde `styles.css`); todo lo nuevo que no dependa del estilo pixel-art específico se construye con utilidades de Tailwind, no con más CSS a medida. Razón (indicación explícita del usuario).
- **El leaderboard del Detalle y el Salón de la Fama no se alimentan de las puntuaciones guardadas en `localStorage["av_scores"]`**, se mantienen con `seededScores` mock. Razón: es el comportamiento exacto del prototipo y conectar ambas fuentes de datos es una decisión de producto (¿se mezclan, se prioriza el usuario real, etc.?) que corresponde a un spec futuro cuando haya persistencia real.

## Riesgos identificados

- **Next.js 16 cambia `params` a una Promise** en páginas dinámicas (`app/juegos/[id]/page.tsx`, `.../jugar/page.tsx`): hay que usar `await params` y los tipos `PageProps<'/juegos/[id]'>` generados, no interfaces manuales con `params: { id: string }`.
- **Fuentes ya configuradas** (`Press_Start_2P`, `JetBrains_Mono` vía `next/font/google` en `app/layout.tsx`, expuestas como `--font-pixel`/`--font-mono-app`): no reintroducir los `<link>` de Google Fonts del `Arcade Vault.html` original, se reutilizan las variables ya existentes.
- **Confusión sobre "autenticación real"**: al ser una simulación client-side sin verificación real, debe quedar claro (código y este spec) que no es un mecanismo de seguridad, solo una maqueta de UX para el MVP visual.
