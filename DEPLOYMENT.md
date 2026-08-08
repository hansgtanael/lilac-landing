# Lilac Landing — deployment & handoff

How to run, host, and hand over this site. Every command and claim here was
verified on 2026-08-07 against the real project.

---

## 1. What this is

A Next.js 16 (App Router) site whose content is edited in **Sanity**, a hosted
CMS. Three moving parts:

| Part | Where it lives | Who owns it |
| --- | --- | --- |
| The site (Next.js app) | any Node host — Netlify today | see §7 |
| Content + photos | Sanity cloud, project `4tusk94y`, dataset `production` | see §7 |
| Source code | `github.com/hansgtanael/lilac-landing`, branch `main` | see §7 |

**This is NOT a static site.** It has API routes, React Server Components, and
ISR, so it needs a running Node process. `next export` is not an option.

**Content edits never require a deploy.** The server reads Sanity at render
time. Publishing in the Studio makes changes public within ~60s on its own
(~2s with the webhook in §6). Deploys are only for *code* changes.

---

## 2. Requirements

- **Node.js 20+** (developed on v24)
- Outbound HTTPS to `*.sanity.io` and `cdn.sanity.io`
- Inbound HTTP for visitors
- Optional: inbound from the public internet for the revalidation webhook (§6)

---

## 3. Environment variables

| Variable | Required | Secret | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | no | `4tusk94y` |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | no | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | yes | no | `2024-10-01` |
| `NEXT_PUBLIC_SITE_URL` | self-host | no | Canonical origin for canonical/OG tags |
| `SANITY_REVALIDATE_SECRET` | optional | **yes** | Enables instant publishing (§6) |
| `SANITY_API_READ_TOKEN` | no | **yes** | Only if the dataset is made private |
| `SANITY_API_WRITE_TOKEN` | no | **yes** | Only to run `npm run migrate:site` |

With the three `NEXT_PUBLIC_SANITY_*` values missing, the site still builds and
runs — it silently falls back to `content/content.json` and `/studio` shows a
setup notice. Nothing crashes, but no CMS content appears. If the site is
showing stale content, check these first.

### About `NEXT_PUBLIC_SITE_URL`

`app/layout.tsx` resolves the canonical origin as:

```
NEXT_PUBLIC_SITE_URL  ||  URL  ||  http://localhost:3020
```

`URL` is injected by Netlify automatically, so on Netlify this needs no setting
and self-corrects when a custom domain is attached. **When self-hosting, set
`NEXT_PUBLIC_SITE_URL` explicitly** — otherwise every canonical and `og:image`
falls back to `localhost` and link previews break.

---

## 4. Local development

```bash
npm ci
npm run dev:preview        # port 3020
```

**Use `dev:preview`, not `dev`.** `npm run dev` and `npm start` are pinned to
port **3017**, which is *not* in Sanity's CORS allowlist — `/studio` will fail
to authenticate there. Only allowlisted origins work. Check any origin with:

```bash
curl -H "Origin: http://localhost:3020" \
  https://4tusk94y.api.sanity.io/v2026-05-04/check/cors
```

`{"allowed":true}` means the Studio will work from that origin.

---

## 5. Hosting

### Option A — Netlify (current)

Site `lilaclandingkeukalake`, Git-linked to `main`. Every push auto-builds via
`@netlify/plugin-nextjs` (declared in `netlify.toml`), which supplies the Node
server runtime. Set the §3 variables under *Site configuration → Environment
variables*, scoped to **Builds, Functions, and Runtime**.

Nothing else to configure. `public/_headers` exists only for legacy static
drops and is ignored here — the real security headers come from
`next.config.ts` `headers()`.

### Option B — self-hosting

The app is portable; it was verified running with **zero Netlify environment**,
serving Sanity content, `/studio`, the API routes, and all security headers.

`next.config.ts` emits a **standalone bundle** when `NETLIFY` is unset — a
self-contained server needing no `node_modules` on the target machine. (It is
deliberately disabled on Netlify, whose plugin does its own packaging.)

```bash
npm ci
npm run build                      # produces .next/standalone
```

**Critical:** the standalone bundle does not include static assets. Copy them
or the site serves unstyled with broken images:

```bash
cp -r .next/static  .next/standalone/.next/static
cp -r public        .next/standalone/public
```

Then run it:

```bash
cd .next/standalone
NEXT_PUBLIC_SITE_URL="https://your-domain.com" \
NEXT_PUBLIC_SANITY_PROJECT_ID=4tusk94y \
NEXT_PUBLIC_SANITY_DATASET=production \
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01 \
PORT=3000 node server.js
```

Ship `.next/standalone` (with the two copied directories) to the server — that
directory is the whole deployable.

#### systemd unit

```ini
[Unit]
Description=Lilac Landing
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/lilac-landing/.next/standalone
ExecStart=/usr/bin/node server.js
Restart=always
Environment=PORT=3000
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_SITE_URL=https://your-domain.com
Environment=NEXT_PUBLIC_SANITY_PROJECT_ID=4tusk94y
Environment=NEXT_PUBLIC_SANITY_DATASET=production
Environment=NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
# Secrets belong in an EnvironmentFile with 0600 perms, not here:
EnvironmentFile=-/etc/lilac-landing.env

[Install]
WantedBy=multi-user.target
```

#### nginx reverse proxy

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # ssl_certificate / ssl_certificate_key here (certbot or similar)

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
```

Do **not** add security headers in nginx — the app already sets CSP,
`X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`, and
`/studio` needs a *different*, Sanity-aware CSP. Duplicating them at the proxy
breaks the Studio.

#### Self-hosting checklist

1. Set `NEXT_PUBLIC_SITE_URL` (see §3) — easy to forget, breaks link previews.
2. Add the new domain to Sanity CORS (§6) or `/studio` will not authenticate.
3. Persist `.next/cache` across restarts. In Docker, mount it as a volume, or
   ISR regenerates from cold on every boot.
4. If the server is behind NAT and unreachable from the internet, the webhook
   in §6 cannot fire. Edits still publish via ISR within ~60s.

---

## 6. Sanity configuration

### CORS (required)

manage.sanity.io → project `4tusk94y` → **API → CORS Origins**. Add every
origin the Studio is served from, **with credentials**:

- `http://localhost:3020` (local dev)
- the production origin (e.g. `https://lilaclandingkeukalake.netlify.app`)
- both apex and `www` for any custom domain

An origin that is missing here fails with Sanity's "Connect this Studio to your
project" screen — in every browser, identically.

### Instant publishing (optional)

Without this, published edits appear within ~60s (ISR). With it, ~2s.

1. Generate a secret: `openssl rand -hex 32`
2. Set it as `SANITY_REVALIDATE_SECRET` on the host
3. manage.sanity.io → **API → Webhooks → Create**:
   - URL: `https://<your-domain>/api/revalidate`
   - Dataset `production`, trigger on create/update/delete
   - Filter: `_id == "siteContent"`
   - Method `POST`, Secret: the same value
   - Leave the projection empty — the route only HMACs the raw body

**Verify** with an unsigned request:

```bash
curl -s -X POST https://<your-domain>/api/revalidate -d '{}' -w '\n%{http_code}\n'
```

- `401 Invalid signature` → configured correctly (an unsigned request *should* be rejected)
- `500 Revalidation is not configured` → the secret is missing

Silent failure mode: if the secret does not byte-match on both sides, edits
still publish via ISR, just slowly. Check the delivery log in the Sanity
webhook UI for non-200 responses.

---

## 7. Handoff checklist

Everything below currently sits on the original developer's personal accounts.
The site *code* is clean — it contains no personal identifiers, analytics, or
credentials — but the infrastructure is not yet transferred.

- [ ] **Sanity project `4tusk94y`** — transfer ownership. All content **and
      every uploaded photo** live here. Until this moves, the client does not
      own their own content.
- [ ] **Netlify site `lilaclandingkeukalake`** — transfer, or rebuild on the
      client's own hosting per §5B. Builds currently bill the original account.
- [ ] **GitHub repo `hansgtanael/lilac-landing`** — transfer or fork.
- [ ] **`lilaclanding.com`** — no DNS as of 2026-08-07. Register/point it,
      attach it in the host, and add apex + `www` to Sanity CORS (§6).
      `metadataBase` picks up the new domain automatically on Netlify.
- [ ] **Invite the client to Sanity** with the **Editor** role
      (manage.sanity.io → Members), or they cannot log in to `/studio`.
- [ ] **Rotate `SANITY_REVALIDATE_SECRET`** and revoke any Netlify CLI tokens.

---

## 8. Known gaps

**The booking form does not deliver anywhere.** `lib/inquiry.ts`
`deliverInquiry()` only writes a `console.info` line. The route is live and
fully validated in production, so a guest submits, sees a success message, and
**the lead is lost** — it exists only in the server log. Wire a real transport
(Resend/Postmark/SendGrid) or disable the form before launch. This is the most
urgent item in this document.

**`content/content.json` drifts from Sanity.** It is only a fallback now, but
it is also the source `npm run migrate:site` seeds *from* — and that command
does a `createOrReplace` on the whole document. Running it would silently
revert any Studio edit not mirrored back into the JSON. As of 2026-08-07,
`booking.rating` is `4.98` in the JSON and `5` in Sanity. Reconcile before ever
running that script.

**Videos are not CMS-managed.** `videoSrc`, `poster`, and `srcCompact` are path
strings pointing at files in `public/`. Changing a video requires a code change
and deploy; the client cannot do it from the Studio.

---

## 9. Troubleshooting

| Symptom | Cause |
| --- | --- |
| Site shows old content, ignores the CMS | `NEXT_PUBLIC_SANITY_PROJECT_ID` unset → silent fallback to `content.json` |
| `/studio` shows "Connect this Studio to your project" | Origin not in Sanity CORS (§6) |
| `/studio` shows "isn't configured yet" | `NEXT_PUBLIC_SANITY_PROJECT_ID` unset |
| Edits never appear publicly | Draft was never **Published** — the site reads published docs only |
| Edits take a minute | Normal ISR. Configure the webhook (§6) for ~2s |
| Self-hosted site is unstyled / images 404 | Forgot to copy `.next/static` and `public` into `.next/standalone` (§5B) |
| Link previews point at the wrong domain | `NEXT_PUBLIC_SITE_URL` unset when self-hosting |
| `tsc` errors about a deleted page | Stale `.next/types` — `rm -rf .next/dev .next/types`, restart |
