# BlockPlanner Discover

BlockPlanner Discover is the free ACT property assessment frontend. It lets a
user select an address, retrieves planning information from the shared
BlockPlanner backend, captures relevant enquiries and leads, and offers paid
Stripe checkout flows for the full site report and Crown lease service.

## Public URLs

- Current live origin: `https://discover.blockplanner.com.au/`
- Direct Azure Front Door origin:
  `https://discover-blockplanner-ftc9agh2a6addagk.z03.azurefd.net/`
- Staged canonical URL:
  `https://www.blockplanner.com.au/tools/discover/`
- Shared backend:
  `https://lotcheck-be.wittysky-d6d60dbd.australiasoutheast.azurecontainerapps.io`

The canonical `/tools/discover` URL is prepared in the app, backend and
BlockPlanner router, but the Cloudflare Worker custom routes are intentionally
detached pending client approval. Until those routes are enabled, the Discover
application remains available from `discover.blockplanner.com.au`; the
canonical path on `www.blockplanner.com.au` is not the active application
entry point.

When the Worker routes are enabled:

- `www.blockplanner.com.au/tools/discover/...` is proxied to the Azure origin.
- `discover.blockplanner.com.au/...` returns a temporary redirect to the
  equivalent canonical path, preserving the path and query string.
- The frontend continues to work directly from the origin because its
  production assets use relative URLs and its router detects the public path at
  runtime.

The Worker and legacy redirects are maintained in the separate
`blockplanner-router` repository.

## Technology

- React 19, TypeScript and Vite
- React Router
- Tailwind CSS
- Google Maps JavaScript API and Places
- React Hook Form and Zod
- Mixpanel

## Local Development

Node.js 20 or later is required.

```bash
npm ci
npm run dev
```

Vite serves the app under its intended canonical subpath during development:

`http://localhost:5173/tools/discover/`

Create a local `.env` from `.env.example`. All `VITE_*` values are embedded in
the browser bundle and must be treated as public configuration, not secrets.

```env
VITE_API_URL="https://your-api.example.com"
VITE_GOOGLE_MAPS_API_KEY="your_browser_restricted_google_maps_key"
VITE_MIXPANEL_TOKEN=""
VITE_STRIPE_CHECKOUT_MODE="live"
VITE_COMMENCEMENT_DATE=""
```

`VITE_API_URL` is required. It is the shared BlockPlanner backend base URL
without a trailing slash.

`VITE_GOOGLE_MAPS_API_KEY` is required for Places autocomplete and report
maps. Restrict this browser key to the expected hostnames and required Google
APIs.

`VITE_MIXPANEL_TOKEN` is optional. Analytics are disabled when it is blank.

`VITE_STRIPE_CHECKOUT_MODE` is optional. Set it to `sandbox` for test checkout
sessions. Any other or missing value uses `live`.

`VITE_COMMENCEMENT_DATE` is optional reserved build-time configuration. The
application does not currently read it.

Do not put Stripe secret keys, webhook secrets, Monday API tokens or backend
credentials in frontend environment variables.

## Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create the production build in dist/
npm run preview   # Serve the production build locally
```

There is currently no automated test script in this repository. A production
build is the minimum local validation before pushing.

## Routing and Public Path

The application routes are relative to its deployment base:

- `/` for address search
- `/assessment?address=...&lat=...&lng=...` for the assessment
- `/checkout?success=...` or `/checkout?cancel=...` for Stripe return states
- `/privacy`
- `/disclaimer`

`vite.config.ts` uses `/tools/discover/` while running the development server
and relative asset paths for production builds. `src/utils/publicPath.ts`
selects a React Router basename of `/tools/discover` when the browser is on the
canonical path and `/` when the app is opened from the origin subdomain.

The same helper supplies the checkout `site` URL to the backend. This keeps
Stripe success and cancellation returns on the entry point the user originally
visited.

## Shared Backend and Stripe

`VITE_API_URL` must point to the shared backend used by Discover, the LVC
estimator and the upgrade estimator. Discover currently calls:

- `GET /api/geo/act-zone` for ACT zoning and assessment data
- `POST /api/monday/free-assessment-leads` for free assessment lead capture
- `POST /api/monday/product-leads` for product subscriptions and related leads
- `POST /api/enquiry/get-in-touch` for contact and request-a-call submissions
- `POST /api/stripe/create-checkout-session` for paid products

Paid checkout requests identify the product with a `productCode`, use
`sourceApp: "discover"`, and include the current trusted site and cancellation
URL. The shared backend owns Stripe price selection, secret keys, trusted-site
validation, webhook processing and Monday fulfilment. The frontend must not
contain Stripe price IDs or secret configuration.

The Discover paid product codes are:

- `site_report`
- `crown_lease`

The production GitHub workflow does not set `VITE_STRIPE_CHECKOUT_MODE`, so the
deployed application defaults to live checkout. Set the variable explicitly to
`sandbox` only in a local or controlled test build. Any new public hostname or
path used for checkout must also be added to the backend trusted-site
configuration before release.

## Analytics

Mixpanel uses the EU project host. Autocapture and session replay are disabled;
only explicit product events are sent. No events are sent when
`VITE_MIXPANEL_TOKEN` is blank.

Key events include:

- `lookup_started`
- `lookup_performed`
- `cta_click`
- `gated_email_submit`
- `checkout_form_submit`
- `checkout_redirect`
- `checkout_error`
- `checkout_status_view`

## Deployment

The app is deployed as an Azure Storage static website behind Azure Front Door.
The workflow is
`.github/workflows/deploy-azure-storage.yml`.

A push to `main`, or a manual `workflow_dispatch`, performs the following:

1. Installs dependencies with Node.js 20 and `npm ci`.
2. creates a build-time `.env` from GitHub secrets;
3. runs `npm run build`;
4. authenticates to Azure;
5. deletes the existing files in the `bpassessmentprod` storage account's
   `$web` container; and
6. uploads the new `dist/` contents.

The Azure static website must use `index.html` as both the index and error
document so client-side routes resolve to the React application.

Required GitHub Actions secrets:

- `VITE_API_URL`
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_MIXPANEL_TOKEN` if analytics are enabled
- `AZURE_CREDENTIALS`, containing service principal JSON for `azure/login`

The workflow currently sets `VITE_COMMENCEMENT_DATE` to `2026-01-01` and does
not set `VITE_STRIPE_CHECKOUT_MODE`. The Azure service principal needs Storage
Blob Data Contributor access to `bpassessmentprod`.

The storage account name is currently hardcoded in the workflow;
`AZURE_STORAGE_ACCOUNT` is not used.

## Release Checks

Before pushing to `main`:

1. Run `npm run build`.
2. Check address autocomplete and an assessment route at
   `http://localhost:5173/tools/discover/`.
3. Confirm the intended `VITE_STRIPE_CHECKOUT_MODE`.
4. For checkout changes, confirm the backend accepts both the origin and
   canonical site URLs.
5. After deployment, check the home page, a direct assessment URL, static
   assets and the Stripe cancellation return.

## License

Proprietary software. All rights reserved.
