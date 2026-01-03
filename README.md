## MIXO Ads Dashboard

MIXO Ads is a lightweight analytics dashboard built with the Next.js App Router. It fetches campaign metadata plus aggregated and per-campaign insight metrics from an external MIXO Ads API and renders them with live updates via SSE. The UI is intentionally minimal so teams can drop the dashboard into any internal tooling stack without pulling in a full design system.

## Features

- Campaign directory with searching, platform/status filtering, and multiple sort modes.
- System-wide insight tiles showing totals, CTR/CPC averages, and conversion performance.
- Campaign detail pages with live metrics streamed from `/campaigns/:id/insights/stream`.
- Loading, error, and reconnection states tuned for dashboards that are left open for hours.
- Platform-aware tags with custom colors so meta/google/etc. are instantly recognizable.

## Tech Stack

- [Next.js 16 App Router](https://nextjs.org/docs) with React 19.
- TypeScript for type-safety on campaign/insight models.
- Tailwind CSS v4 (via the `@tailwindcss/postcss` preset) for utility-first styling.
- Axios for API bindings and the native `EventSource` API for SSE streaming.
- Lucide icons for search/refresh affordances.

## Project Structure

```
app/
 ├─ api.js                 # Axios-based REST helper functions
 ├─ campaigns/page.tsx     # Campaign catalogue with filters + insight tiles
 ├─ campaigns/[id]/page.tsx# Detailed view with live insight streaming
 ├─ layout.tsx             # Root layout
 └─ globals.css            # Tailwind base styles
public/
 └─ ...                    # Static assets
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` (or `.env`) file in the project root:

```
NEXT_PUBLIC_SITE_NAME=https://your-mixo-api-host
```

This host must expose the REST endpoints used in `app/api.js`:

- `GET /campaigns`
- `GET /campaigns/:id`
- `GET /campaigns/insights`
- `GET /campaigns/:id/insights`
- `GET /campaigns/:id/insights/stream` (Server-Sent Events)

### 3. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000/campaigns` for the catalogue and click any card for the live-insight view.

## Scripts

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `npm run dev`  | Start the Next.js dev server             |
| `npm run build`| Build the production bundle              |
| `npm start`    | Run the production server (after build)  |
| `npm run lint` | Lint the project via `next lint` (ESLint)|

## Development Notes

- Both campaign pages are client components (`"use client"`) because they depend on browser APIs (search input state, EventSource streaming).
- Live insight updates append onto the last known snapshot, so partial SSE payloads are safe.
- UI copy references INR currency (₹); update `platformConfig` or formatting helpers if you need localization.

## Deployment

Any platform that supports Node.js 18+ can host this project (Vercel, Netlify, Render, etc.). Be sure to supply `NEXT_PUBLIC_SITE_NAME` in the hosting provider's environment variable settings and allow outbound traffic from the Next.js server to the MIXO Ads API.
