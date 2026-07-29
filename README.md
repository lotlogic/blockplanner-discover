# BlockPlanner Discover

BlockPlanner Discover is the free ACT property assessment frontend. Users can
search for a property, review planning information, submit enquiries and access
paid BlockPlanner services.

## Public URL and Origin

The canonical public URL is:

```text
https://www.blockplanner.com.au/tools/discover/
```

The application is deployed as an Azure Storage static website behind this
Azure Front Door origin:

```text
https://discover-blockplanner-ftc9agh2a6addagk.z03.azurefd.net/
```

The `blockplanner-router` Cloudflare Worker proxies the canonical
`/tools/discover/` path to the Azure origin. The former
`discover.blockplanner.com.au` domain permanently redirects with HTTP `301` to
the equivalent canonical URL while preserving the path and query string.

Public links, analytics and checkout return URLs should use the canonical
`www.blockplanner.com.au/tools/discover/...` paths. The Azure endpoint is an
origin, not a public entry point.

## Technology

- React 19
- TypeScript
- Vite
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

Vite serves the application under the canonical subpath:

```text
http://localhost:5173/tools/discover/
```

Available commands are:

```bash
npm run dev
npm run build
npm run preview
```

`npm run build` type-checks the application and creates the production output
in `dist/`. The repository does not currently define an automated test script,
so a successful production build is the minimum validation before pushing.

## Environment Variables

Create `.env` from `.env.example` for local development:

```env
VITE_API_URL="https://your-api.example.com"
VITE_GOOGLE_MAPS_API_KEY="your_browser_restricted_google_maps_key"
VITE_MIXPANEL_TOKEN=""
VITE_STRIPE_CHECKOUT_MODE="live"
VITE_COMMENCEMENT_DATE=""
```

- `VITE_API_URL` is the shared BlockPlanner backend URL without a trailing
  slash.
- `VITE_GOOGLE_MAPS_API_KEY` enables Places autocomplete and report maps. It
  must be restricted to the approved browser origins and Google APIs.
- `VITE_MIXPANEL_TOKEN` enables explicit Mixpanel events. Analytics remain
  disabled when it is blank.
- `VITE_STRIPE_CHECKOUT_MODE` selects `sandbox` or `live` checkout. A missing
  value defaults to `live`.
- `VITE_COMMENCEMENT_DATE` remains in build configuration but is not currently
  read by the application.

All `VITE_*` values are embedded in the browser bundle and must be treated as
public configuration. Never place Stripe secrets, webhook secrets, Monday API
tokens or backend credentials in this repository's frontend environment.

## Application Routing

The application routes are relative to its deployment base:

- `/` for address search
- `/assessment?address=...&lat=...&lng=...` for the assessment
- `/checkout?success=...` and `/checkout?cancel=...` for Stripe returns
- `/privacy`
- `/disclaimer`

During development, `vite.config.ts` uses `/tools/discover/` as the base. A
production build uses relative asset paths so the same build can be served
through Azure Front Door and the canonical Worker route.

`src/utils/publicPath.ts` selects `/tools/discover` as the React Router basename
on the canonical path. It also supplies the trusted public site URL used by
Stripe checkout requests, keeping success and cancellation returns under the
same canonical path.

## Shared Backend

Discover uses the shared LotLogic and BlockPlanner backend configured by
`VITE_API_URL`. The frontend calls:

- `GET /api/geo/act-zone` for ACT zoning and assessment data
- `POST /api/monday/free-assessment-leads` for free assessment submissions
- `POST /api/monday/product-leads` for subscriptions and product leads
- `POST /api/enquiry/get-in-touch` for contact and request-a-call submissions
- `POST /api/stripe/create-checkout-session` for paid checkout

The backend is responsible for:

- trusted frontend and return URL validation
- live and sandbox Stripe price selection
- Stripe secret keys and webhook verification
- paid fulfilment after confirmed payment
- Monday board selection, field mapping and item creation
- contact and product lead routing
- idempotency for webhook-driven fulfilment

The frontend sends structured property and contact data with a `sourceApp` and,
for paid checkout, a `productCode`. Discover uses these paid product codes:

- `site_report`
- `crown_lease`

Stripe price IDs and Monday board mappings belong in the backend. They must not
be duplicated in frontend code or environment variables.

## Analytics

Mixpanel uses the EU project host. Autocapture and session replay are disabled.
Only explicit product events are sent, and no events are sent when
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

The GitHub Actions workflow
`.github/workflows/deploy-azure-storage.yml` deploys the application on every
push to `main`. It can also be run manually with `workflow_dispatch`.

The workflow:

1. checks out the repository;
2. installs dependencies with Node.js 20 and `npm ci`;
3. creates the build-time `.env` from GitHub secrets;
4. runs `npm run build`;
5. authenticates to Azure;
6. clears the `bpassessmentprod` storage account's `$web` container; and
7. uploads the contents of `dist/`.

The Azure static website must use `index.html` as both its index document and
error document so direct client-side routes resolve to the React application.
Azure Front Door serves that static website as the router's Discover origin.

Required GitHub Actions secrets are:

- `VITE_API_URL`
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_MIXPANEL_TOKEN` when analytics are enabled
- `AZURE_CREDENTIALS` containing service principal JSON for `azure/login`

The workflow sets `VITE_COMMENCEMENT_DATE` to `2026-01-01` and does not set
`VITE_STRIPE_CHECKOUT_MODE`, so production defaults to live Stripe checkout.
The Azure service principal requires Storage Blob Data Contributor access to
the `bpassessmentprod` account.

## Release Checks

Before pushing to `main`:

1. Run `npm run build`.
2. Test address autocomplete and a direct assessment route locally.
3. Confirm the checkout mode is appropriate for the target environment.
4. For checkout changes, confirm the backend accepts the canonical site and
   return URLs.
5. After deployment, check the canonical home, assessment and checkout return
   routes.
6. Confirm the legacy domain redirects to the matching canonical path with
   HTTP `301`.

## License

Proprietary software. All rights reserved.
