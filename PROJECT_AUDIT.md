# Gurudev Motors Project Audit

Audit date: 2026-10-01

## Scope and confidence

This is a read-only architecture and code-path audit of the existing workspace. The findings below are based on the current source, Prisma schema, seed script, route tree, and package configuration. Runtime and production claims remain unverified until the application is installed, started, and exercised against a configured database.

The git worktree was already dirty before this audit. Existing modified and untracked files were left untouched.

## WORKING

- Next.js 14 App Router structure is present with public pages for home, vehicles, pre-owned, electric, exchange, finance, services, service centre, offers, gallery, about, and contact.
- Admin pages and shared admin layout/sidebar/header components are present for dashboard, leads, customers, vehicles, bookings, service, exchange, finance, offers, gallery, accounts, reports, employees, roles, content, settings, and audit logs.
- Prisma Client is centralized in `src/lib/prisma.ts` and the schema contains dealership entities for users, roles, permissions, departments, customers, leads, vehicles, vehicle images, test drives, exchange, finance, service bookings/jobs, offers, gallery, notifications, and audit logs.
- Vehicle public listing and detail pages call `/api/vehicles` and `/api/vehicles/[id]` rather than embedding inventory in the page components.
- Vehicle CRUD handlers include create, update, delete, publish/featured/stock fields, image relation support, and audit logging for admin writes.
- Public enquiry, exchange, finance, service-booking, and test-drive handlers create database records and generally also ingest a corresponding CRM lead.
- HTTP-only JWT cookie authentication exists, with bcrypt password verification and database-backed role permissions when the database is available.
- Admin APIs generally call `getSessionUser()` and `hasPermission()` before protected reads/writes.
- WhatsApp and telephone CTAs are wired through `wa.me` and `tel:` URLs using configured contact constants.
- `.env` and `.env.example` are ignored or provided without committing credentials; `.env.example` documents the main required variables.
- `npm run build`, Prisma generation, database push, and seeding scripts are defined in `package.json`.

These items are architectural/code-presence findings, not claims that every path has passed an end-to-end runtime test.

## PARTIALLY WORKING

- Inventory is database-backed in code, but the public catalog returns zero when the configured database has no seeded vehicles. `/api/vehicles` has an auto-seed attempt only for an empty unfiltered request, and failures are logged then converted into an empty result or a 500 response.
- The project has resilient fallback staff data for unavailable/unmigrated databases. This helps local demos, but it can hide production database failures and means authentication may succeed without a real database record.
- RBAC is granular in the schema, but the seeded roles are `MAIN_ADMIN`, `SALES_MANAGER`, `SALES_EXECUTIVE`, `ACCOUNTS`, `SERVICE_MANAGER`, and `SERVICE_EXECUTIVE`, not the requested canonical `SUPER ADMIN`, `ADMIN`, `SALES STAFF`, and `SERVICE STAFF` set.
- Admin route protection is primarily performed by the client `AdminLayout` redirect after `/api/auth/me`; server-side API checks exist, but there is no observed middleware/server page guard preventing direct access to all admin page routes before render.
- Public forms have client-side loading/success/error states in several components, but server validation and response shapes are inconsistent across routes. Some forms display raw `error` response text.
- Dashboard data is fetched from `/api/reports` and is database-derived, but the visible KPI set does not match the full requested dashboard metric list and requires runtime verification against populated data.
- Offers and gallery have Prisma models and admin/public routes, but expiry behavior, image lifecycle, and all CRUD paths need focused runtime verification.
- Vehicle image records support ordering and primary images, but the upload endpoint does not provide production-persistent storage.
- Lead creation, customer creation, and related record creation are performed as separate database operations; partial failures can leave orphaned or incomplete CRM records.
- Several identifier generators use `count() + offset`, which can collide under concurrent requests or after deletions.

## BROKEN / HIGH-RISK FINDINGS

- `src/app/api/upload/route.ts` writes uploads into `public/uploads` on the server filesystem. That filesystem is ephemeral on Vercel. Its fallback returns a potentially very large base64 data URL, with no file type allowlist, size limit, or image validation.
- The default JWT secret in `src/lib/auth.ts` is a hardcoded fallback. Production must fail closed when `JWT_SECRET` is missing instead of silently using a known secret.
- Multiple API catch blocks return `error.message` directly, which can expose database/provider details to customers or staff clients. Responses are also not consistently shaped as `{ success, data/message }` or `{ success: false, message }`.
- Public lead/test-drive paths do not consistently enforce the required Indian mobile format server-side. `leads` and `test-drives` normalize numbers but do not both reject non-10-digit values before persistence.
- The admin login page contains seeded demo credentials in client-rendered source. This is unsuitable for production deployment and conflicts with the requirement not to expose sensitive authentication material in client code.
- The seed script deletes all business data before recreating records. It is acceptable as an explicit local reset script, but must not be used against production without a deliberate safety guard.
- The current Prisma datasource is SQLite while the documented Vercel path requires PostgreSQL. No migration directory is present in the workspace, so production schema compatibility is not verified.
- The repository has pre-existing uncommitted modifications in schema, APIs, public pages, components, and new route directories. Those changes must be preserved and understood before any repair is applied.

## MISSING

- Verified production database configuration and migration workflow for Vercel/PostgreSQL.
- Production-safe object storage integration for vehicle, exchange, offer, and gallery images.
- Canonical four-role model and explicit server-side authorization rules for page access and each sensitive action.
- A single validation/response utility used by all public and admin APIs, including safe customer-facing errors.
- Rate limiting, upload limits/content validation, and abuse protection for public forms and upload endpoints.
- Consistent transaction-based customer + lead + request creation and collision-resistant public identifiers.
- Complete customer history view joining leads, exchange, finance, service, and test-drive records.
- Verified CRUD persistence flows for every admin module after refresh, including image delete/reorder and offer/gallery expiry behavior.
- Automated or scripted coverage for customer flows, role boundaries, mobile viewport checks, and production build/runtime checks.
- Explicit loading, empty, error, unauthorized, and not-found verification for every requested route.

## DATABASE

Prisma is the data layer. The current schema uses SQLite via `DATABASE_URL` and defines a broad dealership CRM/ERP model set:

- Identity and authorization: `User`, `Role`, `Permission`, `Department`.
- CRM: `Customer`, `Lead`, `FollowUp`, `Notification`, `AuditLog`.
- Inventory and sales: `Vehicle`, `VehicleImage`, `Booking`, `Sale`, `Invoice`, `Payment`, `Expense`.
- Customer requests: `TestDrive`, `ExchangeRequest`, `FinanceApplication`, `ServiceBooking`.
- Workshop: `ServiceJobCard`, `ServicePart`.
- Website content: `WebsiteContent`, `Gallery`, `Offer`.

Relations and indexes are broadly present. There is no `prisma/migrations` directory in the current workspace; local setup relies on `prisma db push`. Production provider change and migration verification remain outstanding.

## AUTHENTICATION

Authentication uses bcrypt password hashes, signed JWTs, and an HTTP-only `gm_auth_token` cookie with `sameSite: lax` and a seven-day lifetime. `getSessionUser()` rehydrates the user and permissions from Prisma, with a fallback in-memory staff list when the database query fails. API handlers commonly enforce permissions with `hasPermission()`.

The main gaps are the hardcoded JWT fallback secret, fallback authentication that can bypass the database, demo credentials rendered in the login client, inconsistent role naming versus the requested role contract, and lack of a confirmed server-side guard for every admin page route.

## DEPLOYMENT

- `next.config.mjs` enables strict React mode and broad remote image patterns.
- `package.json` builds with `prisma generate && next build` and has local `db:setup`/seed scripts.
- `.env.example` documents `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, dealership contact, and address variables.
- The checked-in schema is SQLite, while `README.md` describes manually changing it to PostgreSQL for Vercel. This is not a verified production deployment configuration.
- Local filesystem uploads and SQLite are not suitable as persistent Vercel production storage/database choices.
- No `vercel.json` or Prisma migration directory is present.

## POST-AUDIT DATABASE PREPARATION

- The canonical Prisma datasource provider is now PostgreSQL, matching the intended production architecture.
- The existing `prisma/dev.db` SQLite file was preserved and not converted or deleted.
- `.env.example` now contains variable names only and includes the development-only `ALLOW_DESTRUCTIVE_SEED` guard.
- `prisma:migrate:deploy` was added for applying reviewed production migrations.
- No migration was generated without a configured PostgreSQL database. The first migration must be created and reviewed with `npx prisma migrate dev --name init` after local PostgreSQL setup.
- The existing full reset seed now refuses production and requires explicit development authorization.

## Recommended repair order

1. Verify local database/schema/seed and run a production build to expose current compile/runtime blockers.
2. Fix the vehicle API/data path and confirm seeded inventory renders publicly.
3. Harden shared validation, safe API errors, identifier generation, and public form transactions.
4. Replace filesystem/base64 uploads with configured persistent storage or a clearly supported upload contract.
5. Tighten authentication/RBAC and remove client-exposed demo credentials.
6. Verify each admin CRUD surface and requested mobile/customer flows, then write `IMPLEMENTATION_REPORT.md` with only tested claims.
