# PropReno — Property Renovation Operations Platform

A production-style full-stack web application for tracking renovation progress across multifamily apartment buildings. Built like a monday.com-style workflow tool, specifically designed for multifamily renovation teams.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v4 |
| Forms | React Hook Form + Zod |
| File Uploads | UploadThing (placeholder) |
| Charts | Recharts |

---

## Folder Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated app shell
│   │   ├── layout.tsx            # Sidebar + topbar layout
│   │   ├── dashboard/page.tsx
│   │   ├── buildings/
│   │   │   ├── page.tsx          # Building list
│   │   │   └── [buildingId]/
│   │   │       └── page.tsx      # Building detail + unit table
│   │   ├── units/
│   │   │   └── [unitId]/
│   │   │       └── page.tsx      # Unit detail + stages + updates
│   │   ├── work-queue/page.tsx   # Grouped open work by trade/sub
│   │   ├── updates/page.tsx      # Activity feed
│   │   ├── subcontractors/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── (auth)/                   # Auth pages (login, error)
│   ├── globals.css
│   ├── layout.tsx                # Root HTML shell
│   └── page.tsx                  # Redirects to /dashboard
│
├── actions/                      # Next.js Server Actions
│   ├── daily-updates.ts
│   └── stages.ts
│
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx       # Navigation sidebar
│   │   └── top-bar.tsx
│   ├── ui/                       # Primitive components (shadcn-style)
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── progress.tsx
│   │   ├── status-badge.tsx      # Stage/unit status with dot
│   │   ├── empty-state.tsx
│   │   └── filter-bar.tsx
│   ├── dashboard/
│   │   ├── stat-card.tsx
│   │   ├── trade-work-summary-card.tsx
│   │   └── dashboard-chart.tsx
│   ├── buildings/
│   │   ├── building-card.tsx
│   │   └── building-progress-bar.tsx
│   ├── units/
│   │   ├── unit-table.tsx        # Unit list inside building
│   │   ├── stage-table.tsx       # Stage list inside unit
│   │   ├── unit-progress-bar.tsx
│   │   └── photo-upload-placeholder.tsx
│   ├── updates/
│   │   ├── daily-update-feed.tsx
│   │   └── recent-updates.tsx
│   ├── work-queue/
│   │   ├── work-queue-by-trade.tsx
│   │   └── work-queue-by-sub.tsx
│   └── subcontractors/
│       └── subcontractor-table.tsx
│
├── data/
│   └── mock.ts                   # Static mock data for skeleton pages
│
├── lib/
│   ├── prisma.ts                 # PrismaClient singleton
│   ├── auth.ts                   # NextAuth config + RBAC helpers
│   ├── utils.ts                  # cn(), formatDate(), etc.
│   └── renovation-utils.ts       # Business logic (stage completion, work queue grouping)
│
└── types/
    └── index.ts                  # All TypeScript types (re-exports Prisma + extensions)

prisma/
├── schema.prisma                 # Full data model
└── seed.ts                       # Demo data seed script
```

---

## Database Schema Overview

```
Workspace
  └── User (roles: ADMIN, PROJECT_MANAGER, SUBCONTRACTOR, VIEWER)
  └── Building
        └── Unit (status: NOT_STARTED → IN_PROGRESS → COMPLETED)
              └── UnitStage (one per StageTemplate)
                    └── DailyUpdate
                          └── Attachment (photos/docs)
  └── StageTemplate (master list: Demolition → Final Inspection)
  └── Subcontractor (per trade)
```

**Key design decisions:**
- `StageTemplate` defines the master sequence; `UnitStage` is the per-unit instance
- `UnitStage.status` drives the Work Queue page
- `DailyUpdate` can attach to a unit OR a specific stage (optional)
- `Subcontractor` links to stages for work queue grouping

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <repo-url>
cd property-renovation-platform
npm install
```

### 2. Environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and NextAuth credentials
```

### 3. Database

```bash
# Push schema to your DB (dev)
npm run db:push

# Or run migrations (production)
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

### 5. View data in Prisma Studio

```bash
npm run db:studio
```

---

## Key Pages

| Route | Purpose |
|---|---|
| `/dashboard` | KPI stats + charts + recent activity |
| `/buildings` | Grid of all buildings with progress |
| `/buildings/[id]` | Unit table, filters, progress bar |
| `/units/[id]` | Stage table, daily updates, photos |
| `/work-queue` | Open work grouped by trade or subcontractor |
| `/updates` | Global activity feed |
| `/subcontractors` | Sub directory with trade/contact info |
| `/reports` | Report templates + AI summary placeholder |
| `/settings` | Workspace config, team, stages |

---

## Business Logic Utilities

Located in `src/lib/renovation-utils.ts`:

```typescript
// Compute % complete for a unit
computeUnitCompletionPercent(stages)

// Get the current active stage for a unit
getCurrentStage(stages)

// Group open work items by trade → WorkQueueByTrade[]
groupWorkQueueByTrade(items)

// Group open work items by subcontractor → WorkQueueBySubcontractor[]
groupWorkQueueBySubcontractor(items)

// Display helpers
formatTradeName(trade)       // "ROUGH_ELECTRICAL" → "Rough Electrical"
getTradeColor(trade)         // Returns Tailwind class for color badge
getStageStatusConfig(status) // Returns { label, color, dotColor }
getUnitStatusConfig(status)
```

---

## Role-Based Access Design

Roles: `ADMIN`, `PROJECT_MANAGER`, `SUBCONTRACTOR`, `VIEWER`

Auth helpers in `src/lib/auth.ts`:
```typescript
canManageBuildings(role)  // ADMIN, PROJECT_MANAGER
canCreateUpdates(role)    // All except VIEWER
canManageUsers(role)      // ADMIN only
canViewWorkQueue(role)    // All (subs see filtered view)
```

**To enforce:** Uncomment session checks in server actions and page components.

---

## Extension Roadmap

| Feature | Where to add |
|---|---|
| Real auth | Uncomment session checks in `/actions/*` and layouts |
| File uploads | Replace `PhotoUploadPlaceholder` with UploadThing `<UploadButton>` |
| Notifications | Add `Notification` model + webhook/email trigger in stage action |
| Audit log | Add `AuditEvent` model, write to it in every server action |
| Calendar view | Add `/calendar` route, query `UnitStage.dueDate` by date range |
| Export to PDF | Add `/api/reports/[type]/route.ts` using `@react-pdf/renderer` |
| AI summaries | POST recent `DailyUpdate` text to Claude API in `/reports` |
| Mobile | All components use Tailwind responsive classes — extend as needed |
| Search | Implement cmdk in `TopBar` against buildings/units/subs |
| Filters | Wire `FilterBar` selects to URL search params + server queries |

---

## Demo Credentials

After seeding:
- Email: `jordan@acmereno.com` (Project Manager)
- Email: `admin@acmereno.com` (Admin)
- Password: *(credentials provider placeholder — implement bcrypt for production)*
