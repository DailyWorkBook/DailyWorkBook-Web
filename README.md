# DailyWorkBook — Web

React + TypeScript + Vite admin console for the WatchTower workforce platform.

## Setup

```bash
npm install
npm run dev            # http://localhost:5173
```

The API base URL defaults to `http://localhost:4000/api`. Override it with
`VITE_API_URL` in a `.env` file when the server runs elsewhere.

Start the server first (see `../DailyWorkBook-Server/README.md`) and create a
platform operator with the bootstrap command — there are no default credentials
to sign in with.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |

## Two consoles, one app

Which console you see is decided by the account you sign in with:

- **Platform operator** → `/platform`: clients, module assignment, billing and
  the platform activity log.
- **Client user** → their workspace: dashboard, attendance, employees, sites,
  roster, leave, payroll, reports, roles and audit.

Neither can reach the other. The router redirects, and the API refuses.

## How the navigation is built

`src/core/navigation` declares, for every destination, the module it belongs to
and the permission it needs. The sidebar renders only what the signed-in account
can actually reach, and typing a URL directly lands on an explanation rather
than a broken screen.

None of that is security. The API enforces the same two gates independently, so
a hidden link and a blocked request are separate mechanisms that happen to
agree — see the server README.

## Data fetching

Every network call goes through `src/services`. `apiClient.ts` attaches the
access token, refreshes it once on a 401 and retries the original request, and
turns every failure into a typed `ApiError` that screens branch on. TanStack
Query handles caching, and `src/core/query` holds the query-key factory so an
invalidation cannot miss a screen.

## The four states

`src/components/feedback/States.tsx` provides loading, empty, error, and the two
access-denied states. Screens render one of these rather than an empty div — the
difference between a workspace that is genuinely empty and one that is broken
should always be visible.

Nothing in this app invents a number to fill a gap. A new workspace shows zeroes
and empty states, and the attendance chart leaves a gap for days with no data
rather than drawing through them.

## Performance

Routes are code-split with `React.lazy`. Recharts is heavy, so the dashboard
chart is lazily loaded into its own chunk and stays out of the initial bundle:

```
initial JS   ~385 KB raw / ~120 KB gzipped
chart chunk  ~385 KB raw / ~106 KB gzipped   (loaded only on the dashboard)
```

`npm run build` prints the current figures.
