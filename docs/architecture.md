# Events — Arquitectura

> Plataforma web (PWA) para gestión de eventos privados con acceso controlado por invitación.
> Stack: **Next.js 15 (App Router, TS) + Supabase (Postgres + Auth + Storage + RLS) + Serwist (PWA)**.

## 0. Contexto y objetivo

Se necesita un sistema multiusuario basado en roles donde un host administra un evento privado: acepta/rechaza postulaciones, emite invitaciones con QR (1 QR = N entradas), realiza check-in desde el móvil del staff, y habilita a los invitados a reservar regalos, sugerir/votar canciones y subir contenido a una galería moderada.

**Restricción crítica:** el check-in corre en celulares, muchas veces con red inestable. El sistema debe ser app-like e instalable, pero **nunca puede sobrevender entradas** por escaneos offline concurrentes.

---

## 1. Riesgos de diseño detectados (no-negociables)

| # | Riesgo | Decisión |
|---|---|---|
| R1 | Race condition consumiendo entradas de un QR (varios staff escanean el mismo QR sin red) | Consumo **online-only** vía RPC atómica `consume_invitation_entry`. Offline sólo pre-cachea datos del invitado; no libera entradas. |
| R2 | Invitados sin cuenta no pasan RLS (`auth.uid()` es null) | Magic link por invitación → crea `auth.users`. QR en puerta lleva JWT firmado corto verificado dentro de la RPC (role `anon` permitido). |
| R3 | Race en reserva de regalos (stock finito) | RPC `reserve_gift` con `UPDATE ... WHERE stock>0 RETURNING`. Nunca read-then-write en cliente. |
| R4 | Votos duplicados de canciones | `UNIQUE (song_id, user_id)` + `ON CONFLICT DO NOTHING`. |
| R5 | Media sin moderar visible para invitados | Bucket `event-media-pending` vs `event-media-approved`. Edge Function mueve tras aprobar. RLS de `event_media` filtra por `status='approved'`. |
| R6 | Realtime broadcast global escala mal con N eventos | Canal por evento: `event:{id}:dashboard`, `event:{id}:playlist`. |

---

## 2. Layout de repositorio (monorepo-ish)

```
Events/
├── frontend/                 ← Next.js 15 (ya scaffoldeado por vos con create-next-app)
├── supabase/                 ← migrations + config + edge functions (por commitear)
│   ├── config.toml
│   ├── migrations/           ← SQL versionado (tablas, policies, RPCs)
│   ├── seed.sql
│   └── functions/
│       ├── send-invitation/
│       ├── qr-sign/
│       └── media-process/
├── docs/
│   └── architecture.md       ← este archivo
├── .mcp.json                 ← config del MCP de Supabase (ya agregada)
└── README.md
```

**Acción de consolidación:** los archivos que commitee antes en la raíz (`app/`, `utils/supabase/`, `middleware.ts`, `tsconfig.json`, `package.json`, `.env.local`) deben moverse a `frontend/` o descartarse a favor del scaffold fresco de `create-next-app`. Recomiendo **descartar el scaffold raíz** y portar sólo los 3 helpers `utils/supabase/*.ts` a `frontend/utils/supabase/`.

---

## 3. Estructura interna de `frontend/`

```
frontend/
├── app/
│   ├── (auth)/                login, signup, callback, magic-link
│   ├── (public)/              landing, /events/[slug]/apply
│   ├── (app)/                 requiere sesión
│   │   ├── layout.tsx         AppShell (BottomNav, OfflineBanner, InstallPrompt)
│   │   ├── events/page.tsx
│   │   └── events/[eventId]/
│   │       ├── layout.tsx     resuelve membership + role → Context
│   │       ├── (host)/dashboard, applications, invitations, gifts, settings
│   │       ├── (staff)/checkin, checkin/manual
│   │       └── (guest)/invitation, gifts, playlist, gallery
│   ├── api/                   route handlers (checkin proxy, webhooks)
│   ├── manifest.ts            genera /manifest.webmanifest
│   └── globals.css            Tailwind v4
├── modules/                   dominio (no se cruzan entre hermanos)
│   ├── events/                queries.ts, mutations.ts (server actions), schemas.ts, components/, hooks/
│   ├── applications/
│   ├── invitations/
│   ├── checkin/               scanner/, queue/ (IndexedDB sólo metadata)
│   ├── gifts/
│   ├── songs/
│   ├── gallery/
│   └── dashboard/
├── lib/
│   ├── supabase/              server.ts, client.ts, middleware.ts, admin.ts (service role — sólo route handlers)
│   ├── pwa/                   register-sw, install-prompt, wake-lock
│   ├── qr/                    sign/verify JWT del QR
│   ├── realtime/              channels typed wrappers
│   ├── rpc.ts                 wrappers tipados de funciones SQL
│   ├── auth/                  require-role, resolve-membership
│   └── errors.ts
├── components/                UI compartida (shadcn/ui + CVA)
│   ├── ui/
│   └── layout/                AppShell, BottomNav, OfflineBanner, InstallPromptBanner
├── types/
│   ├── supabase.ts            generado: `supabase gen types typescript --linked`
│   └── domain.ts
├── public/
│   ├── icons/                 192, 512, maskable-512, apple-touch-180
│   └── screenshots/
├── worker/
│   └── index.ts               service worker Serwist → compila a /sw.js
└── middleware.ts              refresh sesión + auth gate (existente)
```

**Regla:** `app/` sólo orquesta (layouts, pages, fetching). Lógica en `modules/*`. Un módulo no importa de otro módulo hermano; comparten vía `lib/` o Realtime.

---

## 4. Stack definitivo

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 15 App Router, RSC por defecto | Streaming, menos JS en cliente |
| Lenguaje | TypeScript strict | Tipos generados de Supabase |
| Supabase SDK | `@supabase/ssr` | Cookies SSR + client + middleware |
| Server state | **TanStack Query v5** con `persistQueryClient` a IndexedDB | Cache offline, mutaciones optimistas |
| Client state | **Zustand** (sólo UI: wizard, scanner, modales) | Sin boilerplate |
| Forms | **react-hook-form + Zod** | Validación compartida cliente/server action |
| Styling | **Tailwind v4 + shadcn/ui + CVA** | Mobile-first, componentes owned |
| PWA | **Serwist** (`@serwist/next`) | Sucesor de next-pwa/Workbox, activo, soporta App Router |
| QR scan | **`qr-scanner`** (Nimiq) | Decodifica en Web Worker, usa BarcodeDetector nativo cuando existe |
| QR render | **`qrcode`** server-side | Generado por RPC, nunca en cliente |
| Realtime | Supabase Realtime selectivo | Canales por evento |

Descartados: Redux, SWR, Next-Auth, next-pwa.

---

## 5. Dónde corre cada cosa (frontend vs Supabase vs Edge)

| Operación | Dónde | Razón |
|---|---|---|
| Listar eventos del usuario | RSC + `createClient(cookies)` | RLS filtra, 0 JS cliente |
| Dashboard counters | RSC inicial + Realtime delta | Primera pintura rápida |
| Crear / editar evento | **Server Action** (Zod + supabase) + `revalidatePath` | Tipado end-to-end |
| Aprobar postulación | **RPC `approve_application(app_id, quota)`** | Transaccional: marca + genera invitación + QR |
| Consumir QR | **RPC `consume_invitation_entry(token, scanner_user_id)`** | Atómico, único camino de consumo |
| Reservar regalo | **RPC `reserve_gift(gift_id, invitation_id)`** | `UPDATE ... WHERE stock>0 RETURNING` |
| Votar canción | Insert directo con `UNIQUE(song_id,user_id)` + `ON CONFLICT DO NOTHING` | Idempotente, sin RPC |
| Sugerir canción | Insert directo (RLS) | Sin race |
| Upload galería | Signed URL Storage + insert `event_media pending` | RLS separada; moderación requerida |
| Enviar invitación (email) | **Edge Function** `send-invitation` | Secrets de provider, no en cliente |
| Firmar JWT del QR | **Edge Function** `qr-sign` | Secret en Supabase Vault |
| Procesar media | **Edge Function** `media-process` | Strip EXIF, resize, mover de bucket pending → approved |

Regla: side-effects con secretos o que requieran atomicidad → **RPC o Edge Function**. Nunca service role en cliente.

---

## 6. Estrategia PWA concreta

### 6.1 Service Worker (Serwist)

`frontend/next.config.ts`:

```ts
import withSerwist from '@serwist/next'
export default withSerwist({
  swSrc: 'worker/index.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
})(nextConfig)
```

### 6.2 Tabla de caché

| Patrón | Estrategia | TTL / cap |
|---|---|---|
| `/_next/static/*`, fuentes, íconos | CacheFirst | 1 año |
| Navegaciones (`document`) | NetworkFirst 3s | 1 día |
| Imágenes Storage (galería aprobada) | CacheFirst + expiration | 30 días, 200 entradas |
| Supabase REST GET `/rest/v1/*` | NetworkFirst 2s | 5 min, 50 entradas |
| Mutaciones no-críticas (voto canción) | NetworkOnly + BackgroundSync queue | — |
| **RPC `consume_invitation_entry`** | **NetworkOnly, sin queue** | nunca offline |

### 6.3 Manifest (`app/manifest.ts`)

```ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Events', short_name: 'Events',
    start_url: '/events', display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b0b0f', theme_color: '#0b0b0f',
    icons: [
      { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      { src: '/screenshots/checkin.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow' },
    ],
    categories: ['social', 'events'],
  }
}
```

Más meta tags iOS (`apple-mobile-web-app-capable`, `apple-touch-icon`) en `app/layout.tsx`.

### 6.4 Instalación

- Client component en `(app)/layout.tsx` captura `beforeinstallprompt` → Zustand.
- Botón "Instalar app" en settings y banner dismissable post-login.
- iOS: detectar `isIOS && !isStandalone` → instrucciones "Compartir → Añadir a pantalla inicio".

### 6.5 Módulo check-in (crítico)

- Ruta `(staff)/checkin`: `requestFullscreen`, `wakeLock` activo, `navigator.vibrate(100)` en éxito.
- Scanner en Web Worker (qr-scanner).
- **Prefetch** al abrir: `{invitation_id, holder_name, avatar, remaining_entries}` → IndexedDB. Ve al invitado incluso sin red.
- Flujo por escaneo: decode local (preview optimista) → POST RPC → 200 verde+vibrate / error rojo bloqueante.
- Offline durante POST: banner "Sin conexión, reintento automático". **No libera la cola hasta reconectar. Responsabilidad humana dejar pasar, no del sistema.**
- Modo manual: buscador por nombre/teléfono, mismo RPC.

### 6.6 Degradación offline por vista

| Vista | Offline |
|---|---|
| Dashboard host | Snapshot cacheado + banner "datos hace X min" |
| Mi invitación (QR) | **Siempre** funcional, cacheado agresivo al primer load |
| Check-in | Prefetch lista, consumo requiere red |
| Regalos / playlist / galería | Read cache, mutaciones encoladas con toast |
| Postulación pública | NetworkFirst, fallback "sin conexión" |

---

## 7. Seguridad Supabase (no-negociables)

1. **Tipos en CI:** `supabase gen types typescript --linked > frontend/types/supabase.ts`.
2. **RLS en toda tabla**. Helper reusable:
   ```sql
   create function is_event_member(e uuid, min_role text default 'guest')
   returns boolean language sql stable security definer as $$ ... $$;
   ```
   Policies: `using (is_event_member(event_id, 'staff'))`.
3. **Storage policies** paralelas: bucket `event-media` valida `event_media.status='approved'` + membership.
4. **QR token** = JWT HS256 corto, secret en Supabase Vault. Payload `{inv_id, exp}`. Verificación en RPC (no en cliente). Rotable.
5. **Rate limit** en Edge Functions: `apply`, `suggest_song`, `send-invitation` (tabla rate + pg_cron, o Upstash).
6. Nunca `NEXT_PUBLIC_*` con service role. Anon key en cliente depende 100% de RLS.

---

## 8. Roadmap de implementación (fases)

### Fase 0 — Fundaciones (esta sesión / próxima)
- [ ] Consolidar scaffolding: descartar raíz previa, mover `utils/supabase/*` a `frontend/`.
- [ ] `supabase init` en raíz → `supabase/` con config + migrations.
- [ ] `supabase db pull` (usando MCP o CLI) → commitea schema actual a `supabase/migrations/`.
- [ ] `supabase gen types typescript --linked > frontend/types/supabase.ts`.
- [ ] Documentar RPCs existentes y detectar gaps (ver §9).

### Fase 1 — PWA base
- [ ] Instalar `@serwist/next serwist`, configurar `next.config.ts` + `worker/index.ts`.
- [ ] `app/manifest.ts`, íconos (192/512/maskable), screenshots, meta iOS.
- [ ] `AppShell` + `BottomNav` + `OfflineBanner` + `InstallPromptBanner`.
- [ ] Instalar shadcn/ui, configurar theme dark-first.
- [ ] Verificar Lighthouse PWA ≥ 90.

### Fase 2 — Auth y scope de evento
- [ ] Páginas `(auth)/login`, `callback`, magic link.
- [ ] `middleware.ts` gate: `(app)/*` requiere sesión.
- [ ] `app/(app)/events/[eventId]/layout.tsx` resuelve `event_users` → context `{role, event}`.
- [ ] `lib/auth/require-role.ts` helper para server actions y route handlers.

### Fase 3 — Flujos host
- [ ] Crear / editar evento (wizard 3 pasos: info → fecha/lugar → admins).
- [ ] Listado + detalle de postulaciones con acciones approve/reject/waitlist (RPC `approve_application`).
- [ ] Generación masiva de invitaciones con cupo configurable; renderiza QR server-side (RPC + `qrcode`).
- [ ] Vista de invitación (guest) con QR grande + datos del evento + contador de entradas restantes.

### Fase 4 — Check-in
- [ ] Scanner fullscreen + Web Worker + wake-lock.
- [ ] RPC contract tipado en `lib/rpc.ts`.
- [ ] Modo manual con búsqueda fuzzy.
- [ ] Registro en `event_checkins` con auditoría (scanner_id, timestamp, delta).
- [ ] Test end-to-end: 2 staff simulados escaneando mismo QR con red flaky.

### Fase 5 — Módulos sociales
- [ ] Regalos: lista + reserva con RPC `reserve_gift`, vista "mi reserva" cancelable.
- [ ] Canciones: sugerir (con Spotify preview opcional), votar, ranking realtime.
- [ ] Galería: upload con signed URL, queue de moderación para host, grid infinito keyset.

### Fase 6 — Dashboard + realtime
- [ ] Contadores (postulaciones, confirmados, esperados, ingresados).
- [ ] Tabla materializada `event_stats` + triggers para evitar `count(*)` en cada render.
- [ ] Suscripciones Realtime selectivas por canal de evento.
- [ ] Export CSV de check-ins y postulaciones.

---

## 9. RPCs esperadas (validar con MCP en Fase 0)

| RPC | Input | Output | Atomicidad |
|---|---|---|---|
| `approve_application` | `app_id uuid, quota int` | `invitation_id uuid` | tx: update status + insert invitation + firmar QR |
| `consume_invitation_entry` | `qr_token text, scanner_user_id uuid` | `{ok, remaining, holder, reason?}` | `UPDATE ... WHERE remaining>0 RETURNING` + insert `event_checkins` |
| `reserve_gift` | `gift_id uuid, invitation_id uuid` | `reservation_id uuid` | `UPDATE ... WHERE stock>0 RETURNING` + insert reservation |
| `cancel_gift_reservation` | `reservation_id uuid` | `void` | tx: delete + stock++ |
| `vote_song` | `song_id uuid` | `{ok, total_votes}` | insert `ON CONFLICT DO NOTHING` |

Si alguna falta, crearla en Fase 0.

---

## 10. Escalabilidad

- Índices compuestos: `(event_id, status)` en `event_applications`, `event_invitations`, `event_media`.
- Realtime por canal `event:{id}:*` — evita N×M.
- Dashboard counters via `event_stats` materializado + triggers.
- Galería: paginación keyset `(created_at, id)`, **no** offset.
- Observabilidad: Sentry (browser + edge) + Supabase logs. `event_checkins` ya da auditoría.

---

## 11. Open questions / a confirmar con schema real (Fase 0)

1. ¿`event_invitations` tiene ya columna `qr_token` y `max_entries`/`remaining_entries`, o hay que migrar?
2. ¿Existe la RPC `consume_invitation_entry` y cumple la semántica atómica? ¿Qué hace con "titular debe entrar primero"?
3. ¿`event_users.role` es enum? ¿Qué roles exactos: host, admin, staff, guest?
4. ¿`event_media.status` enum y qué valores?
5. ¿Buckets de Storage actuales y sus policies?
6. ¿Schema de `profiles` (nombre visible, avatar, teléfono)?
7. ¿Hay soft-delete en alguna tabla?
