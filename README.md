# Sunrise Fitness Hub - Full-Stack Gym Management SaaS

Sunrise Fitness Hub is a production-ready, highly secure, full-stack Gym Management application. Built using a premium dark aesthetic with gold accents, red action details, and modern glassmorphic layouts, it provides a seamless single-page experience for public users and detailed private workspaces for members and administrators.

---

## 🚀 Key Features

### 🔒 Secure Authentication
* **HTTP-Only Cookies**: JWT Access and Refresh tokens are transmitted exclusively via secure HTTP-only cookies to eliminate XSS token theft vectors.
* **Rotation Policy**: Implements automatic Refresh Token rotation, seamlessly issuing new access cookies behind the scenes.
* **Dual Login Options**: Members can log in securely using either their **Email** or **Mobile Phone Number**.

### 👤 Member Dashboard
* **Dynamic Counters**: Days remaining counter alerts the member when their plan is nearing expiration.
* **Log Metrics**: Built-in weight trackers that log and chart changes over time using Recharts lines.
* **BMI Calculator**: Interactive height and weight inputs with instant BMI categorization.
* **UPI QR checkout**: Members select a plan and receive an interactive QR Code (linked to the gym's payment coordinates) to scan and upload their transaction receipts.
* **Digital Receipts**: High-resolution, black-and-white, print-friendly invoice receipts for approved payments.

### 👑 Admin Control Console
* **Analytics Engine**: Area and Bar charts displaying monthly revenues, daily client signups, and subscription distributions.
* **Roster Management**: Edit member demographics, toggle account suspensions, extend access manually, and delete account records.
* **Spreadsheet Auditor**: Prominent export triggers that compile complete member rosters, transaction logs (date/day/time), start/expiry schedules, and user session (login/logout) audit histories into Excel-compatible `.csv` files.
* **Payment Verifier**: Modal viewer to inspect user receipt uploads, approve payments, emit receipts, or reject payments with reasoning feedback.
* **Settings & Showcases**: Modifiers to upload pictures to the main slideshow gallery, update coordinates (maps link, mobile, email, opening hours), and upload custom UPI merchant QR code scanner images.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, Axios, React Hook Form, React Icons
* **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM)
* **Database**: MongoDB Atlas (Cloud database)
* **Security Middlewares**: Helmet CORP/COEP config, Mongo Sanitizer (NoSQL injection prevention), Express Rate Limiters, Bcryptjs password hashing

---

## 📦 Directory Structure
```text
sunrise-fitness-hub/
├── backend/                  # Express REST API Server
│   ├── config/               # Database connectors
│   ├── controllers/          # Request-response route handlers
│   ├── middleware/           # Auth, error, and upload controllers
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # API route definitions
│   ├── uploads/              # Local upload fallback storage
│   ├── utils/                # JWT cookie helpers
│   ├── .env                  # Configuration variables (gitignored)
│   └── server.js             # Express application entry point
│
├── frontend/                 # Vite Client Application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # High-resolution UI images
│   │   ├── components/       # Reusable components (Navbar, Guards)
│   │   ├── context/          # Auth context and toast notifications
│   │   ├── layouts/          # Member and Admin wrappers
│   │   ├── pages/            # View pages (Dashboard, Admin, Payment)
│   │   ├── services/         # Axios interceptor configurations
│   │   ├── App.jsx           # Main routing table
│   │   ├── index.css         # Tailwind v4 directives and theme variables
│   │   └── main.jsx          # React 19 mounting root
│
└── .gitignore                # Root gitignore rules
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js**: LTS version (v18+)
- **MongoDB**: Active local instance or a remote MongoDB Atlas cluster connection string.

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sunrise_fitness
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Cloudinary (Optional - uploads will fallback to local storage if empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Setup and Run
Open two terminal windows:

#### Window 1: Start Backend API
```bash
cd backend
npm install
node server.js
```

#### Window 2: Start Frontend client
```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser to view the application.

*Note: Since the database is blank at startup, the very first user who registers through the registration form will automatically be assigned the **Admin** role.*
