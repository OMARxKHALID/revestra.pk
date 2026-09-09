# general-store

A working storefront for the Pakistani market, built with Next.js 16 (App
Router) and Tailwind CSS 4 — catalogue, cart, stock, accounts, reviews,
wishlist, discount codes, order tracking, and JazzCash / Easypaisa / cash on
delivery checkout.

> **Not an original design.** This is a local rebuild of the storefront at
> `companypolicy.studio`. Layout, copy, brand name, wordmark and every file
> under `public/assets/` come from that site — see `ASSETS.txt` for the
> download record and copyright notice. Nothing here is licensed for reuse.
> Keep this private, or replace the branding and imagery before publishing.

## Stack

- Next.js 16 (App Router, Turbopack, JavaScript)
- MongoDB (optional) behind a data layer that falls back to a bundled catalogue
- Auth.js v5 (`next-auth@5` beta) — Credentials provider, bcryptjs, JWT session
- JazzCash and Easypaisa hosted-redirect payments, plus cash on delivery
- Resend for order confirmations, with a console fallback
- Zod for every schema, React Hook Form for every form
- Zustand for the cart and wishlist, TanStack Query for catalogue, stock,
  reviews and payment methods
- Tailwind CSS 4 — CSS-first config, no `tailwind.config.js`
- Lenis smooth scroll
- lucide-react (theme-switcher icons)
- Self-hosted fonts via `next/font/local` — Inter (400/500/600) and PT Serif
  (400), latin subsets only

## Run

```bash
bun install
```

```bash
bun dev
```

Open http://localhost:3000.

```bash
bun run build
```

```bash
bun run start
```

```bash
bun run lint
```

```bash
bun test
```

```bash
bun run seed
```

```bash
bun run order-status CP-XXXXXX-XXXX shipped
```

```bash
bun run release-stale 60
```

## Environment

Copy `.env.example` to `.env.local`. Everything is optional, but each unset
variable removes a capability rather than breaking the app:

| Variable | Unset means |
|---|---|
| `MONGODB_URI` | bundled catalogue, no accounts, cash on delivery only |
| `AUTH_SECRET` | a development-only fallback, with a warning; required in production |
| `RESEND_API_KEY` | confirmation emails are logged to the console |
| `JAZZCASH_MERCHANT_ID` / `_PASSWORD` / `_INTEGRITY_SALT` | the JazzCash tile is disabled |
| `EASYPAISA_STORE_ID` / `_HASH_KEY` | the Easypaisa tile is disabled |
| `PAYMENT_ENV` | sandbox endpoints; `live` switches both gateways to production |
| `PAYMENT_CARD_PROVIDER` | `jazzcash` backs the card tile |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for metadata and return URLs |

No secret may ever carry a `NEXT_PUBLIC_` prefix — CI fails the build if one
does. The JazzCash integrity salt in a client bundle is a total compromise of
the payment integration.

### A local database

There is no MongoDB service on this machine, so development uses a user-local
`mongod` — no `sudo`, no system service, data under `.mongo-data/` (gitignored):

```bash
~/.local/mongodb/mongod --dbpath .mongo-data --port 27017 --bind_ip 127.0.0.1 --logpath .mongo-data/mongod.log --fork
```

Then `MONGODB_URI=mongodb://127.0.0.1:27017` in `.env.local`. Stop it with
`pkill -f "mongod --dbpath"`.

`bun run seed` validates the bundled catalogue, promo codes and sample reviews
against their Zod schemas, creates every index, and upserts all three into
Mongo. It is the only writer; the app only reads.

Run `bun run seed` to validate the bundled catalogue against the Zod schema,
create every index, and upsert the catalogue into Mongo.

## Structure

Application code lives under `src/`. Config files, `public/` and `assets/`
stay at the project root, per the Next.js `src` folder convention.

```
src/
  auth.js                       Auth.js v5 — Credentials, bcryptjs, JWT (Node runtime)
  auth.config.js                Edge-safe half: pages + callbacks, no providers
  middleware.js                 Redirects /account/* when signed out (UX, not a boundary)
  app/
    layout.js                   Root layout, fonts, Session + Query + Lenis providers
    page.js                     Hero + ProductGrid + Footer
    error.js / global-error.js  Error boundaries in the interior shell
    loading.js                  Skeleton, reused per segment
    not-found.js                Branded 404
    globals.css                 Tailwind import, @theme tokens, Lenis overrides
    products/
      page.js                   Catalogue — masthead + filterable grid
      [slug]/page.js            Product detail (SSG + revalidate, gallery, reviews)
    cart/page.js                Cart — quantities, removal, subtotal
    checkout/page.js            Shipping, delivery, payment method, promo, totals
    checkout/pay/[reference]/   Server-signed gateway redirect (token-gated)
    orders/[reference]/page.js  Order detail — session owner or signed ?t= token
    track/page.js               Lookup by reference + email, no email in the URL
    account/                    Layout re-checks auth(); profile + order history
    sign-in/ sign-up/           Credentials forms, degrade with a notice
    wishlist/page.js            Saved products
    api/
      products/route.js         Catalogue search and category filter
      products/[slug]/stock/    Live stock for the add-to-cart control
      orders/route.js           Re-prices, reserves stock, totals, creates the order
      orders/lookup/route.js    Guest tracking — identical 404 for both failures
      orders/claim/route.js     Attach a guest order to the signed-in account
      payments/methods/route.js Which gateways are actually configured
      payments/*/callback/      Gateway settlement, idempotent, never rate-limited
      promo/route.js            Discount code preview
      reviews/route.js          List and post reviews
      wishlist/route.js         Server-side wishlist for signed-in users
      newsletter/route.js       Signup capture
      account/register/route.js Account creation
      auth/[...nextauth]/       Auth.js handlers
  components/
    interior-page.jsx           The shared white page shell
    product-gallery.jsx         Client — hero frame + thumbnails
    product-reviews.jsx         Client — list + write form, TanStack Query
    add-to-cart.jsx             Client — size selection, live stock, sold-out states
    checkout-form.jsx           Client — RHF + Zod, delivery, payment, redirect
    order-summary.jsx           Line items + discount / shipping / tax / total
    order-status.jsx            The received → delivered progress rail
    payment-redirect-form.jsx   Auto-submitting hidden form, with a visible fallback
    promo-field.jsx             Discount code entry
    track-form.jsx              Guest order lookup
    claim-order-form.jsx        Attach a guest order to an account
    save-button.jsx             Wishlist toggle, local + server
    session-provider.jsx        Auth.js SessionProvider (keeps pages static)
    ui/                         pill-button, chip, field, nav-action, rating-stars,
                                social-icon, page-skeleton
  hooks/use-in-view.js          Reveal-state hook
  store/
    use-cart.js                 Zustand cart, persisted (v2), synced across tabs
    use-wishlist.js             Zustand wishlist, persisted, synced across tabs
  lib/
    brand.js                    Every brand string, in one place
    type.js                     EYEBROW, META and SPEC type tokens
    products.js                 Bundled catalogue — prices, stock, images, ratings
    reviews.js promos.js orders.js  Mock data for the no-database path
    shipping.js                 Rates and the free-shipping threshold
    db.js                       Cached MongoDB connection
    email.js                    Resend, or the console
    rate-limit.js               In-process LRU limiter
    secrets.js                  AUTH_SECRET with a loud dev-only fallback
    session.js                  auth() that returns null instead of throwing
    api/                        server-only doors: products, orders, users,
                                inventory, reviews, promos
    payments/                   index + config + jazzcash / easypaisa / cod,
                                and the two pure hash modules
    schemas/                    Zod: product, order, user, review, promo, newsletter
    utils/                      price, totals, discount validity, order-lines,
                                stock, order-token, request-ip, cn
scripts/
  seed.js                       Validate + upsert the catalogue
  indexes.js                    Every index, callable on its own
  order-status.js               Move an order along without an admin panel
public/assets/                  Images and woff2 subsets
ASSETS.txt                      Download record and copyright notice
```

Filenames are kebab-case; components are `const` arrow functions.

## Implementation notes

- **Tailwind v4 is configured in CSS.** `src/app/globals.css` holds the whole
  theme in an `@theme` block — fonts, the two brand colors, and the `fade-up`
  animation with its keyframes. Class detection is scoped with
  `@import "tailwindcss" source("../")` so only `src/` is scanned.
- **One asset directory.** Everything static lives under `public/assets/`.
  Images are referenced by URL as `/assets/…`. The fonts are the exception to
  how `public/` normally works: `src/lib/fonts.js` imports them by *relative
  path* so `next/font` can hash them, emit them to `.next/static/media`, and
  generate the fallback metrics. The tradeoff is that each face also ships raw
  under `public/` (128 KB total) where nothing requests it — deploy weight
  only, no runtime cost, and the price of keeping one assets tree.
- **Lenis** runs on a `requestAnimationFrame` loop in
  `smooth-scroll-provider.jsx` and is skipped entirely under
  `prefers-reduced-motion: reduce`. The provider subscribes to that media
  query, so toggling the OS setting starts or tears down Lenis without a
  reload. `anchors: true` routes in-page `#` links through Lenis — without it
  the `SHOP` link hard-jumps, because `globals.css` forces
  `scroll-behavior: auto` while Lenis is active.
- **Scroll reveal** (`hooks/use-in-view.js`) returns one of four states.
  `initial` is what the server renders, so the grid is fully visible without
  JavaScript. On mount, cards already in the viewport go straight to `shown`
  with no animation; cards below the fold go to `hidden`, then `revealed`
  when the IntersectionObserver fires. The animation itself is `motion-safe:`
  only, and the stagger uses three literal `animation-delay` classes keyed off
  the card's column so Tailwind can extract them statically.
- **The theme switcher** swaps the hero background and wordmark between three
  variants (Jitter / Serif / Transparent). Each variant carries its own
  intrinsic `width`/`height` so `next/image` gets the true aspect ratio.
- **The scrollbar is part of the design.** `html` is white to match `body`, with
  a thin blurple thumb on a light neutral track. It used to be a black track
  left over from when the whole site was dark, which ran as a black stripe down
  every white page.
- **Space Mono is gone.** Once the footer and ticker moved to the dense sans
  label, nothing rendered in mono, so the family was dropped — four faces
  preloaded per page instead of five.
- **The footer ticker** scrolls continuously via a `marquee` keyframe on a
  duplicated lane, with gradient masks fading both edges. The New York clock
  and the day counter both render only after mount, so there is no hydration
  mismatch, and the counter is computed from New York's calendar date rather
  than UTC — the whole ticker is framed in NY time, so the day should roll over
  there. `motion-safe:` keeps the marquee still under reduced motion.
- **The footer wordmark asset is broken.** `AVIF/…askey-blk@2x 1.avif` has a
  well-formed container but no decoder will read it — the browser reports
  `naturalWidth: 0` and Next's optimizer (sharp) returns 400 "not a valid
  image", while the hero AVIF decodes fine in both. The `unoptimized` flag that
  used to sit on it was a misdiagnosis of this. The footer now uses the
  monogram SVG. On the live site that wordmark is not an image at all — it is a
  looping video with a webp poster, which is where the chrome shimmer comes
  from. Restoring it means sourcing that asset, not fixing a filter.
- **Fonts are loaded by `next/font/local`** from `src/assets/fonts/`, which
  emits `<link rel="preload">` per face and generates a metric-matched
  `size-adjust` fallback so the swap causes no layout shift. Only the latin
  subsets and the weights actually used in the markup are shipped. The woff2
  files live in `public/assets/fonts/` and are pulled in by relative import,
  not by URL — `next/font` needs a module path it can hash and bundle.
- **Hero images.** The background and wordmark are `priority` (the LCP pair).
  The five floating products are above the fold too, but `loading="eager"`
  with `fetchPriority="low"` — eager so they do not wait on the observer,
  low so their preloads do not compete with the wordmark.
- **Focus styling.** Every interactive element carries a `focus-visible`
  outline: white on the dark hero and footer, blurple on the white grid.
- **Prices are integer paisa** everywhere. The field names still read
  `priceCents` / `unitCents` — a naming lie kept deliberately, because renaming
  them would churn the store, schemas, seed and four test files for no
  behavioural gain. Only `lib/utils/price.js` formats them, as PKR, and it
  normalises the U+00A0 that `Intl` inserts after `Rs` so assertions and copy
  do not fight an invisible character. The cart's persist `version: 2`
  migration drops USD-era carts rather than repricing them.
- **The data layer is the only door to the catalogue.** Pages import from
  `lib/api/products.js`, never from `lib/products.js` directly. It reads Mongo
  when configured, validates whatever comes back with Zod, and falls back to
  the bundled list on any failure — a bad `MONGODB_URI` degrades the build to
  the static catalogue instead of breaking it. The cache has a 60s TTL and is
  cleared whenever the fallback path is taken, because a permanently cached
  fallback means one transient blip at boot silently downgrades the whole site
  and it still looks fine.
- **The catalogue filter keeps the page static.** `/products` is prerendered and
  seeds TanStack Query with `initialData`, so the first paint costs no request;
  only changing a filter hits `/api/products`. Product pages are the same trick:
  SSG plus `revalidate = 60`, with `add-to-cart.jsx` reading live stock on the
  client so a sold-out size is never stale.
- **A signature that does not verify never fails an order.** If a JazzCash
  callback's hash does not check out, the attempt is recorded and the order is
  left `pending` for manual reconciliation rather than marked failed. A bug in
  our reading of the hash rule would otherwise turn genuinely paid orders into
  failed ones and release their stock.
- **A promo counts as redeemed when the order settles, not when it is created.**
  Counting at creation let abandoned gateway checkouts burn down a code's
  `maxRedemptions`. Cash on delivery counts immediately (the order is `received`
  on the spot); gateway orders count in the callback, on success only.
- **Stock reserved by an abandoned gateway order is released by
  `bun run release-stale [minutes]`.** Reservation happens at order creation, so
  a shopper who reaches the gateway and closes the tab would otherwise hold that
  stock forever. The script re-adds the quantities and cancels the order.
- **Duplicate cart lines are merged before pricing.** Two lines for the same
  slug and size would otherwise be stock-checked independently, so 5 + 5 against
  6 in stock would pass twice.
- **The order route never trusts the client.** `/api/orders` looks every line up
  in the catalogue and recomputes from `salePriceCents ?? priceCents`, so a
  tampered payload claiming 1 paisa still gets charged the real amount. It also
  rejects unknown slugs, sizes a product does not have, quantities beyond stock,
  and any `discountCents` the client tries to assert — the promo is re-validated
  server-side. Stock keys come from the *resolved catalogue product*, never the
  request body, because they land in a Mongo field path (`stock.<size>`).
- **Payments are hosted redirect.** See the Payments section above; the two
  hash modules are pure so they can be tested against fixed vectors.
- **Three type tokens, in `lib/type.js`.** `EYEBROW` (sans, semibold, 11px,
  0.12em) is the accent label above a heading. `META` (mono, 10px, 0.2em) is
  field labels, counts, section headings and legal. `SPEC` (sans, 11px,
  regular, relaxed leading) is uppercase detail copy — it exists so the product
  spec lines stop composing `EYEBROW` and immediately overriding its weight.
  Nav text is separate, in `navActionClass`. Before this the same role was
  spelled twelve different ways; compose from the tokens rather than adding a
  thirteenth.
- **Interior pages share one shell, literally.** `components/interior-page.jsx`
  renders every white page — catalogue, cart, checkout, account, orders, track,
  wishlist, sign-in, the 404 and the error boundary — with one heading
  treatment. `centered` is the only variant, for the short message pages. The
  dark hero belongs to the landing page alone; interior pages do not restage it.
- **One CTA, one chip, one tile.** `ui/pill-button.jsx` is every action (`sm`
  for secondary ones); `ui/chip.jsx` is every small *selection* — sizes,
  ratings, wishlist toggle — and never an action; `ui/option-tile.jsx` is the
  larger labelled choice, used for both delivery and payment so the two halves
  of the checkout form do not disagree with each other.
- **One type scale, in `lib/type.js`.** Four label tokens — `EYEBROW`, `META`,
  `SPEC`, `NOTICE` (sentence-case 11px for anything read as a sentence: field
  errors, form errors, inline warnings) — and five content tokens: `DISPLAY`
  (h1), `HEADING` (h2), `TITLE` (row titles, totals, the CTA), `ITEM` (product
  name and price), `BODY`. Nothing outside this file sets a font size. Before
  the pass there were thirteen sizes, including a `text-lg` and a `text-[15px]`
  and a `text-[13px]` that each existed once.
- **Four ink levels, three rules.** `text-black` for primary, `/70` for body,
  `/45` for muted, `/30` for faint and placeholders; `border-black/10` for
  structural dividers, `/20` for interactive borders, `/60` for their hover. The
  white ramp on dark mirrors it at `/85 /70 /45 /30`. Eleven opacity steps
  collapsed to four — the same role was being spelled `/35`, `/40`, `/45`,
  `/50`, `/60`, `/75` and `/80`.
- **Icons are one file, `ui/icons.jsx`** — a single stroked `Svg` wrapper at
  1.3px, currentColor, sized by a `className`. The header is icon-first (heart,
  user, bag) with a count badge and a label that appears at `lg`; trash sits on
  both destructive cart actions, a check on the verified-buyer badge, and truck
  and wallet on the delivery and payment tiles.
- **Ratings are not blurple.** Blurple means "you can act on this". Stars are
  `black/70` on `black/15`, and they sit under the price rather than above the
  name, so a card still reads name → price → evidence.
- **One CTA and one chip.** Every primary action is `ui/pill-button.jsx`; every
  small selectable control is `ui/chip.jsx`. Small round controls all share the
  same shape, including the cart quantity steppers.
- **No inline styles.** All sizing is expressed as Tailwind utilities.

## Payments

Both gateways are **hosted redirect**: the shopper leaves the site, pays on the
gateway's own page, and is sent back. No card number ever touches this
codebase, which is the whole compliance story. "Debit or credit card" is a
*mode* of the two gateways (`PAYMENT_CARD_PROVIDER` picks which), not a third
integration.

- `src/lib/payments/jazzcash-hash.js` and `easypaisa-hash.js` are **pure** —
  they take the secret as an argument, read no env and do no I/O, which is what
  makes fixed-vector tests possible. A wrong hash gets a generic gateway
  rejection with no diagnostic, so those tests are the difference between an
  afternoon and a week.
- JazzCash signs with HMAC-SHA256 over every `pp*` field: empties dropped,
  sorted by field name, values joined with `&`, integrity salt prepended and
  used as the key, hex out. Responses are verified the same way before anything
  is trusted.
- Easypaisa's `merchantHashedReq` is AES-128-ECB over sorted `key=value` pairs,
  base64 encoded, with a 16-character hash key. Its postback is **unsigned** —
  it is treated as a trigger, amount-checked against the stored order, recorded
  as `unverified_postback`, and should not be trusted further until the inquiry
  REST API is wired.
- `POST /api/orders` never returns signed gateway fields. It returns a
  `payUrl`; `/checkout/pay/[reference]` re-loads the order server-side, signs
  from the **stored** amount and renders the redirect form. An endpoint that
  signs client-supplied input is a signing oracle.
- Callbacks are idempotent: each attempt gets its own reference
  (`payment.attempts[].ref`), and settlement is one conditional update filtered
  on `payment.status: "pending"`. A replayed callback is a no-op. Callbacks are
  never rate-limited — dropping a payment notification is worse than absorbing
  a duplicate.
- Stock is reserved at order creation, not at settlement, because the redirect
  window is otherwise an oversell window. A failed payment releases it.

## Without a database

`MONGODB_URI` unset is a supported mode, not a broken one: the bundled
catalogue, reviews and demo order history are served, cash on delivery is the
only checkout option, accounts are unavailable and the sign-in page says so,
and the checkout confirmation states plainly that nothing was stored. Writes
never silently succeed — a configured database that fails a write returns 503,
not a fake reference.

## Responsive

Every page is checked at 375, 768 and ≥1024 with no horizontal overflow
anywhere. The parts that actually needed thought:

- **The hero.** On mobile the wordmark cleared the header only by luck; it now
  has `pt-[calc(var(--spacing-header)+2rem)]`, the floating products drop out of
  absolute positioning and into flow, and the theme switcher centres at the
  bottom instead of colliding with them.
- **Checkout.** The order summary is `order-1` on mobile and `order-2` at `lg`,
  so a shopper sees what they are paying before ten form fields rather than
  after; at `lg` it becomes a sticky right column.
- **The catalogue filter bar** stacked a search underline directly above the
  section rule on mobile, reading as a double line. The container's border is
  now `sm:` only.
- **The order status rail** hides its per-step labels below `sm`; the current
  status is already named above it.
- **The header** is a fixed-height grid, so its three cells share one baseline.
  The wishlist link used to sit in a wrapper `<span>`, which put it on the
  header's text baseline instead of the flex line — that was the visible
  misalignment.

## Security

Beyond the payment rules above:

- **The "verified buyer" badge is derived from the session, never from a typed
  email.** It used to check whether *any* order existed for the email in the
  form, which made the review endpoint an oracle for "has this address bought
  this product?". Guests can review; only signed-in buyers get the badge.
- **`/account/orders` lists by `userId`, never by email** — see Known gaps.
- **Security headers** are set in `next.config.mjs`: `nosniff`, `DENY` framing,
  `strict-origin-when-cross-origin`, a `Permissions-Policy` that turns off
  camera/mic/geolocation/payment, HSTS, and `poweredByHeader: false`. Every
  `/api/*`, `/orders/*`, `/account/*` and `/checkout/*` response is `no-store`.
- **No NoSQL operator injection**: every value that reaches a Mongo filter comes
  through a Zod `z.string()` / `z.email()`, so an attacker cannot smuggle
  `{$ne: null}` through a JSON body.
- **Payment retries are capped** at ten per order; the pay page records an
  attempt on render, so an uncapped page would let one valid token grow the
  attempts array without bound.
- **Sign-in is rate-limited on `email+ip` and on `ip` alone**, so neither a
  single account nor a single host can be hammered.
- **Wishlist writes are filtered against the catalogue** and de-duplicated, and
  a malformed user id returns empty rather than throwing a 500.
- `passwordHash` never leaves `lib/api/users.js`; review emails are projected
  out of every read and stripped from the write response.

## Rate limiting

`src/lib/rate-limit.js` is an in-process LRU. Be honest about what that is:

- Per process. N serverless instances means N × the limit, and a cold start
  resets it.
- Keyed on `x-forwarded-for`, which is spoofable unless the platform overwrites
  it. Vercel does; a bare `next start` behind nginx depends on the nginx config.
- It is a speed bump against casual abuse and double-submits, not a defence
  against a distributed attacker. Upstash or Redis is the upgrade path, and the
  interface is shaped so the implementation can be swapped without touching
  call sites.

## Known gaps

- **No merchant credentials have been tested.** The gateway integrations are
  written to the published specs (JazzCash Payment Gateway Integration Guide
  v4.2, Easypaisa Merchant Integration Guide v4.1.2) and covered by fixed-vector
  unit tests, but nothing has been through a real sandbox. Expect to spend time
  on: whether the "all pp fields" hash rule matches theirs exactly, the
  Easypaisa key/padding and amount string format, and the `Confirm.jsf`
  two-step handshake (the guide spells the field both `orderRefNum` and
  `orderRefNumber`).
- **Neither gateway can reach `localhost`.** Development needs a public tunnel,
  and the return URL registered against the merchant account has to match.
- No admin panel. Catalogue edits are code plus `bun run seed`; order status
  moves with `bun run order-status <reference> <status>`.
- `/account/orders` lists orders by `userId`, never by email. Listing by email
  would undo the claim flow entirely — anyone registering with a stranger's
  address would see their orders and shipping details. No email verification, so
  guest orders are claimed manually by reference plus email (`/account/orders`)
  rather than auto-attached on sign-in. Auto-attaching
  by email is deliberately not implemented: without verified email it would let
  anyone register with a stranger's address and read their shipping details.
- Pending JazzCash transactions (`157`, `210`, `124`) are recorded but not
  reconciled; the Payment Status Inquiry service is not wired.
- Stock reservation is compensating, not transactional. Mongo transactions need
  a replica set, which a local `mongod` does not have.
- `next-auth@5` is still a beta, pinned to an exact version. React 18.3.1
  against Next 16.2.10 is off the supported path.
- `release-stale` has to be run by hand or from cron; there is no job runner in
  the app.
- Product galleries and reviews are mock data built from the existing assets —
  there is still only one real photograph per product.
- The images under `public/assets/` are still the ones downloaded from
  companypolicy.studio (see `ASSETS.txt`). The strings are rebranded; the
  artwork is not. Replace it before publishing anything.
