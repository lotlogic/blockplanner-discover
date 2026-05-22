# Blockplanner Free Assessment (React + Vite)

This repo is the **Blockplanner “free block assessment”** frontend. The user flow is:

1. Search/select an ACT address (Google Places Autocomplete)
2. View a free summary assessment (fetched from the LotLogic API)
3. Optionally purchase the full PDF report via Stripe Checkout

Production URL: `https://discover.blockplanner.com.au/`

Shared backend: `https://lotcheck-be.wittysky-d6d60dbd.australiasoutheast.azurecontainerapps.io`

## Tech stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- React Router
- Google Maps JavaScript API (Places) via `@vis.gl/react-google-maps`
- React Hook Form + Zod

## Local development

Prereqs: Node.js 20+.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` (or create a `.env` file) in the repo root:

```env
VITE_API_URL="https://your-api.example.com"
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

Then open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

The production build output is written to `dist/`.

## Routes

- `/` – address search
- `/assessment?address=...` – free block assessment (gated by email)
- `/checkout?success=1` or `/checkout?cancel=1` – return page after Stripe Checkout
- `/privacy` – privacy policy

## Backend/API contract

The frontend expects a backend at `VITE_API_URL` that exposes:

- `GET /api/geo/act-zone?address=<urlencoded>`
  - Returns JSON compatible with `src/@types/api.ts` (zone + `lotCheckRules`)
- `POST /api/stripe/create-checkout-session`
  - Request body includes (where available): `site`, `intention`, `email` (alias), `clientEmail`, `address`, `suburb`, `blockSizeM2`, `zone`
  - Response body: `{ "url": string }` where `url` is the Stripe-hosted Checkout URL

Paid-report operations after a successful Stripe webhook are handled by the shared backend through monday.com.

## Analytics (Mixpanel)

The app uses Mixpanel (EU project host) with autocapture enabled. Add the project token to `VITE_MIXPANEL_TOKEN` (optional: a default token is embedded for convenience).

Tracked events (key ones):

- `lookup_performed` — fields: `address`, `parcel_id`, `block_size`, `zone`, `rule_outputs`, `timestamp`
- `lookup_started`, `cta_click`, `gated_email_submit`, `checkout_form_submit`, `checkout_redirect`, `checkout_error`, `checkout_status_view`

Analytics review path:

- Mixpanel → Dashboards → create/view **“LotLogic Free Assessment”** (use `lookup_performed` and `cta_click` as primary cards)
- For exports: Mixpanel → Events → select `lookup_performed` → Export → CSV

## Deployment (Azure Storage Static Website)

This repo deploys as a static site (upload `dist/` to the storage account `$web` container).

GitHub Actions workflow: `.github/workflows/deploy-azure-storage.yml`

Required GitHub secrets:

- `VITE_API_URL`
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_COMMENCEMENT_DATE` (optional)
- `AZURE_CREDENTIALS` (service principal JSON for `azure/login`)
- `AZURE_STORAGE_ACCOUNT`

Notes:

- The service principal should have **Storage Blob Data Contributor** access to the storage account.
- Enable **Static website** on the storage account and set:
  - Index document: `index.html`
  - Error document: `index.html` (recommended for SPA routing)

## License

Proprietary software. All rights reserved.
