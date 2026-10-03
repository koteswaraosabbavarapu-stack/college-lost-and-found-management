# 🎓 CampusTrack — College Lost & Found Management System

A complete, fully functional, production-ready full-stack web application designed for college campuses to centralize, track, match, verify, and recover lost and found items securely.

---

## 🌟 Key Features

### 1. 👥 Multi-Role Authorization & Security
* **Student / College User**: Report lost items, search registry, view details, submit ownership verification claims, track recovery progress, manage profile, receive real-time notifications.
* **Security Staff**: Custody intake registry, pending claims verification queue, cross-check claimant answers against hidden physical marks, approve/reject claims, execute physical handovers with College ID verification.
* **Administrator**: Live dashboard analytics, interactive charts (Lost vs Found, category breakdowns, monthly trends, recovery rate), user management & role elevation, category management, immutable security audit logs.

### 2. ⚡ Explainable Rule-Based Matching Engine
When a lost or found item is reported, CampusTrack automatically calculates a transparent confidence match score:
* **Category Match**: +30 points
* **Brand Similarity**: +20 points
* **Color Match**: +15 points
* **Location Proximity**: +15 points
* **Date Proximity (within 24h - 10d)**: +10 points
* **Keyword Overlap**: +10 points
* **Explainable Breakdown**: Displays exact scoring factors for students and security officers.

### 3. 🔒 Anti-Fraud Ownership Verification Workflow
* **Protected Identifying Details**: Sensitive internal marks, engravings, or contents of found items are concealed from public viewers.
* **Verification Questionnaire**: Claimants must provide unique physical features, hidden compartment contents, and exact loss location.
* **Physical Handover Protocol**: Security officers inspect physical student ID cards and record logbook signatures before final item release.

### 4. 🔔 Real-Time Event-Driven Notifications
* In-app notification bell with live unread badge count.
* Triggered automatically upon high-confidence match detection, claim submission, security review approval/rejection, and handover completion.

### 5. 🛡️ Duplicate Report Prevention
* Live debounced similarity detector warns users if a similar report already exists on campus before submission.

---

## 🏗️ Architecture & Tech Stack

```
USER BROWSER (React 18 + Vite + Tailwind CSS)
      │
      ▼ REST APIs (Axios with JWT Interceptor)
EXPRESS BACKEND (Node.js + REST Router)
      │
      ├── Authentication Middleware (JWT + Bcrypt.js)
      ├── Role Authorization (USER / SECURITY / ADMIN)
      ├── Multer File Upload Engine (5MB, image validation)
      ├── Rule-based Matching Engine
      ├── Audit & Notification Triggers
      │
      ▼
MONGODB DATABASE (Mongoose ODM / MongoDB Atlas)
```

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons, Chart.js, React-Chartjs-2 |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, Multer, Morgan, Cors, Dotenv |
| **Database** | MongoDB, Mongoose ODM (with seamless embedded fallback for zero-config local run) |

---

## 📁 Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connector with Atlas / local MongoMemoryServer fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me, Profile, Password
│   │   ├── itemController.js     # Search, Filters, Lost/Found Intake, Duplicate Check
│   │   ├── matchController.js    # Explainable Matching Engine API
│   │   ├── claimController.js    # Claim Submission, Review, Handover Lifecycle
│   │   ├── notificationController.js # In-app Notifications & Read State
│   │   ├── adminController.js    # Analytics, User Role Controller, Audit Logs
│   │   ├── categoryController.js # Category Management
│   │   └── uploadController.js   # Image Upload Controller
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer Token Verification
│   │   ├── roleMiddleware.js     # Role-based Guard (USER, SECURITY, ADMIN)
│   │   ├── uploadMiddleware.js   # Multer Disk Storage & Validation
│   │   └── errorMiddleware.js    # Global Error & 404 Handlers
│   ├── models/
│   │   ├── User.js               # User Model with Bcrypt Pre-Save
│   │   ├── Item.js               # Item Model (LOST/FOUND, Status Lifecycle, History)
│   │   ├── Claim.js              # Claim Model (Verification Answers, Handover Audit)
│   │   ├── Notification.js       # Notification Model
│   │   ├── Category.js           # Item Categories
│   │   └── AuditLog.js           # Security Audit Trail
│   ├── routes/                   # Express REST Route Handlers
│   ├── services/
│   │   ├── matchingService.js    # 100-Point Rule Matching Algorithm
│   │   ├── notificationService.js# Event Notification Triggers
│   │   └── auditService.js       # Activity Logging Service
│   ├── seed/
│   │   └── seedData.js           # Comprehensive Seed Script
│   ├── uploads/                  # Uploaded Item & Proof Images
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, StatusBadge, MatchScoreBadge, Spinner, EmptyState
│   │   │   ├── items/            # ItemCard, ItemFilters, DuplicateWarning
│   │   │   └── claims/           # ClaimModal, ClaimReviewModal, HandoverModal
│   │   ├── context/              # AuthContext, NotificationContext
│   │   ├── hooks/                # useDebounce, useAuth, useNotifications
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Hero, Live Counters, How It Works, FAQs
│   │   │   ├── Login.jsx         # Login + 1-Click Demo Accounts Switcher
│   │   │   ├── Register.jsx      # Registration + Password Strength
│   │   │   ├── SearchItems.jsx   # Search & Multi-criteria Filters
│   │   │   ├── ItemDetails.jsx   # Item Profile, Matches Drawer, Claim Launcher
│   │   │   ├── ReportLost.jsx    # Report Lost Item + Live Duplicate Alert
│   │   │   ├── ReportFound.jsx   # Report Found Item + Safe Custody Intake
│   │   │   ├── UserDashboard.jsx # Student Dashboard & Claim Status Tracking
│   │   │   ├── SecurityDashboard.jsx # Security Claims Review & Handover Desk
│   │   │   ├── AdminDashboard.jsx# Charts Analytics, User Roles, Audit Logs
│   │   │   ├── NotificationsPage.jsx # Notifications Center
│   │   │   ├── ProfilePage.jsx   # User Profile & Password Change
│   │   │   └── NotFound.jsx      # 404 Page
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx# Frontend Route Guard
│   │   ├── services/             # Centralized API Domain Services
│   │   ├── utils/                # Date Formatters & Helpers
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🔑 Demo Accounts (Ready to Test)

The seed script initializes accounts for all 3 user roles:

| Role | Email | Password | Description |
|---|---|---|---|
| **Student** | `student@college.edu` | `password123` | Rahul Sharma (CS-2024-042) |
| **Student 2** | `ananya@college.edu` | `password123` | Ananya Patel (EC-2024-118) |
| **Security Staff** | `security@college.edu` | `password123` | Chief Officer Vikram Rao (SEC-07) |
| **Administrator** | `admin@college.edu` | `password123` | Dr. Meera Sen (ADM-9901) |

> 💡 **Quick Login**: The Login page features **1-Click Quick Login Buttons** for instant evaluation of all roles!

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
* **Node.js** v18+ installed

### 2. Backend Setup
```bash
cd backend
npm install
node seed/seedData.js   # Seeds demo users, items, claims & categories
npm run dev             # Starts API server on http://localhost:5000
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev             # Starts UI on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🌐 REST API Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a college account
* `POST /api/auth/login` — Authenticate & receive JWT
* `GET /api/auth/me` — Get current user profile & metrics *(Protected)*
* `PUT /api/auth/profile` — Update name, phone, department *(Protected)*
* `PUT /api/auth/change-password` — Change password *(Protected)*

### 📦 Lost & Found Items (`/api/items`)
* `GET /api/items` — Search items with filters (type, category, location, date, status, search keyword)
* `GET /api/items/:id` — Get item details with privacy sanitization
* `POST /api/items/lost` — Report lost item *(Protected)*
* `POST /api/items/found` — Report found item *(Protected)*
* `POST /api/items/check-duplicate` — Check duplicate similarity
* `PUT /api/items/:id` — Update item *(Owner / Security / Admin)*
* `DELETE /api/items/:id` — Delete item *(Owner / Admin)*

### ⚡ Item Matching (`/api/matches`)
* `GET /api/matches/:id/matches` — Compute explainable match score & breakdown for an item

### 🛡️ Claims & Verification (`/api/claims`)
* `POST /api/claims` — Submit ownership verification claim *(Protected)*
* `GET /api/claims/my` — Get claimant's submitted claims *(Protected)*
* `GET /api/claims` — Get all claims *(Security / Admin)*
* `GET /api/claims/:id` — Get claim details *(Protected)*
* `PUT /api/claims/:id/approve` — Approve claim *(Security / Admin)*
* `PUT /api/claims/:id/reject` — Reject claim *(Security / Admin)*
* `PUT /api/claims/:id/complete` — Mark physical handover completed *(Security / Admin)*

### 🔔 Notifications (`/api/notifications`)
* `GET /api/notifications` — Get user alerts & unread count *(Protected)*
* `PUT /api/notifications/:id/read` — Mark alert as read *(Protected)*
* `PUT /api/notifications/read-all` — Mark all alerts as read *(Protected)*

### 👑 Administration (`/api/admin`)
* `GET /api/admin/statistics` — Real database metrics & chart series *(Security / Admin)*
* `GET /api/admin/users` — List all registered users *(Admin)*
* `PUT /api/admin/users/:id` — Change user role or status *(Admin)*
* `DELETE /api/admin/users/:id` — Remove user account *(Admin)*
* `GET /api/admin/audit-logs` — Fetch immutable security audit logs *(Admin)*

### 🏷️ Categories (`/api/categories`)
* `GET /api/categories` — List active categories
* `POST /api/categories` — Create category *(Admin)*
* `PUT /api/categories/:id` — Update category *(Admin)*
* `DELETE /api/categories/:id` — Delete category *(Admin)*

### 📷 Uploads (`/api/upload`)
* `POST /api/upload` — Upload item / proof image (5MB limit, JPEG/PNG/WEBP) *(Protected)*

---

## ⚙️ Environment Variables

### Backend (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/college_lost_found
JWT_SECRET=super_secure_jwt_secret_college_lost_found_2026_key_!@#
CLIENT_URL=http://localhost:5173
NODE_ENV=development
UPLOAD_PATH=uploads
```

---

## 🚢 Production Deployment

### 1. Database (MongoDB Atlas)
* Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
* Get your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/college_lost_found`.
* Set `MONGO_URI` in your production backend environment.

### 2. Backend (Render / Railway / Heroku)
* Root Directory: `backend`
* Build Command: `npm install`
* Start Command: `npm start`
* Set Environment Variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.

### 3. Frontend (Vercel / Netlify)
* Root Directory: `frontend`
* Build Command: `npm run build`
* Output Directory: `dist`
* Proxy or Base URL: Set `VITE_API_BASE_URL` to your production backend URL.

---

## 📄 License
Designed and developed for College Campus Operations & Student Welfare.
