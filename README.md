# Gurudev Motors — Full-Stack Automotive Dealership & Enterprise CRM Platform

A production-grade, automotive dealership web application and multi-department management system built for **Gurudev Motors** (Raipur, Chhattisgarh).

This platform faithfully preserves Gurudev Motors' authentic brand identity, red & navy color palette (`#071B49`, `#E30613`), showroom & service center addresses, and visual hierarchy from the official showroom mockups, while powering everything with a modern, high-performance, full-stack architecture.

---

## 🌟 Key Highlights & Architecture

- **Public Dealership Website**: High-converting, automotive-grade experience featuring new bikes/scooters, pre-owned inventory with inspection badges, electric mobility (Kinetic Green range with subsidy info), exchange estimator, EMI calculator, service packages, customer reviews, showroom gallery, and contact points.
- **Mobile First / App-Like UI**: Sticky Call & WhatsApp action triggers, fixed bottom navigation, touch-friendly vehicle cards, and zero horizontal overflow across 320px–1920px viewports.
- **Enterprise CRM & Lead Engine**: Instant capture of website leads into an active sales pipeline (`NEW`, `CONTACTED`, `INTERESTED`, `TEST_DRIVE`, `NEGOTIATION`, `BOOKED`, `DELIVERED`, `LOST`) with sales executive assignment, priority, follow-up calendar, and lead notes.
- **360° Customer View**: Holistic customer records consolidating personal info, vehicle history, test drives, bookings, sales contracts, invoices, and service job cards.
- **Vehicle Inventory Management**: Real-time CRUD management for New, Pre-Owned, and Electric vehicles, complete with stock status, pricing, EMI tags, specifications, features, and image uploads.
- **Workshop & Service Management**: Service booking system and multi-stage digital Job Cards (`BOOKED` ➔ `RECEIVED` ➔ `INSPECTION` ➔ `ESTIMATE` ➔ `APPROVED` ➔ `WORK_IN_PROGRESS` ➔ `QUALITY_CHECK` ➔ `READY` ➔ `DELIVERED`) with parts and labor breakdowns.
- **Accounts & Financial Ledger**: Invoices, multi-method payments (`CASH`, `UPI`, `BANK`, `CARD`, `FINANCE`), dealership expenses, GST calculations, daily collection reports, and receivables tracking.
- **Granular RBAC (Role-Based Access Control)**: Dynamic roles and permissions (`VIEW`, `CREATE`, `EDIT`, `DELETE`, `ASSIGN`, `APPROVE`, `EXPORT`) enforced server-side via JWT session tokens and database validation.
- **Website CMS**: No-code management of hero banners, dealership about section, services, promotional offers, gallery images, and contact metadata.
- **Audit Logging**: Immutable tracking of critical staff actions (module, user, record ID, old values, new values, timestamps, and IP addresses).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS (Gurudev Motors Automotive Theme) |
| **ORM** | Prisma ORM 5 |
| **Database** | SQLite (zero-config local dev) / PostgreSQL (production ready) |
| **Authentication** | Secure HTTP-only Cookie Sessions, Signed JWT, Bcrypt Password Hashing |
| **Icons** | Lucide React |

---

## 🏢 Dealership Information (Raipur, CG)

- **Showroom Address**: Mahadev Ghat Chowk, Raipura, Raipur, Chhattisgarh 492013
- **Service Centre**: In front of New Raipura Hospital & Shri Ganesh Mandir lane, Raipura, Raipur, Chhattisgarh 492013
- **Phone / WhatsApp**: `+91 93006 70006`
- **Email**: `contact@gurudevmotors.com` / `info@gurudevmotors.com`

---

## 👥 Seed Accounts & Development Credentials

The database comes pre-seeded with 8 staff accounts representing each dealership department:

| Department / Role | Name | Email | Password | Permissions Scope |
|---|---|---|---|---|
| **Main Admin** | Rajesh Agrawal | `admin@gurudevmotors.com` | `Admin@123` | Full Access across all modules |
| **Sales Manager** | Vikram Sharma | `sales.manager@gurudevmotors.com` | `Sales@123` | Leads, Customers, Vehicles, Bookings, Sales |
| **Sales Executive** | Rahul Verma | `rahul.sales@gurudevmotors.com` | `Sales@123` | Assigned Leads, Customers, Test Drives |
| **Sales Executive** | Priya Sahu | `priya.sales@gurudevmotors.com` | `Sales@123` | Assigned Leads, Customers, Test Drives |
| **Accounts Manager** | Amit Gupta | `accounts@gurudevmotors.com` | `Accounts@123` | Invoices, Payments, Expenses, Reports |
| **Service Manager** | Sunil Dewangan | `service.manager@gurudevmotors.com` | `Service@123` | Service Bookings, Job Cards, Parts, Workshop |
| **Service Advisor** | Manoj Kumar | `manoj.service@gurudevmotors.com` | `Service@123` | Job Card Creation & Status Updates |
| **Service Advisor** | Rakesh Patel | `rakesh.service@gurudevmotors.com` | `Service@123` | Job Card Creation & Status Updates |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm or yarn or pnpm

### 2. Clone and Install
```bash
git clone <repository-url>
cd "Gurudev Motors website"
npm install
```

### 3. Initialize Environment & Database
The project includes a pre-configured `.env` setup for local SQLite execution out of the box:
```bash
# Generate Prisma Client, push schema tables, and seed initial demo data
npm run db:setup
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public website.
Visit [http://localhost:3000/admin](http://localhost:3000/admin) to log in to the Admin Panel.

### 5. Production Build Verification
```bash
npm run build
npm run start
```

---

## 🌐 Routes Overview

### Public Dealership Website
- `/` — Homepage: Hero with multi-brand showcase, quick stats, featured inventory, category switchers, pre-owned & exchange highlights, electric mobility showcase, service intro, customer testimonials, showroom Google Map & hours.
- `/vehicles` — Full vehicle showroom catalog with interactive category filters, brand selectors, fuel filters, and sorting.
- `/vehicles/new` — Brand new motorcycles & scooters catalog (Hero, Honda, Suzuki, Bajaj).
- `/vehicles/pre-owned` — Inspected pre-owned two-wheelers with verification tags and mileage.
- `/vehicles/electric` — Kinetic Green electric range (E-Luna, Zing, Zulu) with EV subsidy & range specs.
- `/exchange` — Two-wheeler exchange valuation calculator and upgrade consultation form.
- `/finance` — EMI loan calculator with interactive principal/tenure/interest sliders and banking partner logos.
- `/services` — Dealership service packages (Periodic General Service, Premium Water Wash, Engine Tuning, Accidental Repair).
- `/service-centre` — Dedicated workshop page with direct service booking form and workshop facilities.
- `/about` — Gurudev Motors story, legacy, customer-first mission, and Raipur location highlights.
- `/offers` — Active festive, cashback, exchange bonus, and helmet/accessory offers.
- `/gallery` — Showroom, delivery ceremonies, customer handovers, and workshop facilities photo gallery.
- `/contact` — Contact numbers, showroom & service centre addresses, operating hours, and interactive enquiry form.

### Admin Panel & Management ERP
- `/admin/login` — Secure staff login with department role detection.
- `/admin` — Executive dashboard with live KPI counters, financial totals, lead pipeline chart, service job queue, and quick actions.
- `/admin/leads` — Lead CRM with status pipeline, sales employee assignment, follow-up dates, and search.
- `/admin/customers` — 360° customer relationship management with purchase history and vehicle records.
- `/admin/vehicles` — Vehicle inventory management (Add/Edit/Delete, publish toggles, featured badges, specs).
- `/admin/sales` — Sales orders, quotation generation, booking advances, vehicle delivery status.
- `/admin/bookings` — Vehicle booking records and scheduled showroom test drives.
- `/admin/service` — Workshop job card tracking, mechanic assignment, parts, labor billing, and multi-stage status workflow.
- `/admin/accounts` — Invoices, payment receipts, expense vouchers, GST records, and daily collection totals.
- `/admin/reports` — Monthly revenue analytics, lead conversion rates, brand sales share, and service turnover.
- `/admin/employees` — Employee directory, department assignments, and system access status.
- `/admin/roles` — Custom role builder with granular permissions (`VIEW`, `CREATE`, `EDIT`, `DELETE`, `ASSIGN`, `APPROVE`, `EXPORT`).
- `/admin/content` — CMS manager for hero headlines, contact details, showroom timings, and announcements.
- `/admin/gallery` — Photo gallery asset manager.
- `/admin/offers` — Promotional discount banners and festive deals manager.
- `/admin/audit-logs` — Security and change-tracking audit trail.
- `/admin/settings` — Dealership metadata, tax settings, and system configuration.

---

## 🗄️ PostgreSQL Production Setup (Vercel / Supabase / Neon)

For production deployment with PostgreSQL:

1. In `prisma/schema.prisma`, update the datasource provider to `postgresql`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set your production environment variables in `.env` (or in Vercel Project Settings):
```env
DATABASE_URL="postgresql://username:password@your-db-host:5432/gurudev_motors?sslmode=require"
JWT_SECRET="use-a-strong-32-byte-random-secret"
NEXT_PUBLIC_APP_URL="https://gurudevmotors.com"
```

3. Run migrations and seed data on the production database:
```bash
npx prisma db push
node prisma/seed.js
```

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub:
```bash
git init
git add .
git commit -m "feat: complete Gurudev Motors full-stack application"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Import the repository in [Vercel](https://vercel.com).
3. Set the Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.).
4. Click **Deploy**. Vercel will run `npm run build` which automatically runs `prisma generate` and produces optimized serverless pages and edge API routes.

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Bcrypt with 10 salt rounds.
- **Session Protection**: HTTP-only, SameSite=Lax session cookies preventing XSS token theft.
- **Server-Side Authorization**: API routes verify user role and granular permissions against the database before executing any write/delete operations.
- **Input Sanitization**: Structured validation on all customer enquiries, test drive requests, and financial entries.
- **Audit Trails**: Security logs capture every administrative update with user ID, timestamps, and network IP.

---

## 📄 License

Proprietary © Gurudev Motors. All rights reserved.
