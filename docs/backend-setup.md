# Account and quotation backend

The site uses one deployment platform and one database: Cloudflare Pages serves the static Astro build, its plain JavaScript Function handles `/api/commerce`, and Cloudflare D1 stores accounts, sessions, private AED prices, carts, quotes, staff roles, and an audit log. Astro is the only application package. Public catalogue pages contain no prices.

## Provision the service

1. Create a Cloudflare Pages project in the business owner's account, connected to this repository. Set build command to `npm run build` and output directory to `dist`.
2. Create a D1 database. In its SQL console, run `migrations/0001_commerce.sql` once. Keep future schema changes in numbered migration files.
3. In Pages project settings, bind that database to the Function with variable name **`DB`** in production and preview. Redeploy after adding the binding. The Function responds with HTTP 503 until the binding exists; account and price controls remain closed.
4. Register an account at `/en/account/`. To grant the owner administrator access, use the D1 SQL console:

   ```sql
   INSERT INTO staff_members(user_id,role)
   SELECT id,'admin' FROM users WHERE email='owner@example.com';
   ```

   Replace the example email with the actual owner's account email. Other staff may be assigned `sales`. Do not add staff credentials or database IDs to Git.
5. The administrator enters current private AED prices at `/en/staff/`. No price seed is committed. A product cannot be added to a basket until it has a price.
6. Connect the business domain and review Cloudflare's current free-tier limits and backup options before opening registration to customers.

## Access rules

- Visitors can browse product descriptions without a session. The Function returns prices only to a signed-in account.
- The Function checks session ownership on every cart change and quote submission. Staff access and administrator price edits are checked on the server.
- Session IDs are random, hashed in D1, and sent as Secure, HttpOnly, SameSite cookies. Passwords are salted and hashed with WebCrypto PBKDF2. Mutating requests require a matching Origin header. Sign-up and login attempts have a database-backed limit.
- The staff queue stores quote requests and customer contact details. Staff can reply using their own mail client. The public sales contact is `sales@ussusmed.com` and WhatsApp is `+971 50 276 8276`.

## Launch gaps

Accounts currently start immediately after sign-up. This minimal-dependency version does **not** verify ownership of the email address, deliver password resets, send quote notifications, collect payment, or generate formal quotation PDFs. Staff must review the queue and send quotations manually. Add an email provider when the business is ready for verification, recovery, and notifications. Until then, customer access to a forgotten password requires a manual support process.

The GitHub repository is public and its old history contains previous reference prices. Those historical values remain available even though current pages hide prices. Enter fresh private prices before launch.
