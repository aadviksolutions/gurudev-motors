import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const LOGO_PATH = path.join(process.cwd(), 'public', 'images', 'logo.jpeg');
let logoBase64 = '';
if (fs.existsSync(LOGO_PATH)) {
  logoBase64 = `data:image/jpeg;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`;
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gurudev Motors - Standard Operating Procedure (SOP) Manual</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 15mm 18mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Cover Page */
    .cover-page {
      padding: 40px 20px 20px 20px;
      text-align: center;
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .cover-logo {
      max-height: 90px;
      width: auto;
      margin-bottom: 25px;
      border-radius: 8px;
    }
    .cover-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #fee2e2;
      color: #b91c1c;
      font-size: 10pt;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 9999px;
      margin-bottom: 20px;
      border: 1px solid #fecaca;
    }
    .cover-title {
      font-size: 26pt;
      font-weight: 900;
      color: #0b192c;
      line-height: 1.2;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }
    .cover-subtitle {
      font-size: 14pt;
      font-weight: 600;
      color: #dc2626;
      margin: 0 0 25px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cover-desc {
      font-size: 11pt;
      color: #475569;
      max-width: 650px;
      margin: 0 auto 35px auto;
      line-height: 1.6;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 18px 24px;
      margin: 0 auto 30px auto;
      max-width: 600px;
      text-align: left;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 10px;
      column-gap: 20px;
      font-size: 9.5pt;
    }
    .meta-grid strong {
      color: #0b192c;
    }
    .cover-footer {
      border-top: 2px solid #e2e8f0;
      padding-top: 15px;
      font-size: 8.5pt;
      color: #64748b;
    }

    /* Standard Content Styling */
    h1, h2, h3, h4 {
      color: #0b192c;
      font-weight: 800;
    }
    h1 {
      font-size: 18pt;
      border-bottom: 2px solid #dc2626;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    h1 .chapter-no {
      font-size: 11pt;
      color: #dc2626;
      font-weight: 900;
      letter-spacing: 1px;
    }
    h2 {
      font-size: 13pt;
      margin-top: 18px;
      margin-bottom: 8px;
      color: #1e293b;
      border-left: 3px solid #dc2626;
      padding-left: 8px;
    }
    h3 {
      font-size: 11pt;
      margin-top: 12px;
      margin-bottom: 6px;
      color: #334155;
    }
    p, li {
      color: #334155;
      font-size: 9.5pt;
      line-height: 1.55;
    }
    ul, ol {
      margin-top: 4px;
      margin-bottom: 12px;
      padding-left: 22px;
    }
    li {
      margin-bottom: 4px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 9pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #0b192c;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Callout Boxes */
    .callout {
      border-radius: 8px;
      padding: 10px 14px;
      margin: 10px 0;
      font-size: 9pt;
      border-left: 4px solid;
    }
    .callout-info {
      background-color: #eff6ff;
      border-color: #3b82f6;
      color: #1e40af;
    }
    .callout-warning {
      background-color: #fffbeb;
      border-color: #f59e0b;
      color: #92400e;
    }
    .callout-danger {
      background-color: #fef2f2;
      border-color: #ef4444;
      color: #991b1b;
    }
    .callout-success {
      background-color: #f0fdf4;
      border-color: #22c55e;
      color: #166534;
    }
    .callout b {
      display: block;
      margin-bottom: 3px;
      font-size: 9.5pt;
    }

    /* Steps Box */
    .step-box {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 10px;
    }
    .step-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .step-badge {
      background: #dc2626;
      color: white;
      font-weight: 800;
      font-size: 8pt;
      padding: 2px 7px;
      border-radius: 9999px;
    }
    .step-title {
      font-weight: 700;
      color: #0b192c;
      font-size: 10pt;
    }

    /* Header & Footer on printed pages */
    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 5px;
      margin-bottom: 15px;
      font-size: 8pt;
      color: #64748b;
      font-weight: 600;
    }
    .doc-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 8pt;
      color: #94a3b8;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dotted #cbd5e1;
      font-size: 9.5pt;
    }
    .toc-item b {
      color: #0b192c;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page page-break">
    <div>
      <img src="${logoBase64}" alt="Gurudev Motors" class="cover-logo" />
      <br/>
      <span class="cover-badge">Official Operating Standard</span>
      <h1 class="cover-title" style="border: none; margin-bottom: 8px;">STANDARD OPERATING PROCEDURE (SOP)</h1>
      <div class="cover-subtitle">Complete Dealership Management System & Web Operations Manual</div>
      <p class="cover-desc">
        Comprehensive standard operating guidelines for Gurudev Motors Raipur. Covers public customer web portal operations, role-based access control, CRM lead follow-ups, inventory lifecycle, workshop job cards, billing, accounts, and system administrative governance.
      </p>

      <div class="meta-box">
        <div class="meta-grid">
          <div><strong>Dealership:</strong> Gurudev Motors</div>
          <div><strong>Headquarters:</strong> Raipura, Raipur (C.G.)</div>
          <div><strong>Contact Hotline:</strong> +91 7000619808</div>
          <div><strong>Official Website:</strong> gurudevmotors.com</div>
          <div><strong>Document Version:</strong> 1.0 (Production Release)</div>
          <div><strong>Target Audience:</strong> Staff, Managers &amp; Admins</div>
          <div><strong>Authorizing Authority:</strong> General Management</div>
          <div><strong>Effective Date:</strong> November 2026</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <strong>CONFIDENTIAL &amp; PROPRIETARY:</strong> This manual contains proprietary operational standards of Gurudev Motors Raipur. Unauthorized copying, external distribution, or transmission without prior written authorization is strictly prohibited.
    </div>
  </div>

  <!-- ==================== TABLE OF CONTENTS ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • DEALERSHIP STANDARD OPERATING PROCEDURE</span>
      <span>TABLE OF CONTENTS</span>
    </div>

    <h1>Table of Contents</h1>
    
    <div style="margin-top: 20px;">
      <div class="toc-item">
        <span><b>Chapter 1:</b> System Overview &amp; Architecture</span>
        <span>Page 3</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 2:</b> Customer Public Website Operations &amp; Enquiries</span>
        <span>Page 4</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 3:</b> Role-Based Access Control (RBAC) &amp; User Responsibilities</span>
        <span>Page 5</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 4:</b> Lead CRM &amp; Follow-up Management Protocol</span>
        <span>Page 6</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 5:</b> Vehicle Inventory Lifecycle &amp; Media Rules</span>
        <span>Page 7</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 6:</b> Customer Database &amp; Bulk Import SOP</span>
        <span>Page 8</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 7:</b> Two-Wheeler Exchange &amp; Finance Application Processing</span>
        <span>Page 9</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 8:</b> Workshop Service &amp; Job Card Management (Physical Replica SOP)</span>
        <span>Page 10</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 9:</b> Invoicing, Billing &amp; Payment Collections</span>
        <span>Page 11</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 10:</b> Dealership Reporting &amp; Analytics Export</span>
        <span>Page 12</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 11:</b> Admin Governance, Custom Roles &amp; Security Audit</span>
        <span>Page 13</span>
      </div>
      <div class="toc-item">
        <span><b>Chapter 12:</b> Daily Operational Checklists &amp; Emergency Escalation</span>
        <span>Page 14</span>
      </div>
    </div>

    <div class="callout callout-info" style="margin-top: 40px;">
      <b>Instructions for Staff:</b>
      All employees, service advisors, sales executives, and managers must adhere strictly to the protocols set forth in this manual. Any discrepancies or system deviations must be reported immediately to the System Administrator.
    </div>
  </div>

  <!-- ==================== CHAPTER 1 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 1: SYSTEM OVERVIEW</span>
    </div>

    <h1>
      <span>System Overview &amp; Architecture</span>
      <span class="chapter-no">CHAPTER 1</span>
    </h1>

    <h2>1.1 Introduction</h2>
    <p>
      Gurudev Motors is Raipur's premier multi-brand two-wheeler dealership representing leading manufacturers including Hero, Honda, TVS, Bajaj, and Suzuki. The integrated software platform consists of two unified environments:
    </p>
    <ul>
      <li><strong>Public Customer Web Portal:</strong> High-performance, SEO-optimized, mobile-responsive web platform designed for customers to discover motorcycles and scooters, calculate EMIs, evaluate exchange vehicles, schedule service, and connect via WhatsApp.</li>
      <li><strong>Admin &amp; Business Management Portal (DMS):</strong> Secure, multi-role dealership management system handling showroom operations, CRM lead pipelines, vehicle stock inventory, workshop job cards with A4 printing, finance applications, and financial analytics.</li>
    </ul>

    <h2>1.2 Core Architectural Principles</h2>
    <table class="avoid-break">
      <thead>
        <tr>
          <th style="width: 25%;">Component</th>
          <th style="width: 35%;">Technology / Stack</th>
          <th style="width: 40%;">Operational Function</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Frontend Architecture</strong></td>
          <td>Next.js 15 (App Router), React, Tailwind CSS</td>
          <td>Delivers sub-second page loads, Core Web Vitals compliance, and responsive touch interfaces on mobile and desktop.</td>
        </tr>
        <tr>
          <td><strong>Backend API</strong></td>
          <td>Next.js Server Endpoints, TypeScript</td>
          <td>Enforces role-based permissions, transactional data validation, and automated notifications.</td>
        </tr>
        <tr>
          <td><strong>Database Layer</strong></td>
          <td>PostgreSQL with Prisma ORM</td>
          <td>Maintains relational data integrity, indexing, foreign key constraints, and relational queries across models.</td>
        </tr>
        <tr>
          <td><strong>Security &amp; Auth</strong></td>
          <td>JWT (JSON Web Tokens), HttpOnly Secure Cookies</td>
          <td>Stateless authentication with automatic role scope verification on every protected route.</td>
        </tr>
        <tr>
          <td><strong>Audit &amp; Logging</strong></td>
          <td>System Audit Trail Engine</td>
          <td>Every create, update, and delete action records user ID, IP, module, and change delta.</td>
        </tr>
      </tbody>
    </table>

    <h2>1.3 System Access Points</h2>
    <ul>
      <li><strong>Public Web Portal:</strong> <code>https://gurudevmotors.com</code> (or primary production domain)</li>
      <li><strong>Admin &amp; Staff Login:</strong> <code>https://gurudevmotors.com/admin/login</code></li>
      <li><strong>Default Initial Super Admin:</strong> <code>admin@gurudevmotors.com</code></li>
    </ul>

    <div class="callout callout-warning avoid-break">
      <b>Security Notice:</b>
      Staff members must never share their personal login credentials. All actions executed under an account are logged irreversibly in the system audit trail.
    </div>
  </div>

  <!-- ==================== CHAPTER 2 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 2: CUSTOMER WEBSITE</span>
    </div>

    <h1>
      <span>Public Website Operations</span>
      <span class="chapter-no">CHAPTER 2</span>
    </h1>

    <h2>2.1 Customer Journey Overview</h2>
    <p>
      The public website is designed to guide prospective buyers seamlessly from vehicle discovery to showroom visit or service booking.
    </p>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">1</span>
        <span class="step-title">Vehicle Exploration &amp; Catalog</span>
      </div>
      <p>
        Customers can filter two-wheelers by category (Commuter, Sports, Scooter, Electric), brand (Hero, Honda, TVS, Bajaj, Suzuki), engine capacity (CC), and price range. Clicking on any bike displays high-resolution imagery, technical specifications, and key features.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">2</span>
        <span class="step-title">Interactive Road Hero &amp; Showroom Presentation</span>
      </div>
      <p>
        The homepage features an authentic road showcase displaying verified two-wheelers in motion against the landmark Raipur backdrop. This showcase is permanently decoupled from inventory changes to guarantee brand aesthetics.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">3</span>
        <span class="step-title">EMI &amp; Loan Calculator</span>
      </div>
      <p>
        Located at <code>/finance</code>, customers can calculate monthly EMIs using both <strong>Reducing Balance</strong> and <strong>Flat Rate</strong> methods. Upon entering loan amount, down payment, tenure, and interest rate, they can submit an instant loan pre-approval request.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">4</span>
        <span class="step-title">Instant Two-Wheeler Exchange Valuation</span>
      </div>
      <p>
        Customers entering current vehicle model, manufacture year, running kilometers, and condition receive an estimated valuation range and can book an on-site physical evaluation.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">5</span>
        <span class="step-title">Workshop Service Booking</span>
      </div>
      <p>
        Customers select preferred service date, service type (Free Coupon, Periodic Maintenance, Repair), and vehicle registration number. The request lands directly in the Service Manager CRM.
      </p>
    </div>

    <h2>2.2 Automated CRM Ingestion</h2>
    <p>
      Every public form submission automatically triggers:
    </p>
    <ol>
      <li>Immediate creation of a new customer record (if mobile number does not exist).</li>
      <li>Creation of a CRM Lead with status <code>NEW</code> and unique Lead Number (e.g., <code>LD-2026-105</code>).</li>
      <li>Round-robin or manager-specified assignment to active Sales Executives.</li>
      <li>In-app alert notification delivered to the assigned staff member.</li>
    </ol>
  </div>

  <!-- ==================== CHAPTER 3 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 3: ROLES &amp; PERMISSIONS</span>
    </div>

    <h1>
      <span>Role-Based Access Control (RBAC)</span>
      <span class="chapter-no">CHAPTER 3</span>
    </h1>

    <h2>3.1 Dealership Role Hierarchy</h2>
    <p>
      To maintain strict data security and operational discipline, access to dealership data is governed by granular role permissions.
    </p>

    <table class="avoid-break">
      <thead>
        <tr>
          <th>Role Title</th>
          <th>Code</th>
          <th>Core Responsibilities</th>
          <th>Access Scope</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Main Admin</strong></td>
          <td><code>MAIN_ADMIN</code></td>
          <td>Complete system authority, user and role creation, financial ledger audit, CMS controls, settings.</td>
          <td>Full System (All Branches)</td>
        </tr>
        <tr>
          <td><strong>Showroom Manager</strong></td>
          <td><code>SHOWROOM_MANAGER</code></td>
          <td>Supervision of sales pipeline, inventory stock levels, staff assignment, customer dispute resolution.</td>
          <td>Dealership Wide</td>
        </tr>
        <tr>
          <td><strong>Sales Executive</strong></td>
          <td><code>SALES_EXECUTIVE</code></td>
          <td>Customer consultations, lead follow-ups, quotation generation, test ride assistance.</td>
          <td>Assigned Leads Only</td>
        </tr>
        <tr>
          <td><strong>Service Manager</strong></td>
          <td><code>SERVICE_MANAGER</code></td>
          <td>Workshop workflow, job card approval, technician assignment, estimate revisions, gate pass sign-off.</td>
          <td>Workshop &amp; Service</td>
        </tr>
        <tr>
          <td><strong>Service Executive / Advisor</strong></td>
          <td><code>SERVICE_ADVISOR</code></td>
          <td>Customer intake, physical condition recording, job card generation, WhatsApp updates, A4 printing.</td>
          <td>Workshop Desk</td>
        </tr>
        <tr>
          <td><strong>Finance &amp; Accounts</strong></td>
          <td><code>ACCOUNTS_OFFICER</code></td>
          <td>Loan documentation verification, bank coordination, customer invoice creation, payment reconciliation.</td>
          <td>Finance &amp; Invoices</td>
        </tr>
      </tbody>
    </table>

    <h2>3.2 Granular Permissions Matrix</h2>
    <table class="avoid-break" style="font-size: 8.5pt;">
      <thead>
        <tr>
          <th>Module</th>
          <th>Main Admin</th>
          <th>Showroom Mgr</th>
          <th>Sales Exec</th>
          <th>Service Mgr</th>
          <th>Service Advisor</th>
          <th>Accounts</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Dashboard KPIs</strong></td>
          <td>Full</td>
          <td>Branch</td>
          <td>Personal</td>
          <td>Workshop</td>
          <td>Workshop</td>
          <td>Financial</td>
        </tr>
        <tr>
          <td><strong>Leads CRM</strong></td>
          <td>View / Edit / Del</td>
          <td>View / Edit / Reassign</td>
          <td>Assigned Edit</td>
          <td>View</td>
          <td>None</td>
          <td>View</td>
        </tr>
        <tr>
          <td><strong>Vehicle Inventory</strong></td>
          <td>View / Edit / Del</td>
          <td>View / Edit</td>
          <td>View Only</td>
          <td>View Only</td>
          <td>None</td>
          <td>View</td>
        </tr>
        <tr>
          <td><strong>Customers DB</strong></td>
          <td>Full Access</td>
          <td>View / Add / Edit</td>
          <td>View / Add</td>
          <td>View / Add</td>
          <td>View / Add</td>
          <td>View</td>
        </tr>
        <tr>
          <td><strong>Service Job Cards</strong></td>
          <td>Full Access</td>
          <td>View Only</td>
          <td>None</td>
          <td>Full Workshop</td>
          <td>Create / Print / Share</td>
          <td>Invoice Gen</td>
        </tr>
        <tr>
          <td><strong>Finance &amp; Loans</strong></td>
          <td>Full Access</td>
          <td>View / Update</td>
          <td>View Only</td>
          <td>None</td>
          <td>None</td>
          <td>Process / Update</td>
        </tr>
        <tr>
          <td><strong>Staff &amp; Roles</strong></td>
          <td>Full Management</td>
          <td>None</td>
          <td>None</td>
          <td>None</td>
          <td>None</td>
          <td>None</td>
        </tr>
        <tr>
          <td><strong>Reports &amp; Export</strong></td>
          <td>All Reports</td>
          <td>Sales &amp; Stock</td>
          <td>My Conversions</td>
          <td>Workshop Only</td>
          <td>Daily Jobs</td>
          <td>Ledgers</td>
        </tr>
      </tbody>
    </table>

    <h2>3.3 Full-Screen Workspace Toggle</h2>
    <p>
      Any logged-in user can click the <strong>"Full Screen" / "Show Menu"</strong> button located in the top header or the collapse icon on the sidebar. This smoothly collapses the navigation drawer, expanding data tables to 100% width. The user's preference is remembered automatically.
    </p>
  </div>

  <!-- ==================== CHAPTER 4 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 4: LEAD CRM &amp; FOLLOW-UP</span>
    </div>

    <h1>
      <span>Lead CRM &amp; Follow-up Protocol</span>
      <span class="chapter-no">CHAPTER 4</span>
    </h1>

    <h2>4.1 CRM Pipeline Stages</h2>
    <p>
      Every sales inquiry progresses through defined milestones. Staff must update the status dropdown immediately upon concluding customer communication:
    </p>
    <ul>
      <li><span style="color: #2563eb; font-weight: bold;">NEW:</span> Newly ingested lead; pending first contact.</li>
      <li><span style="color: #d97706; font-weight: bold;">CONTACTED:</span> Initial phone call completed; customer requirements identified.</li>
      <li><span style="color: #4f46e5; font-weight: bold;">INTERESTED:</span> Customer confirmed interest in a specific vehicle or pricing.</li>
      <li><span style="color: #7c3aed; font-weight: bold;">TEST_DRIVE:</span> Customer scheduled or completed showroom test ride.</li>
      <li><span style="color: #0284c7; font-weight: bold;">NEGOTIATION:</span> Price quote, exchange valuation, or EMI terms under active discussion.</li>
      <li><span style="color: #059669; font-weight: bold;">BOOKED:</span> Booking deposit paid; delivery scheduled.</li>
      <li><span style="color: #10b981; font-weight: bold;">DELIVERED:</span> Vehicle delivered to customer; handover completed.</li>
      <li><span style="color: #dc2626; font-weight: bold;">LOST:</span> Customer declined or purchased elsewhere (reason must be logged in notes).</li>
    </ul>

    <h2>4.2 Follow-up Logging Protocol (Mandatory Standard)</h2>
    <div class="callout callout-danger avoid-break">
      <b>CRITICAL COMPLIANCE RULE:</b>
      Sales executives must record a follow-up log for every customer conversation. The system automatically enforces date and time capture.
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">Step 1</span>
        <span class="step-title">Access Lead Details</span>
      </div>
      <p>
        In <strong>Admin &gt; Leads CRM</strong>, locate the customer record and click <strong>"Details &amp; Log &#8599;"</strong>.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">Step 2</span>
        <span class="step-title">Review History &amp; Automatic System Timestamp</span>
      </div>
      <p>
        The modal displays the complete chronological history of past follow-ups. The top badge displays the live <strong>System Generated Time</strong> (e.g. <code>10:45 AM</code>), guaranteeing tamper-proof activity records.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">Step 3</span>
        <span class="step-title">Select Next Follow-up Date</span>
      </div>
      <p>
        Select the future date for the next contact from the <strong>Next Follow-up Date</strong> picker. The system automatically defaults to tomorrow or a future date—it will never leave the date stale on today's date.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">Step 4</span>
        <span class="step-title">Enter Remarks &amp; Save</span>
      </div>
      <p>
        Enter summary notes (e.g., <em>"Spoke with customer; prefers red colour Splendor XTEC; requesting exchange valuation on Saturday"</em>) and click <strong>"Save &amp; Schedule Next"</strong>.
      </p>
    </div>

    <h2>4.3 Automated Log Entry Format</h2>
    <p>
      The system automatically records the entry in the following standardized format:
    </p>
    <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 8.5pt; color: #0f172a;" class="avoid-break">
      [Follow-up Taken: 02 Nov 2026, 10:45 PM | Next Follow-up: 06 Nov 2026] Customer called, requested finance details for 2-year tenure.
    </div>

    <h2>4.4 Overdue Alert Handling</h2>
    <p>
      If the scheduled <strong>Next Follow-up Date</strong> passes without a new log being entered, the lead row highlights in red with an <span style="background: #fee2e2; color: #b91c1c; font-weight: bold; padding: 1px 5px; border-radius: 4px; font-size: 8pt;">OVERDUE</span> badge, and the Manager's Dashboard KPI increments the overdue alert counter.
    </p>
  </div>

  <!-- ==================== CHAPTER 5 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 5: VEHICLE INVENTORY</span>
    </div>

    <h1>
      <span>Vehicle Inventory Lifecycle</span>
      <span class="chapter-no">CHAPTER 5</span>
    </h1>

    <h2>5.1 Inventory Classification</h2>
    <p>
      Gurudev Motors maintains two distinct inventory classifications:
    </p>
    <ul>
      <li><strong>Brand-New Vehicles:</strong> Factory-fresh motorcycles and scooters across authorized brands (Hero, Honda, TVS, Bajaj, Suzuki).</li>
      <li><strong>Certified Pre-Owned Vehicles:</strong> Thoroughly inspected, workshop-certified used vehicles with complete RTO verification and dealer warranty.</li>
    </ul>

    <h2>5.2 Adding a Vehicle to Inventory</h2>
    <table class="avoid-break">
      <thead>
        <tr>
          <th>Field Name</th>
          <th>Requirement</th>
          <th>Standard / Format</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Brand Name</strong></td>
          <td>Mandatory</td>
          <td>Must select from Hero, Honda, TVS, Bajaj, Suzuki.</td>
        </tr>
        <tr>
          <td><strong>Model &amp; Variant</strong></td>
          <td>Mandatory</td>
          <td>e.g., <code>Splendor+ XTEC Disc OBD-2</code>, <code>Activa 6G DLX</code>.</td>
        </tr>
        <tr>
          <td><strong>Category</strong></td>
          <td>Mandatory</td>
          <td>Commuter, Sports, Cruiser, Scooter, or Electric.</td>
        </tr>
        <tr>
          <td><strong>Ex-Showroom Price</strong></td>
          <td>Mandatory</td>
          <td>Numerical INR amount (e.g., <code>79500</code>).</td>
        </tr>
        <tr>
          <td><strong>Engine Specs</strong></td>
          <td>Mandatory</td>
          <td>Displacement (e.g. <code>124.7 cc</code>), Max Power, Transmission (Manual/Automatic).</td>
        </tr>
        <tr>
          <td><strong>Fuel &amp; Mileage</strong></td>
          <td>Mandatory</td>
          <td>Fuel type (Petrol/Electric) and ARAI mileage (e.g. <code>65 kmpl</code>).</td>
        </tr>
        <tr>
          <td><strong>Stock Status</strong></td>
          <td>Mandatory</td>
          <td><code>IN_STOCK</code>, <code>LOW_STOCK</code>, <code>BOOKED</code>, or <code>SOLD</code>.</td>
        </tr>
      </tbody>
    </table>

    <h2>5.3 Image Upload Restrictions &amp; Policy</h2>
    <div class="callout callout-danger avoid-break">
      <b>STRICT SECURITY COMPLIANCE:</b>
      To maintain absolute visual consistency and prevent website layout breaks:
      <ul>
        <li>Image uploads are strictly confined to <strong>Vehicle Inventory</strong> and <strong>Showroom Gallery</strong>.</li>
        <li>Public hero backgrounds and cutouts cannot be altered via CMS to safeguard performance and layout.</li>
        <li>Images must be clean, well-lit showroom photos or authentic manufacturer cutouts. Recommended resolution: 1200x800px WebP or JPEG.</li>
      </ul>
    </div>
  </div>

  <!-- ==================== CHAPTER 6 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 6: CUSTOMER DATABASE</span>
    </div>

    <h1>
      <span>Customer Management &amp; Bulk Upload</span>
      <span class="chapter-no">CHAPTER 6</span>
    </h1>

    <h2>6.1 Central Customer Database</h2>
    <p>
      Every individual who purchases a vehicle, gets service, applies for financing, or registers an inquiry has a permanent profile in <strong>Admin &gt; Customers</strong>. Customer records link directly to sales invoices and workshop job cards.
    </p>

    <h2>6.2 Direct Customer Addition (Without a Lead)</h2>
    <p>
      Staff can add a walk-in or service customer directly without routing through the CRM sales pipeline:
    </p>
    <ol>
      <li>Navigate to <strong>Admin &gt; Customers</strong>.</li>
      <li>Click the red <strong>"Add Customer"</strong> button.</li>
      <li>Enter Full Name, 10-digit Indian Mobile Number (mandatory), Email, Address, and City.</li>
      <li>Click <strong>"Save Customer"</strong>. The system assigns a unique ID (e.g. <code>CUST-2026-042</code>).</li>
    </ol>

    <h2>6.3 Bulk Customer Upload (CSV Import)</h2>
    <p>
      For importing historical records, promotional databases, or service customer lists:
    </p>
    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">1</span>
        <span class="step-title">Prepare CSV Spreadsheet</span>
      </div>
      <p>
        Create a UTF-8 CSV file with the following column headers in exact order:
      </p>
      <div style="background: #f1f5f9; padding: 6px 10px; border-radius: 4px; font-family: monospace; font-size: 8.5pt;">
        Name, Mobile, Email, Address, Notes
      </div>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">2</span>
        <span class="step-title">Validation Checks</span>
      </div>
      <ul>
        <li>Mobile numbers must be valid 10-digit Indian numbers starting with 6, 7, 8, or 9.</li>
        <li>Duplicate mobile numbers already existing in the database are safely skipped to avoid record collisions.</li>
      </ul>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">3</span>
        <span class="step-title">Execute Import</span>
      </div>
      <p>
        Click <strong>"Bulk Upload"</strong>, select the CSV file, and confirm. The system processes the records in a single transactional batch and displays a summary of imported versus skipped entries.
      </p>
    </div>
  </div>

  <!-- ==================== CHAPTER 7 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 7: EXCHANGE &amp; FINANCE</span>
    </div>

    <h1>
      <span>Exchange &amp; Finance Processing</span>
      <span class="chapter-no">CHAPTER 7</span>
    </h1>

    <h2>7.1 Two-Wheeler Exchange SOP</h2>
    <p>
      When a customer brings an old two-wheeler for exchange against a new purchase:
    </p>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">Step 1</span>
        <span class="step-title">Physical Inspection</span>
      </div>
      <p>
        The evaluator inspects engine noise, chassis integrity, tire tread, electricals, and odometer readings.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">Step 2</span>
        <span class="step-title">Document Verification</span>
      </div>
      <p>
        Verify Original Registration Certificate (RC), Insurance validity, RTO Challan status (via Vahan portal), and owner identity (Aadhar card).
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">Step 3</span>
        <span class="step-title">Valuation Approval &amp; Deductions</span>
      </div>
      <p>
        Enter Final Valuation in <strong>Admin &gt; Exchange Requests</strong>. This amount is automatically credited as customer down payment towards the new vehicle invoice.
      </p>
    </div>

    <h2>7.2 Two-Wheeler Finance &amp; Loan Workflow</h2>
    <table class="avoid-break">
      <thead>
        <tr>
          <th>Stage</th>
          <th>Responsible Staff</th>
          <th>Action Required</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Application Review</strong></td>
          <td>Finance Executive</td>
          <td>Verify customer PAN, Aadhar, 3-month bank statement, and salary slip / income proof.</td>
        </tr>
        <tr>
          <td><strong>2. Banker Routing</strong></td>
          <td>Finance Officer</td>
          <td>Submit file to preferred partner: HDFC, IDFC First, TVS Credit, Hero FinCorp, or Bajaj Finance.</td>
        </tr>
        <tr>
          <td><strong>3. Field Verification (FI)</strong></td>
          <td>Bank Representative</td>
          <td>Coordinate customer residence and workplace verification.</td>
        </tr>
        <tr>
          <td><strong>4. Sanction &amp; DO Issuance</strong></td>
          <td>Finance Officer</td>
          <td>Obtain Delivery Order (DO) letter from financing bank.</td>
        </tr>
        <tr>
          <td><strong>5. Disbursement &amp; Invoice</strong></td>
          <td>Cashier &amp; Accounts</td>
          <td>Verify down payment received in showroom bank; generate vehicle sales invoice.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== CHAPTER 8 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 8: WORKSHOP &amp; JOB CARDS</span>
    </div>

    <h1>
      <span>Workshop &amp; Job Card SOP</span>
      <span class="chapter-no">CHAPTER 8</span>
    </h1>

    <h2>8.1 Physical Job Card Replication Standard</h2>
    <p>
      The digital Job Card system precisely mirrors the official physical Gurudev Motors Job Card format. Service Advisors must capture all vehicle and customer details upon intake.
    </p>

    <h2>8.2 Job Card Intake Fields</h2>
    <table class="avoid-break" style="font-size: 8.5pt;">
      <thead>
        <tr>
          <th>Category</th>
          <th>Included Fields</th>
          <th>Operational Guidelines</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Job Card Header</strong></td>
          <td>Manual Job Card No, Out Date/Time, Branch</td>
          <td>Manual Job Card No is optional; system auto-generates sequential format (e.g. <code>JC-2026-0816</code>) if blank.</td>
        </tr>
        <tr>
          <td><strong>Customer Details</strong></td>
          <td>Name, Address, Phone No, Email</td>
          <td>Ensure valid WhatsApp mobile number for sending job card copy.</td>
        </tr>
        <tr>
          <td><strong>Vehicle Details</strong></td>
          <td>Model, Type (Kick/Self), Frame No, Engine No, Colour, Reg No, Date of Sale, KMs Run, Key No, Free Service Coupon No, Selling Dealer</td>
          <td>Inspect odometer and verify chassis/engine number against physical plate. Free coupon number must be recorded for warranty claims.</td>
        </tr>
        <tr>
          <td><strong>Type of Service</strong></td>
          <td>Free Service, Paid Service, Extended Warranty, AMC, Accidental, General Repair, Complaint</td>
          <td>Multi-select checkboxes indicating all applicable service categories.</td>
        </tr>
        <tr>
          <td><strong>Customer Requests &amp; Advice</strong></td>
          <td>Dynamic 3-Column Table:
            <br/>1. Regular Customer Request
            <br/>2. Special Request / Comments
            <br/>3. Repair Advice / Action Taken
          </td>
          <td>Add multiple rows dynamically. Service Advisor records customer voice and technician diagnosis side by side.</td>
        </tr>
        <tr>
          <td><strong>Itemized Cost Estimate</strong></td>
          <td>Parts Charges, Labour Charges, Consumables, Total</td>
          <td>System calculates estimated cost. Customer must authorize estimate before repairs commence.</td>
        </tr>
      </tbody>
    </table>

    <h2>8.3 Physical A4 Printing &amp; Detachable Gate Pass</h2>
    <div class="callout callout-info avoid-break">
      <b>Official A4 Printout Standards:</b>
      Clicking <strong>"Print Job Card"</strong> opens the official A4 document designed specifically for workshop clipboards:
      <ul>
        <li>Includes official Gurudev Motors Header with complete address and contact details.</li>
        <li>Contains signature blocks for Service Advisor, Supervisor, Technician, and Customer Authorization.</li>
        <li>Includes detachable bottom section: <strong>"CUSTOMER COPY / GATE PASS"</strong> with workshop timings (10:00 AM to 7:00 PM, Lunch 1:00 PM to 2:00 PM, Sunday 10:00 AM to 5:00 PM).</li>
      </ul>
    </div>

    <h2>8.4 One-Click WhatsApp Sharing</h2>
    <p>
      Clicking <strong>"Share via WhatsApp"</strong> prepares an automated, formatted message sent directly to the customer's phone containing vehicle model, registration, job card number, estimated cost, and expected delivery time.
    </p>
  </div>

  <!-- ==================== CHAPTER 9 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 9: INVOICING &amp; ACCOUNTS</span>
    </div>

    <h1>
      <span>Invoicing, Billing &amp; Collections</span>
      <span class="chapter-no">CHAPTER 9</span>
    </h1>

    <h2>9.1 Invoice Issuance Rules</h2>
    <p>
      No vehicle or repaired motorcycle may leave the dealership premises without an authorized tax invoice or cashier gate pass.
    </p>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">1</span>
        <span class="step-title">Workshop Service Invoice</span>
      </div>
      <p>
        Upon job card completion, convert the finalized job card items into a tax invoice. Parts charges must reflect genuine manufacturer MRP; labour charges must follow dealership standard labour schedule.
      </p>
    </div>

    <div class="step-box avoid-break">
      <div class="step-header">
        <span class="step-badge">2</span>
        <span class="step-title">Vehicle Sales Invoice</span>
      </div>
      <p>
        Generated upon receipt of full payment (Cash/UPI/Bank Transfer + Bank Loan DO). Specifies engine number, frame number, battery serial number, helmet issuance, and road tax details.
      </p>
    </div>

    <h2>9.2 Payment Methods &amp; Reconciliation</h2>
    <table class="avoid-break">
      <thead>
        <tr>
          <th>Payment Method</th>
          <th>Verification Procedure</th>
          <th>Receipt Protocol</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Cash</strong></td>
          <td>Verified using counterfeit detection machine by cashier.</td>
          <td>Issue printed cash receipt immediately. Maximum cash transaction as per Income Tax limits.</td>
        </tr>
        <tr>
          <td><strong>UPI / QR Code</strong></td>
          <td>Verify transaction ID and green tick on official showroom soundbox.</td>
          <td>Record UTR number in invoice payment notes.</td>
        </tr>
        <tr>
          <td><strong>Credit / Debit Card</strong></td>
          <td>Swipe on authorized POS terminal; verify customer slip.</td>
          <td>Attach POS merchant copy to showroom invoice copy.</td>
        </tr>
        <tr>
          <td><strong>Bank Finance DO</strong></td>
          <td>Verify original Delivery Order with bank officer signature.</td>
          <td>Submit invoice and RC documentation to bank for disbursement release.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== CHAPTER 10 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 10: REPORTS &amp; EXPORT</span>
    </div>

    <h1>
      <span>Dealership Reports &amp; Analytics</span>
      <span class="chapter-no">CHAPTER 10</span>
    </h1>

    <h2>10.1 Management Reporting Modules</h2>
    <p>
      Located in <strong>Admin &gt; Reports &amp; Analytics</strong>, management can track dealership health in real time:
    </p>

    <table class="avoid-break">
      <thead>
        <tr>
          <th>Report Module</th>
          <th>Key Metrics Tracked</th>
          <th>Export Options</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Executive Overview</strong></td>
          <td>Total Revenue, Units Sold, Active Job Cards, Conversion Rate, Overdue Follow-ups.</td>
          <td>A4 Printable PDF, Email Share</td>
        </tr>
        <tr>
          <td><strong>Sales &amp; Delivery</strong></td>
          <td>Vehicle-wise sales volume, brand breakdown (Hero, Honda, TVS, etc.), sales executive performance.</td>
          <td>CSV Spreadsheet, A4 PDF</td>
        </tr>
        <tr>
          <td><strong>Workshop &amp; Service</strong></td>
          <td>Job card turnaround time, labour revenue, spare parts sales, free service coupon tallies.</td>
          <td>CSV Spreadsheet, A4 PDF</td>
        </tr>
        <tr>
          <td><strong>CRM Follow-up Health</strong></td>
          <td>Lead response time, overdue follow-up count per executive, lost enquiry reasons.</td>
          <td>CSV Spreadsheet</td>
        </tr>
        <tr>
          <td><strong>Inventory Aging</strong></td>
          <td>Days in stock, slow-moving models, fast-selling colour variants.</td>
          <td>CSV Spreadsheet</td>
        </tr>
      </tbody>
    </table>

    <h2>10.2 Clean A4 PDF Report Printing</h2>
    <p>
      Clicking <strong>"Print Report"</strong> prints an official A4 document with the Gurudev Motors logo, date range header, formatted summary tables, and executive signature block.
    </p>
  </div>

  <!-- ==================== CHAPTER 11 ==================== -->
  <div class="page-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 11: ADMIN &amp; GOVERNANCE</span>
    </div>

    <h1>
      <span>Admin Governance &amp; Security</span>
      <span class="chapter-no">CHAPTER 11</span>
    </h1>

    <h2>11.1 Creating New User Roles</h2>
    <p>
      The Main Admin can create bespoke roles in <strong>Admin &gt; Roles &amp; Permissions</strong>:
    </p>
    <ol>
      <li>Click <strong>"Create New Role"</strong>.</li>
      <li>Enter Role Name (e.g. <em>Senior Inventory Auditor</em>) and Role Code.</li>
      <li>Toggle permissions for each module: <strong>View</strong>, <strong>Create</strong>, <strong>Edit</strong>, <strong>Delete</strong>.</li>
      <li>Click <strong>"Save Role"</strong>. The new role immediately appears in the employee assignment dropdown.</li>
    </ol>

    <h2>11.2 Audit Logging Standard</h2>
    <p>
      Every critical system action is permanently preserved in <strong>Admin &gt; Audit Logs</strong>:
    </p>
    <ul>
      <li><strong>User Identity:</strong> Email and staff name who performed the action.</li>
      <li><strong>Timestamp:</strong> Exact date and time down to the second.</li>
      <li><strong>Module &amp; Action:</strong> e.g., <code>LEADS: UPDATE</code>, <code>SERVICE: CREATE</code>.</li>
      <li><strong>Change Delta:</strong> Records previous value versus updated value.</li>
    </ul>

    <h2>11.3 Password &amp; Session Security</h2>
    <div class="callout callout-warning avoid-break">
      <b>Security Policies:</b>
      <ul>
        <li>Staff accounts must use passwords containing at least 8 characters, an uppercase letter, and a number.</li>
        <li>Sessions automatically expire upon inactivity; staff must click <strong>"Sign Out"</strong> before leaving workstations.</li>
        <li>Never store customer Aadhar or banking documents on personal mobile devices.</li>
      </ul>
    </div>
  </div>

  <!-- ==================== CHAPTER 12 ==================== -->
  <div class="avoid-break">
    <div class="doc-header">
      <span>GURUDEV MOTORS • SOP MANUAL</span>
      <span>CHAPTER 12: DAILY CHECKLISTS</span>
    </div>

    <h1>
      <span>Daily Operational Checklists</span>
      <span class="chapter-no">CHAPTER 12</span>
    </h1>

    <h2>12.1 Morning Opening Checklist (09:45 AM)</h2>
    <table class="avoid-break">
      <thead>
        <tr>
          <th>Department</th>
          <th>Action Item</th>
          <th>Responsible Person</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Showroom Floor</strong></td>
          <td>Inspect display vehicles, ensure clean dust-free bikes, verify price placards.</td>
          <td>Floor Incharge</td>
        </tr>
        <tr>
          <td><strong>Sales Team</strong></td>
          <td>Log in to Admin CRM; filter <strong>Due Today</strong> and <strong>Overdue</strong> follow-ups; plan outbound calls.</td>
          <td>Sales Executives</td>
        </tr>
        <tr>
          <td><strong>Workshop</strong></td>
          <td>Check bay tools, air compressor pressure, test ride helmets, print pending job cards.</td>
          <td>Service Manager</td>
        </tr>
        <tr>
          <td><strong>Accounts Desk</strong></td>
          <td>Verify POS terminals, receipt printer paper rolls, cash float balance.</td>
          <td>Showroom Cashier</td>
        </tr>
      </tbody>
    </table>

    <h2>12.2 Evening Closing Checklist (07:15 PM)</h2>
    <table class="avoid-break">
      <thead>
        <tr>
          <th>Department</th>
          <th>Action Item</th>
          <th>Responsible Person</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Sales &amp; CRM</strong></td>
          <td>Ensure every customer interaction has a logged follow-up with future next date. Zero unlogged leads.</td>
          <td>Sales Manager</td>
        </tr>
        <tr>
          <td><strong>Workshop Gate</strong></td>
          <td>Tally delivered vehicles against signed Customer Gate Passes. Secure overnight vehicles inside bay.</td>
          <td>Service Advisor</td>
        </tr>
        <tr>
          <td><strong>Cash Counter</strong></td>
          <td>Tally daily physical cash, UPI settlement, and card slips against Accounts Report. Submit daily envelope to locker.</td>
          <td>Accounts Officer</td>
        </tr>
        <tr>
          <td><strong>System Admin</strong></td>
          <td>Verify all staff logged out; review high-priority audit logs.</td>
          <td>Main Admin</td>
        </tr>
      </tbody>
    </table>

    <h2>12.3 Emergency Escalation Matrix</h2>
    <p>
      For urgent operational bottlenecks, staff should contact the designated hierarchy:
    </p>
    <ul>
      <li><strong>Customer Escalations &amp; Delivery Delays:</strong> Showroom Manager (+91 7000619808)</li>
      <li><strong>Technical Service &amp; Warranty Disputes:</strong> Workshop Head (+91 7000619808)</li>
      <li><strong>Software, System Access &amp; Role Permissions:</strong> System Administrator</li>
    </ul>

    <div style="margin-top: 35px; border-top: 2px solid #0b192c; padding-top: 20px;" class="avoid-break">
      <div style="display: flex; justify-content: space-between; text-align: center; font-size: 9pt;">
        <div style="width: 30%;">
          <div style="height: 40px; border-bottom: 1px dashed #94a3b8; margin-bottom: 5px;"></div>
          <b>Prepared By:</b><br/>Operations Lead
        </div>
        <div style="width: 30%;">
          <div style="height: 40px; border-bottom: 1px dashed #94a3b8; margin-bottom: 5px;"></div>
          <b>Reviewed By:</b><br/>General Manager
        </div>
        <div style="width: 30%;">
          <div style="height: 40px; border-bottom: 1px dashed #94a3b8; margin-bottom: 5px;"></div>
          <b>Approved By:</b><br/>Director, Gurudev Motors
        </div>
      </div>
    </div>
  </div>

</body>
</html>
`;

const tempHtmlPath = path.join(process.cwd(), 'temp_sop_manual.html');
const outputPdfPath = path.join(process.cwd(), 'public', 'documents', 'Gurudev_Motors_Complete_SOP_Manual.pdf');

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const selectedBrowser = chromeCandidates.find((c) => fs.existsSync(c));

if (!selectedBrowser) {
  console.error('No suitable browser (Chrome/Edge) found for PDF generation.');
  process.exit(1);
}

console.log(`Using browser: ${selectedBrowser}`);
console.log(`Generating PDF from HTML at: ${tempHtmlPath}`);

try {
  const cmd = `"${selectedBrowser}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "${tempHtmlPath}"`;
  execSync(cmd, { stdio: 'inherit' });

  if (fs.existsSync(outputPdfPath)) {
    const stats = fs.statSync(outputPdfPath);
    console.log(`SUCCESS: Generated PDF at ${outputPdfPath} (${stats.size} bytes)`);
    // Cleanup temp HTML
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  } else {
    console.error('PDF file was not created.');
    process.exit(1);
  }
} catch (err) {
  console.error('Error generating PDF:', err);
  process.exit(1);
}
