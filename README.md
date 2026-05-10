# Objectif Civique — Console admin (V2)

Production-grade Next.js 16 + Tailwind v4 + Motion implementation of the
Objectif Civique back-office. V2 layers a Zustand-persisted data layer,
ConfirmDialog, a cmdk command palette, Sonner toasts, role-based auth,
live brand theming, and 11 new modules on top of V1's 8 MVP screens.

---

## Stack

- **Next.js 16** App Router · **React 19.2** · **TypeScript 5** strict
- **Tailwind CSS v4** — CSS-first via `@theme {}` in `app/globals.css`
- **Motion** (`motion/react`) — drawer/palette/page entrance animations
- **Zustand** + persist middleware — every entity in `src/stores/`
- **Sonner** — global toast layer (mounted in admin layout)
- **cmdk** — Cmd/Ctrl+K command palette (`CommandPaletteHost`)
- **react-hook-form + zod** — installed; used selectively where forms warrant it
- **@dnd-kit/sortable** — installed (used by Cours via simple up/down for V2; full DnD planned for V2.1)
- **recharts** · **lucide-react**

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run start
npm run lint
npm run typecheck
```

## Architecture

```
app/
├─ layout.tsx                          root layout: Inter via next/font, Satoshi <link>
├─ globals.css                         Tailwind v4 + @theme tokens + component CSS
├─ page.tsx                            redirects to /login
├─ not-found.tsx                       global 404
├─ (auth)/login/                       magic-link login
└─ (admin)/
   ├─ layout.tsx                       Sidebar + Topbar + AdminProviders (toaster/palette/confirm)
   ├─ dashboard/                       includes V2DashboardWidgets (forum / library / plans)
   ├─ users · questions · articles · centers · coaches · partners
   ├─ library/{page,fiches,notions,cours}
   ├─ forum/page · forum/[threadId]
   ├─ testimonials · achievements · eligibility
   ├─ plans · coaching-offers · analytics
   ├─ settings/{layout,page,general,admins,integrations,notifications,data,branding}
   └─ [...placeholder]/                catch-all → notFound()

src/
├─ components/
│  ├─ shell/{Sidebar,Topbar,TricolorStrip,AdminProviders}.tsx
│  ├─ ui/{StatusBadge,KpiCard,FilterChip,Avatar,Drawer,Pagination,Checkbox,
│  │      MarkdownEditor,DataTableHeader,ChartCard,Segmented,
│  │      ConfirmDialog,CommandPalette}.tsx
│  └─ dashboard/V2Widgets.tsx
├─ stores/                             Zustand (all `oc-admin-*` localStorage)
│  ├─ _entityStore.ts                  generic CRUD store factory
│  ├─ useUsers / useQuestions / useArticles / useCenters / useCoaches / usePartners
│  ├─ useFiches / useNotions / useCours
│  ├─ useForumThreads / useTestimonials / useAchievements / useEligibility
│  ├─ usePlans / useCoachingOffers
│  ├─ useAdmins / useIntegrations / useNotificationSettings
│  ├─ useBranding (live CSS-var update) / useAuth (role)
├─ data/                               seed data per module
├─ types/index.ts                      single source of truth for types
└─ lib/{markdown,utils,api,commandRegistry}.ts
```

### Store factory

`src/stores/_entityStore.ts` exports `createEntityStore<T>` — one-line
stores like `useFiches.ts` that get add/upsert/update/remove/bulk\* +
`reset()` for free, all persisted under `oc-admin-<name>`.

### ConfirmDialog

```ts
import { confirmAction } from "@/components/ui/ConfirmDialog";

const ok = await confirmAction({
  title: "Supprimer ?",
  message: "Action irréversible.",
  destructive: true,
});
if (!ok) return;
```

`ConfirmDialogHost` is mounted globally in `AdminProviders`.

### Command palette

Cmd/Ctrl+K opens the palette anywhere in the admin shell. Static
commands live in `src/lib/commandRegistry.ts`; dynamic entries
(forum threads, testimonials, fiches by name) are pulled from the
relevant store inside `CommandPaletteHost`.

### Live branding

`useBranding` writes the chosen primary color back to
`document.documentElement` as `--primary` / `--color-primary` /
`--primary-hover` / `--primary-fixed`. The sidebar background, KPI
icon backgrounds, and any utility derived from `var(--primary)` update
in real time. Settings → Branding is the canonical surface.

### Roles

`useAuth` exposes a `role: "super-admin" | "editor" | "moderator"`.
`canDo(role, action)` in `src/stores/useAuth.ts` is the gate. Settings
→ Admins exposes a "Connecter en tant que…" switcher for testing the
three roles without leaving the session.

### Mock data + persistence

All entities are seeded from `src/data/*.ts`. Every admin mutation
flows through a Zustand store, which persists to localStorage. A
single "Réinitialiser les données démo" action in
**Settings → Données** wipes all `oc-admin-*` keys and reloads the page.

## V2 module map

| Module | Route | Store | Notes |
|---|---|---|---|
| Library hub | `/library` | — | aggregates 3 sub-stores |
| Fiches | `/library/fiches` | `useFiches` | split-view drawer w/ live mobile preview |
| Notions | `/library/notions` | `useNotions` | wide drawer, edit/preview toggle |
| Cours | `/library/cours` | `useCours` | tree + editor + up/down reorder |
| Forum | `/forum` | `useForumThreads` | tabs: threads / signalements |
| Forum thread | `/forum/[id]` | `useForumThreads` | dedicated route (rich detail) |
| Testimonials | `/testimonials` | `useTestimonials` | featured-singleton |
| Achievements | `/achievements` | `useAchievements` | DSL test panel against demo user |
| Eligibility | `/eligibility` | `useEligibility` | 2-pane editor + tester modal |
| Plans | `/plans` | `usePlans` | price history per plan |
| Coaching offers | `/coaching-offers` | `useCoachingOffers` | conversion funnel chart |
| Analytics | `/analytics` | reads V1 stores | 6 panels + global filters + print export |
| Settings/general | `/settings/general` | `useBranding` | live primary color |
| Settings/admins | `/settings/admins` | `useAdmins` | invite / role / impersonate |
| Settings/integrations | `/settings/integrations` | `useIntegrations` | 5 mocked integrations |
| Settings/notifications | `/settings/notifications` | `useNotificationSettings` | per-event toggles |
| Settings/data | `/settings/data` | (all) | export / import / reset |
| Settings/branding | `/settings/branding` | `useBranding` | logo, color, custom CSS |

## Walkthrough — every module passes

1. Open from sidebar → list / hub renders.
2. Filter / search / sort works.
3. Row click → drawer (or detail route) opens with correct data.
4. Edit a field → Save toasts → list reflects change.
5. Delete → ConfirmDialog → confirmed → entity removed → toast.
6. Reload → all changes still there.
7. Settings → Données → Réinitialiser → all back to seed.

## Cmd+K examples

- Type "fiche" → jump to Fiches list, or jump to a specific fiche by name
- Type "rapport" → "Exporter le rapport analytics"
- Type "réinitialiser" → "Réinitialiser les données démo"
- Type "plans" → /plans
- Type "stripe" → settings/integrations

## Quality gates

- `npm run dev` starts cleanly
- `npm run build` succeeds
- `npm run lint` passes
- `npx tsc --noEmit` passes (strict, zero `any` in app code)
- Sidebar has zero v2 placeholders left
- Catch-all renders the global `not-found.tsx`
- All 11 V2 modules survive a reload

## Honest scope notes (V2 → V2.1 punch-list)

The V2 spec was ambitious; a few flourishes were intentionally pared
back to ship the core:

- **V1 page form retrofit** — V1 drawers (Users / Questions / Articles /
  Centers / Coaches / Partners) still use uncontrolled `defaultValue`
  inputs. The reads now come from Zustand stores, deletes are wired,
  but Save handlers in V1 drawers no-op. Refactor to controlled
  inputs + `store.upsert` in V2.1.
- **Drag-and-drop reorder** — Cours and Eligibility currently use
  ↑/↓ buttons rather than `@dnd-kit/sortable`. The dependency is
  installed; swap in DnDContext when polishing.
- **Auto-save brouillon** — implemented in the Fiches drawer
  (`oc-admin-draft-fiche-<id>` every 10s). Other drawers persist via
  the store on Save instead of on edit.
- **NPS / Heatmap / Cohorts** are deterministic synthetic data —
  hook to a real analytics source when available.
- **PDF export** uses `window.print()` with the built-in stylesheet
  rather than `react-pdf`. The trigger and the print-friendly view
  exist; swap to `react-pdf` if a richer PDF is needed.
- **Dark mode** — the toggle persists the preference in
  `useBranding.darkMode` but the dark stylesheet itself is V2.1.
- **Role-based UI gating** — `canDo(role, action)` is exported
  but not yet plumbed through every destructive button. The
  super-admin role is the default in dev.

## Brand identity preserved

- French-Republic palette: `#0055A4` primary, `#EF4135` secondary,
  `#0A0F1E` tertiary
- Tricolor strip below the topbar and on the logo monogram
- Inter (next/font) + Satoshi (Fontshare) typography
- All UI strings in French
