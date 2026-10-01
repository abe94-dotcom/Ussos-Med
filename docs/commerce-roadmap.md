# USSUS Med storefront plan

## Direction

Keep the current Astro design, product imagery, English/Arabic routes, and AED quotation flow. Make the homepage communicate the full dental-supplies catalogue sooner; digital scanning can remain a featured product story. Add commerce functions in stages as the sales, inventory, delivery, and payment processes become ready.

The July 2026 full-stack starter is a source of feature ideas, not a replacement design or production backend. Its cart, variant, account, admin, and order concepts are useful. Its delivery promises, sample credentials, placeholder integrations, and sample prices are not verified business policy.

## Progress — 1 October 2026

- The homepage now leads with the wider clinic and lab catalogue while retaining the existing visual design and featured scanner.
- English and Arabic category cards open filtered catalogue views. Catalogue search accepts product names and SKUs; implant product forms capture height, system, and optional platform/connection details in the quote basket.
- Account and quotation implementation is underway. Public product pages omit prices. Cloudflare Pages Functions and D1 provide account sessions, private prices, persistent baskets, a staff queue, and stored requests with no additional runtime package. The Cloudflare project and database must be provisioned before launch.
- English is the language for all generated quote emails, staff quotations, receipts, and customer communications, including requests started from the Arabic website.
- Clinic accounts are now required to view prices, add items to a basket, and request a quotation. Public browsing remains available. Direct checkout remains a later stage with the operational prerequisites below.

## Stage 1 — Better product discovery and quote requests

1. Broaden the homepage headline and first call to action so clinics and labs immediately see the wider range: implant prosthetics, digital equipment, consumables, and orthodontics. Keep the current visual system and product-led layout.
2. Make categories and search useful across both languages. Category links should lead to real filtered results. Give product pages structured option choices where applicable: SKU, implant platform/connection, size, restorative or gingival height, and quantity. Do not force irrelevant options onto every product.
3. Keep the quote basket as the primary conversion path. Show selected variants, quantities, AED item subtotals, and the details needed to confirm compatibility. Before claiming a request was received, replace the current email-app handoff with a real submission service and a confirmation message backed by a stored request.
4. Give staff a simple quote queue with status, customer contact details, requested items, and notes. Issue final prices, taxes, shipping, and validity only after staff review. Send customer and staff notifications through a real email provider; add WhatsApp Business messaging only after an approved integration exists.

**Ready when:** a visitor can find and configure a product in either language, submit a quote request, receive a real confirmation, and staff can retrieve and respond to it. All claims about availability and delivery remain conditional until staff confirms them.

## Stage 2 — Catalogue and clinic operations

1. Move product, variant, SKU, price, image, and availability data into an admin-managed catalogue. Keep stable, indexable English and Arabic product URLs and complete translations when the data source changes.
2. Add staff controls for product visibility, variant prices, and stock/status, with audit history and role-based access. Display stock to customers only when inventory updates are reliable; otherwise show an availability enquiry.
3. Require clinic accounts before showing prices or allowing quote-basket actions. Verify email and collect only details needed for correspondence and fulfillment. Add staff approval only if the business later decides to restrict trade pricing beyond basic account creation.
4. Give staff an order/quote dashboard and a small weekly report for request volume, orders, and low-stock SKUs. Define the metrics before treating them as revenue reporting.

**Ready when:** staff can update a product and variant without editing code, the English and Arabic pages stay in sync, and account permissions are enforced on the server.

## Stage 3 — Direct ordering, if operations are ready

1. Add cart and checkout only after confirmed pricing, tax treatment, stock accuracy, delivery coverage, returns policy, and order-fulfillment ownership are documented.
2. Calculate prices, discounts, tax, shipping, and inventory on the server. Reserve or decrement stock and create an order atomically so concurrent checkouts cannot oversell a variant. Show delivery options only for supported destinations and time windows.
3. Integrate an approved UAE payment provider, or an approved invoice/payment-link workflow. Use provider-issued links and payment status; never fabricate a payment link. Send a real order confirmation and invoice through the agreed accounting process.
4. Add order status, courier/reference fields, and customer updates once staff can reliably maintain them. Test refunds, failed payments, duplicate submissions, and cancellations before launch.

**Ready when:** an eligible clinic can place one end-to-end test order, payment and stock reconcile, staff can fulfill it, and customer-facing messages accurately reflect the order state.

## Decisions and safeguards

- **Business owner to confirm:** whether direct checkout is needed at all, who approves clinic accounts, what price is public versus trade-only, which Emirates and delivery speeds are actually supported, and which accounting/payment systems will issue the final invoice.
- **Data and security:** do not reuse the starter's seeded admin password, fallback signing secret, permissive cross-origin setting, browser-stored auth token pattern, or unauthenticated quote pricing. Design proper authentication, validation, rate limits, backups, and access controls before storing customer records.
- **Content integrity:** retain the current bilingual SEO structure and review all English/Arabic UI copy together. Do not advertise same-day delivery, automated invoices, live stock, or successful sending until those workflows exist and are verified.
- **Integration approach:** use the starter as a requirements reference. Build or select a backend around the current storefront and operations instead of importing the demo server wholesale.
