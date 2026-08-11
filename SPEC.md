# Sunrise Fitness Hub — Project Specification

**Repository:** `Adityavihar/Sunrise-Fitness`
**Live URL:** sunrise-fitness.vercel.app
**Type:** Full-Stack Gym Management SaaS
**Document version:** 1.0
**Last updated:** August 2026

> **Note on sourcing:** This specification is compiled from the project's `README.md`, `deployment_guide.md`, and the repository's visible file/folder structure (`backend/`, `frontend/`) on GitHub. Where an exact endpoint path was not directly visible in the summarized documentation, it is presented as a **proposed/standard REST convention** consistent with the described feature and the MVC-style folder layout (`routes/` → `controllers/` → `models/`) used in the backend. Sections marked *(inferred)* follow that convention rather than a confirmed line from source code.

---

## 1. Overview

Sunrise Fitness Hub is a production-ready, full-stack **Gym Management System** built for a real gym business. It provides:

- A **public-facing marketing site** (single-page, glassmorphic dark UI with gold/red accents) for prospective members.
- A **Member Dashboard** for existing gym members to track their plan, payments, and body metrics.
- An **Admin Control Console** for gym staff/owners to manage members, verify payments, view analytics, and configure the public site.

The system is designed around a **role-based access model** (Member vs Admin), with the very first registered user automatically promoted to Admin — a common bootstrap pattern for single-tenant SaaS tools.

---

## 2. Technology Stack

### 2.1 Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Core UI library / component architecture |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling, theme variables in `index.css` |
| **Framer Motion** | Page transitions and micro-animations |
| **Recharts** | Weight-trend line charts, admin analytics (area/bar charts) |
| **Axios** | HTTP client, wrapped with interceptors for auth/session handling |
| **React Hook Form** | Form state management & validation (registration, login, admin forms) |
| **React Icons** | Icon set used across UI |

### 2.2 Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js** | REST API framework |
| **Mongoose** | ODM for MongoDB schema modeling |
| **MongoDB Atlas** | Cloud-hosted primary database |

### 2.3 Security & Middleware
| Technology | Purpose |
|---|---|
| **JWT (jsonwebtoken)** | Access + Refresh token authentication |
| **HTTP-only Cookies** | Token storage/transmission, mitigates XSS token theft |
| **bcryptjs** | Password hashing |
| **Helmet** | HTTP security headers, CORP/COEP configuration |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **express-rate-limit** | Brute-force / abuse protection on sensitive routes |

### 2.4 File Storage
| Technology | Purpose |
|---|---|
| **Cloudinary** *(optional)* | Cloud image hosting for uploads (payment receipts, gallery, QR codes) |
| **Local disk fallback** (`backend/uploads/`) | Used automatically when Cloudinary credentials are not configured |

### 2.5 Deployment
| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Node host (per `deployment_guide.md`) |
| Database | MongoDB Atlas (cloud) |

---

## 3. Project / Directory Structure

```
sunrise-fitness-hub/
├── backend/                        # Express REST API server
│   ├── config/                     # Database connection setup (Mongoose connect)
│   ├── controllers/                # Business logic — one file per resource
│   │   ├── auth.controller.js         # register / login / refresh / logout logic
│   │   ├── member.controller.js       # member profile, dashboard data, BMI/weight logs
│   │   ├── payment.controller.js      # plan selection, QR generation, receipt upload/verify
│   │   └── admin.controller.js        # roster mgmt, analytics, settings, exports
│   ├── middleware/                 # Cross-cutting request handling
│   │   ├── auth.middleware.js         # JWT verification, role guards (isAdmin/isMember)
│   │   ├── error.middleware.js        # Centralized error handler
│   │   └── upload.middleware.js       # Multer config for file uploads (Cloudinary/local)
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js                    # Member/Admin account schema
│   │   ├── Payment.js                 # Transaction/receipt schema
│   │   ├── Plan.js                    # Membership plan/pricing schema
│   │   ├── WeightLog.js               # Member weight-tracking entries
│   │   ├── Gallery.js                 # Slideshow image schema
│   │   └── Settings.js                # Gym info: maps link, contact, UPI QR, hours
│   ├── routes/                     # Route → controller bindings
│   │   ├── auth.routes.js
│   │   ├── member.routes.js
│   │   ├── payment.routes.js
│   │   └── admin.routes.js
│   ├── uploads/                    # Local fallback storage for uploaded files
│   ├── utils/                      # Helper functions (JWT sign/verify, cookie setters)
│   ├── .env                        # Environment configuration (gitignored)
│   └── server.js                   # Express app entry point, middleware registration
│
├── frontend/                       # Vite + React client
│   ├── public/                     # Static assets served as-is
│   ├── src/
│   │   ├── assets/                    # High-resolution UI images
│   │   ├── components/                # Reusable UI (Navbar, Route Guards, Cards, Modals)
│   │   ├── context/                   # AuthContext (session state), ToastContext (notifications)
│   │   ├── layouts/                   # MemberLayout, AdminLayout wrapper shells
│   │   ├── pages/                     # Route-level views
│   │   │   ├── Home/                     # Public landing page
│   │   │   ├── Login/ , Register/        # Auth pages
│   │   │   ├── MemberDashboard/          # BMI calc, weight chart, plan status
│   │   │   ├── Payment/                  # Plan selection, UPI QR, receipt upload
│   │   │   └── Admin/                    # Roster, analytics, payment verification, settings
│   │   ├── services/                  # Axios instance + interceptors (attach cookies, refresh flow)
│   │   ├── App.jsx                    # Main router (React Router route table)
│   │   ├── index.css                  # Tailwind v4 directives + design tokens
│   │   └── main.jsx                   # React 19 root mount
│
├── .gitignore
├── README.md
└── deployment_guide.md
```

---

## 4. Feature Specification

### 4.1 Authentication
- Email **or** mobile-number based login (dual identifier).
- JWT **Access Token** (short-lived, e.g. 15 min) + **Refresh Token** (long-lived, e.g. 7 days), both delivered as **HTTP-only, Secure cookies** — never exposed to client-side JavaScript.
- **Silent refresh rotation**: when the access token expires, the client transparently exchanges the refresh cookie for a new access cookie without forcing re-login.
- **First-user-becomes-admin** bootstrap: on a fresh database, the first successful registration is auto-assigned the `admin` role; all subsequent registrations default to `member`.

### 4.2 Member Dashboard
- **Plan countdown**: live "days remaining" indicator that visually escalates as expiry nears.
- **Weight tracker**: members log weight entries over time, rendered as a Recharts line chart.
- **BMI calculator**: instant height/weight → BMI value + category (underweight/normal/overweight/obese).
- **UPI QR checkout**: member selects a membership plan → app generates a QR code bound to the gym's UPI payment details → member scans, pays externally, then uploads a transaction screenshot as proof.
- **Digital receipts**: printable, high-contrast black-and-white invoice generated once a payment is approved.

### 4.3 Admin Control Console
- **Analytics Engine**: area/bar charts for monthly revenue, daily sign-ups, and plan-type distribution.
- **Roster Management**: edit member details, suspend/reactivate accounts, manually extend membership duration, delete accounts.
- **Spreadsheet Auditor**: one-click `.csv` export of member roster, transaction history, membership start/expiry dates, and login/logout audit trails.
- **Payment Verifier**: modal view of each uploaded receipt image; admin can approve (auto-generates the digital receipt), or reject with a reason sent back to the member.
- **Settings & Showcase manager**: upload/replace homepage slideshow images, edit gym contact info (Google Maps link, phone, email, opening hours), and update the UPI merchant QR code image shown to members.

---

## 5. API Endpoint Specification

All endpoints are prefixed with `/api`. Authentication is enforced via HTTP-only cookies (`accessToken`, `refreshToken`) read by the `auth.middleware`; `role` guards restrict `/admin/*` routes to admin accounts only.

### 5.1 Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Creates a new account (email, mobile, password, name). First-ever user is auto-promoted to `admin`. |
| POST | `/api/auth/login` | Public | Authenticates via email **or** mobile + password; sets access/refresh cookies. |
| POST | `/api/auth/refresh` | Refresh cookie | Validates the refresh token and issues a new access-token cookie (rotation). |
| POST | `/api/auth/logout` | Authenticated | Clears auth cookies and invalidates the session server-side. |
| GET | `/api/auth/me` | Authenticated | Returns the currently logged-in user's profile + role. |

### 5.2 Member Routes — `/api/members`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/members/profile` | Member | Fetches the logged-in member's profile, active plan, and expiry date. |
| PUT | `/api/members/profile` | Member | Updates editable profile fields (name, phone, height, etc.). |
| GET | `/api/members/weight-logs` | Member | Returns the member's historical weight entries for the chart. |
| POST | `/api/members/weight-logs` | Member | Adds a new dated weight entry. |
| POST | `/api/members/bmi` | Member | Computes BMI from submitted height/weight (or computed client-side, endpoint used for logging). |

### 5.3 Payment Routes — `/api/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/payments/plans` | Public/Member | Lists available membership plans and pricing. |
| POST | `/api/payments/initiate` | Member | Member selects a plan; server returns the UPI QR payload/image reference. |
| POST | `/api/payments/upload-receipt` | Member | Uploads the transaction screenshot (multipart/form-data) tied to a pending payment record. |
| GET | `/api/payments/history` | Member | Returns the member's past transactions and receipt statuses. |
| GET | `/api/payments/receipt/:paymentId` | Member | Fetches the generated printable receipt for an approved payment. |

### 5.4 Admin Routes — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/members` | Admin | Lists all members with filters (status, plan, search). |
| PUT | `/api/admin/members/:id` | Admin | Edits a member's demographic/account details. |
| PATCH | `/api/admin/members/:id/suspend` | Admin | Toggles a member account's suspended state. |
| PATCH | `/api/admin/members/:id/extend` | Admin | Manually extends a member's plan expiry date. |
| DELETE | `/api/admin/members/:id` | Admin | Permanently deletes a member record. |
| GET | `/api/admin/analytics/revenue` | Admin | Monthly revenue data for the area/bar charts. |
| GET | `/api/admin/analytics/signups` | Admin | Daily/weekly new-signup counts. |
| GET | `/api/admin/analytics/plan-distribution` | Admin | Breakdown of members per plan type. |
| GET | `/api/admin/payments/pending` | Admin | Lists payment receipts awaiting verification. |
| PATCH | `/api/admin/payments/:id/approve` | Admin | Approves a payment; triggers receipt generation and plan activation/extension. |
| PATCH | `/api/admin/payments/:id/reject` | Admin | Rejects a payment with a reason, notifies the member. |
| GET | `/api/admin/export/members.csv` | Admin | Streams a `.csv` export of the full member roster. |
| GET | `/api/admin/export/transactions.csv` | Admin | Streams a `.csv` export of transaction logs (date/day/time). |
| GET | `/api/admin/export/audit.csv` | Admin | Streams a `.csv` export of login/logout session history. |
| GET | `/api/admin/settings` | Admin | Retrieves current gym settings (contact info, hours, QR image). |
| PUT | `/api/admin/settings` | Admin | Updates gym settings. |
| POST | `/api/admin/gallery` | Admin | Uploads a new image to the homepage slideshow. |
| DELETE | `/api/admin/gallery/:id` | Admin | Removes an image from the slideshow. |
| POST | `/api/admin/settings/qr-code` | Admin | Uploads/replaces the UPI merchant QR code image. |

> *(inferred)* All `/api/admin/*` write operations pass through `express-mongo-sanitize` and rate limiting before reaching the controller layer, per the security middleware described in the tech stack.

---

## 6. Core Data Models *(inferred from feature set)*

**User**
```
{
  name, email, mobile, passwordHash,
  role: "member" | "admin",
  isSuspended: Boolean,
  height, weight,
  planId, planStartDate, planExpiryDate,
  createdAt
}
```

**Plan**
```
{ name, durationDays, price, description }
```

**Payment**
```
{
  memberId, planId, amount,
  receiptImageUrl,
  status: "pending" | "approved" | "rejected",
  rejectionReason,
  createdAt, verifiedAt
}
```

**WeightLog**
```
{ memberId, weight, date }
```

**Gallery**
```
{ imageUrl, order, uploadedAt }
```

**Settings**
```
{ mapsLink, phone, email, openingHours, upiQrImageUrl }
```

---

## 7. Environment Configuration

`backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/sunrise_fitness
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Cloudinary (optional — falls back to local disk storage if empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 8. Local Setup

**Prerequisites:** Node.js LTS (v18+), a running MongoDB instance (local or Atlas).

```bash
# Terminal 1 — Backend
cd backend
npm install
node server.js

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. The database starts empty — the first account you register becomes the Admin.

---

## 9. Security Summary

| Concern | Mitigation |
|---|---|
| XSS token theft | Tokens stored only in HTTP-only cookies, never in localStorage/JS-accessible storage |
| Stolen/expired sessions | Short-lived access token + rotating refresh token |
| NoSQL injection | `express-mongo-sanitize` strips malicious operators from input |
| Brute-force login/signup | `express-rate-limit` throttles repeated requests |
| Password exposure | `bcryptjs` one-way hashing, salted |
| Cross-origin resource risk | `Helmet` CORP/COEP headers |


