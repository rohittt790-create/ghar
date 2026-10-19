# ghar

## KAILASH BHAWAN – Home Owner & Construction Management System

A complete, responsive, full-stack web application built to manage house owners, property sites, construction progress, completed and pending work, task timelines, automated reminders, a monthly calendar, and real-time monthly reports with PDF export.

---

## 🌟 Key Features

### 1. Owner & Property Management
- **House Owners Directory**: Store owner full name, phone number, email, address, profile photo, emergency contacts, and personal preferences.
- **Multiple Properties**: Full support for multiple owners and multiple properties per owner.
- **Property Sites**: Store site address, property ID (e.g. `PROP-101`), start date, expected completion date, square footage, property type (Villa, Residential, Renovation, etc.), estimated budget, actual expenses, and multiple site photos.
- **Search & Filter**: Real-time search across owners and properties by name, phone, site ID, address, city, and status.

### 2. Construction Work & Task Tracking
- **Multi-Category Task Management**: 16 construction categories (Foundation, Framing, Roofing, Plumbing, Electrical, HVAC, Drywall, Painting, Flooring, Masonry, Carpentry, Landscaping, Inspection, Exterior, Interior Finish, Other).
- **Task Lifecycle**: `Not Started`, `In Progress`, `Completed`, `On Hold`.
- **Progress Photo Documentation**: Upload progress photos tagged by stage (`Before`, `During`, `After`) with captions and before/after comparisons.
- **Work History Log**: Automatic tracking of every state transition, contractor update, and inspector note with timestamps and user attribution.
- **Progress Calculation**: Live progress calculation using completed and weighted in-progress tasks.
- **Overdue Highlighting**: Automatic detection and visual highlighting of tasks past their due date.
- **Kanban & List Views**: Interactive Kanban board with one-click status transitions and table view.

### 3. Construction Calendar
- **Interactive Calendar**: Full month, week, and day views with navigation between months and a quick "Today" jump.
- **Status Indicators**: Color-coded badges for Completed (green), In Progress (blue), Overdue (red), and Not Started (slate).
- **Date Detail Modal**: Click any date to view all tasks scheduled or due on that day.
- **Inline Rescheduling & Completion**: Create, reschedule (change due date), or mark tasks complete directly from the calendar.
- **Property & Status Filtering**: Filter calendar events by project site or workflow status.

### 4. Reminders & Notifications
- **Automated Alerts**: Dashboard notifications for overdue work and milestones approaching within 48 hours.
- **Customizable Reminders**: Configure reminder dates, times, priority levels, and notification types (Deadline, Inspection, Task Due, Payment, General).
- **Delivery Channels**: Web Browser Push Notifications, In-App Notification Center, Email, and WhatsApp.
- **Browser Push Permission**: Native Web Notifications API integration with one-click permission request.
- **Deduplication**: Unique notification keys prevent duplicate alert generation.

### 5. Monthly Reports & Financial Analytics
- **Date & Month Selector**: Generate reports for any selected month and year.
- **Actual Database Data**: Aggregated metrics computed dynamically from saved tasks, properties, and cost records.
- **Executive Summary**: Total tasks, completed, in progress, not started, overdue, progress percentage, estimated budget, actual cost, and cost variance.
- **Interactive Charts (Recharts)**:
  - Planned vs Actual Expenses by Trade Category (Bar Chart).
  - Daily Activity & Completion Trend throughout the month (Line Chart).
- **Photo Records**: Compilation of all site progress photos collected during the selected month with stage tags and captions.
- **Print & PDF Export**: Instant client-side PDF export using `jsPDF` and `jspdf-autotable`, plus printable CSS styles.

### 6. Command Center Dashboard
- **Executive KPI Cards**: Total Owners, Total Properties, Tasks Completed ratio, Overdue Tasks Alert, and Construction Budget vs Spent.
- **Overall Construction Progress Bar**: Real-time aggregated percentage across all active build sites.
- **Overdue Tasks Warning Panel**: Quick complete actions with days overdue badges.
- **Upcoming Deadlines (Next 7 Days)**: Priority badges, due dates, and contractor assignments.
- **Recent Progress Photos**: Live grid of site photos with before/after tags.
- **Recent Activity Stream**: Live feed of task modifications, status updates, and photo uploads.
- **Quick Action Menu**: Instant modal triggers to add a Task, Property, or Owner.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express, TypeScript (`tsx` watch & compile), Mongoose, Multer, JWT, Bcrypt |
| **Database** | MongoDB (v9.0.4 Community Edition) |
| **PDF Export** | jsPDF, jsPDF-AutoTable |
| **Notifications** | HTML5 Web Notifications API, In-App Notification Context |

---

## 📂 Project Architecture

```
/Users/rohitkumar/Desktop/ghar
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB Mongoose connection
│   │   │   └── cloudinary.ts       # Cloudinary setup with local fallback
│   │   ├── models/
│   │   │   ├── User.ts             # Auth & Role-based users
│   │   │   ├── Owner.ts            # Client records & emergency contact
│   │   │   ├── Property.ts         # Property sites, budget & photos
│   │   │   ├── Task.ts             # Tasks, photos (before/after), history
│   │   │   └── Reminder.ts         # Reminders with deduplication key
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── ownerController.ts
│   │   │   ├── propertyController.ts
│   │   │   ├── taskController.ts
│   │   │   ├── reminderController.ts
│   │   │   ├── reportController.ts
│   │   │   └── dashboardController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT auth & role guard
│   │   │   ├── upload.ts           # Multer image storage
│   │   │   └── errorHandler.ts
│   │   ├── routes/                 # Express API routes
│   │   ├── seed/
│   │   │   └── seedData.ts         # Vibrant realistic sample dataset
│   │   └── index.ts                # Express server entry point
│   ├── uploads/                    # Local image storage folder
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Button, Badge, Input, Select, Modal, ProgressBar, StatCard
│   │   │   ├── layout/             # Sidebar, TopHeader, NotificationDropdown
│   │   │   ├── dashboard/          # DashboardView
│   │   │   ├── owners/             # OwnersView, OwnerCard, OwnerFormModal, OwnerDetailModal
│   │   │   ├── properties/         # PropertiesView, PropertyCard, PropertyFormModal, PropertyDetailView
│   │   │   ├── tasks/              # TasksView, TaskKanbanBoard, TaskFormModal, TaskDetailModal
│   │   │   ├── calendar/           # CalendarView (Month, Week, Day views)
│   │   │   ├── reminders/          # RemindersView, ReminderFormModal
│   │   │   └── reports/            # ReportsView (Recharts, Table, PDF export)
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   ├── services/
│   │   │   └── api.ts              # Typed Axios client
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript definitions
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── exportPdf.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── package.json                    # Root workspace runner
└── README.md
```

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- **Node.js**: v18+ (verified on v26)
- **MongoDB**: Local MongoDB or MongoDB Atlas URI

### 2. Environment Variables Configuration
The server expects a `.env` file in `server/.env`:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/hometrack
JWT_SECRET=hometrack_super_secure_jwt_secret_key_2026_dev
NODE_ENV=development

# Optional: Cloudinary credentials (automatically falls back to local disk storage if left empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Seed Database with Realistic Data
Run the comprehensive seed script to populate realistic owners, properties, tasks across multiple trades with before/after photos, and reminders:

```bash
cd server
npm run seed
```

### 4. Running the Application
From the root workspace directory, start both the frontend and backend concurrently:

```bash
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1: Backend API (Port 5001)
cd server
npm run dev

# Terminal 2: Frontend App (Port 3000)
cd client
npm run dev
```

Open your browser to: **`http://localhost:3000`**

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Chief PM (Admin)** | `admin@hometrack.com` | `password123` |
| **Project Manager** | `elena@hometrack.com` | `password123` |
| **Lead Contractor** | `marcus@hometrack.com` | `password123` |

*(The login modal also includes convenient 1-click demo buttons).*

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate and obtain JWT
- `GET /api/auth/me` - Current authenticated user profile
- `GET /api/auth/team` - List construction team members

### House Owners (`/api/owners`)
- `GET /api/owners` - List owners (search by name, phone, city)
- `GET /api/owners/:id` - Owner details with associated properties
- `POST /api/owners` - Create owner with profile picture upload
- `PUT /api/owners/:id` - Update owner information
- `DELETE /api/owners/:id` - Delete owner record

### Properties (`/api/properties`)
- `GET /api/properties` - List properties (filter by status, owner, type, search)
- `GET /api/properties/:id` - Property details with task breakdown and category statistics
- `POST /api/properties` - Create property site with multiple photos
- `PUT /api/properties/:id` - Update property details
- `DELETE /api/properties/:id` - Delete property and associated tasks

### Construction Tasks (`/api/tasks`)
- `GET /api/tasks` - List tasks (filter by property, category, status, priority, worker, overdue)
- `GET /api/tasks/:id` - Task details with before/after photos and work history
- `POST /api/tasks` - Create task with photos and initial history
- `PUT /api/tasks/:id` - Update task details
- `PATCH /api/tasks/:id/status` - Quick status update with history logging
- `POST /api/tasks/:id/photos` - Upload progress photos (`before`, `during`, `after`)
- `DELETE /api/tasks/:id` - Delete task

### Reminders & Alerts (`/api/reminders`)
- `GET /api/reminders` - List scheduled reminders
- `GET /api/reminders/alerts/active` - Active alerts (overdue tasks + today's deadlines)
- `POST /api/reminders` - Create reminder with deduplication check
- `PATCH /api/reminders/:id/status` - Mark reminder as sent or dismissed
- `DELETE /api/reminders/:id` - Delete reminder

### Monthly Reports (`/api/reports`)
- `GET /api/reports/monthly?year=2026&month=10` - Aggregated monthly metrics, category breakdowns, daily trends, and photo records

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/summary` - Aggregate metrics, progress %, upcoming deadlines, overdue tasks, recent photos, and activity stream

---

## 🧪 Testing the Complete Workflow

1. **Dashboard**: Navigate to Dashboard (`http://localhost:3000`). Observe the active properties, overall construction progress bar (e.g. 52%), overdue task warnings, upcoming deadlines, recent photos, and recent activity log.
2. **Owners**: Click "House Owners" in the sidebar. Search for "Rajesh" or filter by city. Click "Add House Owner" to create a new client record with profile photo and emergency contact.
3. **Properties**: Click "Properties". Switch between Grid and Table views. Click "Skyline Modern Villa" to view its full site page, category completion percentages, and photo gallery.
4. **Tasks & Progress**: Click "Tasks & Progress". Toggle between Kanban Board and Table List. Move tasks across columns using the quick move arrows or click a card to open its detail modal. Upload progress photos tagged as `before` or `after` and observe the before-and-after comparison. Click "Mark Complete" to trigger celebratory confetti!
5. **Calendar**: Click "Construction Calendar". Navigate between months. Switch between Month, Week, and Day views. Click on any date (e.g. October 14, 2026) to see tasks scheduled on that day. Test rescheduling a task to a new date directly from the modal.
6. **Reminders**: Click "Reminders & Alerts". Click "Enable Browser Alerts" to test desktop notifications. Create a new reminder with date, time, and delivery channels.
7. **Monthly Reports**: Click "Monthly Reports". Select month "October" and year "2026". Inspect the Planned vs Actual Expenses chart and the Daily Activity line chart. Click "Export as PDF" to download the formatted PDF report. Click "Print Report" to preview the print layout.
