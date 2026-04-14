# 📋 Employee Management System — Project Report

> **Project Type:** College Project — Full-Stack Web Application  
> **Tech Stack:** Node.js · Express.js · MongoDB · EJS · Vanilla CSS  
> **Report Date:** April 2026  
> **Author:** Pintu

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [System Architecture](#3-system-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Database Schema](#5-database-schema)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Existing Features](#7-existing-features)
8. [API Routes Reference](#8-api-routes-reference)
9. [UI Pages](#9-ui-pages)
10. [Resolved Bugs](#10-resolved-bugs)
11. [Suggested New Features (Future Scope)](#11-suggested-new-features-future-scope)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. Project Overview

The **Employee Management System (EMS)** is a full-stack web application designed for academic institutions (universities/colleges) to manage their faculty and staff digitally. It replaces manual HR record-keeping with an organized, role-based system.

### Goals
- Provide a centralized platform for managing employee records
- Enable department-based organization and management
- Track attendance efficiently
- Support role-based access control for Dean, HOD, and Faculty users
- Facilitate leave applications and salary calculations

### Scope
- Single organization (one institution)
- Three user roles: Dean (admin), HOD, Faculty
- Core CRUD operations for employees, departments, and leaves
- Attendance marking, reporting, and personal tracking
- Data export to CSV and printable layouts

---

## 2. Tech Stack & Dependencies

### Backend
| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.18.2 | Web framework / HTTP server |
| `mongoose` | ^7.0.0 | MongoDB ODM |
| `express-session` | ^1.19.0 | Session-based authentication |
| `bcrypt` | ^6.0.0 | Password hashing |
| `ejs` | ^3.1.10 | Server-side HTML templating |
| `json2csv` | ^6.0.0-alpha.2 | CSV export utility |
| `dotenv` | ^16.0.0 | Environment variable management |

### Frontend
| Technology | Usage |
|---|---|
| HTML5 (EJS templates) | Page structure |
| Vanilla CSS (custom design system) | All styling |
| Google Fonts — Inter | Typography |
| Vanilla JavaScript | Form behaviour, modals, fetch API calls |

### Database
- **MongoDB** (via MongoDB Atlas or local)
- Connection URI stored in `.env` as `MONGO_URI`

### Dev Tools
| Tool | Purpose |
|---|---|
| `nodemon` | Auto-restart on file changes (dev only) |
| `node` | Runtime |

---

## 3. System Architecture

```text
Browser (Client)
      |
      |  HTTP Request
      v
+---------------------------+
|     Express.js App        |  <- src/app.js
|  (Port 3000)              |
+---------------------------+
|  Middleware Stack         |
|  * express.urlencoded     |
|  * express.json           |
|  * express-session        |
|  * express.static         |
+---------------------------+
|  Route Layer              |
|  * /           (auth)     |
|  * /employees             |
|  * /departments           |
|  * /attendance            |
|  * /leaves                |
+---------------------------+
|  Controller Layer         |
|  * employeeController     |
|  * departmentController   |
|  * attendanceController   |
|  * leaveController        |
+---------------------------+
|  Model Layer (Mongoose)   |
|  * Employee               |
|  * Department             |
|  * Attendance             |
|  * Leave                  |
+---------------------------+
      |
      |  Mongoose ODM
      v
+---------------------------+
|       MongoDB             |
|  Collections:             |
|  * employees              |
|  * departments            |
|  * attendances            |
|  * leaves                 |
+---------------------------+
```

### Request Flow
1. Browser sends HTTP request
2. Express middleware processes it (parse body, check session)
3. Route matches and calls appropriate controller function
4. Controller queries MongoDB via Mongoose model
5. Controller calls `res.render(view, data)` or `res.redirect()`
6. EJS template is rendered with data and HTML is sent to browser

---

## 4. Folder Structure

```text
employee-management-web-app/
├── src/
│   ├── app.js                    <- Entry point, Express setup
│   ├── config/
│   │   └── db.js                 <- MongoDB connection
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Department.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   └── User.js               <- (Legacy)
│   ├── controllers/
│   │   ├── employeeController.js
│   │   ├── departmentController.js
│   │   ├── attendanceController.js
│   │   └── leaveController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── employeeRoutes.js
│       ├── departmentRoutes.js
│       ├── attendanceRoutes.js
│       └── leaveRoutes.js
├── views/                        <- EJS templates (login.ejs, adminDashboard.ejs...)
├── public/                       <- Static assets
│   └── style.css
├── docs/
├── tests/
├── createAdmin.js                <- Script to seed first user
├── package.json
├── report.md                     <- This file
└── README.md
```

---

## 5. Database Schema

### Employee
```js
{
  employeeId : String   // Auto-generated: FAC001, HOD001, DEAN001
  name       : String   // Required
  email      : String   // Required, Unique
  phone      : String
  department : String
  position   : String   // e.g. "Professor"
  salary     : Number
  joinDate   : Date     // Default: now
  role       : String   // Enum: 'dean' | 'hod' | 'faculty'
  password   : String   // bcrypt hashed
}
```

### Department
```js
{
  name : String   // Required, Unique
}
```

### Attendance
```js
{
  employeeId : ObjectId  // ref: 'Employee'
  date       : Date
  status     : String    // Enum: 'Present' | 'Late' | 'Absent'
}
```

### Leave
```js
{
  employeeId    : ObjectId  // ref: 'Employee'
  startDate     : Date
  endDate       : Date
  reason        : String
  type          : String    // e.g. 'Sick', 'Casual'
  status        : String    // Enum: 'Pending' | 'Approved' | 'Rejected'
  reviewComment : String
}
```

---

## 6. User Roles & Permissions

| Action | Faculty | HOD | Dean |
|---|:---:|:---:|:---:|
| Login | YES | YES | YES |
| View own profile | YES | YES | YES |
| View departments | YES | YES | YES |
| View own attendance | YES | YES | YES |
| Mark team attendance | NO | YES | YES |
| Request Leave | YES | YES | YES |
| Approve Leaves | NO | YES (own dept) | YES (all) |
| Add Faculty | NO | YES (own dept only) | YES |
| Update employee | NO | YES (own faculty) | YES |
| Delete employee | NO | YES (own faculty) | YES |
| Manage departments | NO | Partial | YES |
| Export CSV | NO | NO | YES |
| Admin dashboard | NO | NO | YES |

---

## 7. Existing Features

### 7.1 Authentication & Security
- **Login** — Employees sign in with `employeeId` and `password`
- **Password Security** — `bcrypt` hashing
- **Change Password** — Dedicated feature for users to configure their own secure passwords post-interaction.
- **Session Management** — Maintained login state via `express-session`
- **Route Guards** — Strict `auth`, `deanOrHod`, `canManage` middlewares to prevent unauthorized access.

### 7.2 Employee Management
- **Add Employee** — Full form fields, ID auto-generated system (`FAC`, `DEAN`, `HOD` prefixes)
- **Update / Delete** — Using secure endpoints and inline/table actions
- **Search & Pagination** — Regex search and segmented multi-page lists
- **Profile Detail View** — Granular detail expansion using profile routes
- **CSV Export** — Complete system export of employee rows.

### 7.3 Department Management
- **Departments Config** — Create, modify, delete available departments.
- **Member Assignment** — Strict HOD singleton per department checking algorithm. Add Member dedicated interface.

### 7.4 Attendance
- **Mark Attendance** — HOD/Dean select Employee, Date, Status (Present/Late/Absent). Hard duplicate check on daily marking.
- **My Attendance** — Detailed employee view isolating their records, counting late, missed and present logs.
- **Employee Specific Tracking** — Comprehensive attendance listing.

### 7.5 Leaves & Time Off
- **Leave Requesting** — Form fields (type, reason, dates) mapping directly to custom Leave models.
- **Approval Workflow** — Role-contextual listing of leaves, HOD reviews own department, Dean reviews all.

### 7.6 Reporting & Compensation
- **Salary Slips** — Real-time dynamic compilation mapping Base Salary and adjusting based on absent & late logs to output an authoritative net salary receipt.
- **Dashboards** — Aggregation of metrics: Monthly attendance metrics, Department headcounts, Role splits powered by complex MongoDB Aggregations mapped to modern charting solutions.

---

## 8. API Routes Reference

*Key sub-routes included under typical root segments*

| Segment | Highlight Paths & Methods | Purpose |
|---|---|---|
| Auth (`/`) | `POST /login`, `POST /logout` | Authentication flows |
| Pass (`/change-password`) | `GET`, `POST` | User credential updating |
| D-Board (`/dashboard..`) | `/admin`, `/employee`, `/` | Segmented overview UIs |
| Employees (`/employees`)| `GET /`, `POST /add`, `POST /update/:id`, `POST /delete/:id`, `GET /salary-slip/:id`, `GET /export` | Core CRUD + Output functionality. Protected endpoints. |
| Depts (`/departments`) | `GET /`, `POST /add...` | Area configurations |
| Attd (`/attendance`) | `GET /`, `POST /mark`, `GET /my-attendance`, `GET /employee/:id` | Status logging routes |
| Leaves (`/leaves`) | `GET /`, `POST /request`, `POST /review/:id`, `POST /delete/:id` | Vacation & Sick logs |

---

## 9. UI Pages

| Key Components | Views mapped in `views/` directory |
|---|---|
| **Marketing & Setup** | `landing.ejs`, `login.ejs` |
| **Dashboards** | `adminDashboard.ejs`, `employeeDashboard.ejs`, `dashboard.ejs` |
| **People** | `index.ejs` (emp list), `employeeProfile.ejs`, `addMember.ejs` |
| **Organization** | `departments.ejs`, `departmentMembers.ejs` |
| **Operations** | `attendance.ejs`, `myAttendance.ejs`, `employeeAttendance.ejs`, `leaveList.ejs` |
| **Finance & Account**| `salarySlip.ejs`, `changePassword.ejs` |

---

## 10. Resolved Bugs

During the latest development cycles, major structural bugs were eliminated:

| Status | Bug Addressed | Fix Implemented |
|---|---|---|
| ✅ FIXED | `getEmployeeDashboard` returning random employee | Modified to strictly query using logged `req.session.employee.employeeId` |
| ✅ FIXED | Attendance ObjectId schema mismatch | Standardized the lookup workflow in `markAttendance` utilizing `Employee._id` references |
| ✅ FIXED | Missing Route Guards on `GET /employees` | Wrapped in strict `deanOrHod` filter |
| ✅ FIXED | Insecure Delete Methods | Migrated `GET` base deletions to pure `POST` actions preventing crawler wipes |
| ✅ FIXED | Duplicate Attendance Marking | Enforced zero-time date start/end boundary evaluations blocking duplicate row entries |

---

## 11. Suggested New Features (Future Scope)

### Intermediate Focus
1. **Flash messages / toasts**: Move URL params (`?success=...`) to proper session-based flash messaging.
2. **Bulk CSV Import**: Upload CSV to add many employees comprehensively at once.
3. **Activity / Audit Log**: Record timeline logs of who added/changed/deleted items.
4. **HOD ref in Department Schema**: Improve structure by placing HOD ObjectId direct inside Dept model limit.
5. **Printable / PDF exports**: Browser CSS media query refinement for printing logs seamlessly.

### Advanced Capabilities
6. **Mobile Sidebar Nav**: Off-canvas rendering mechanism for the menu systems.
7. **Email Integrations (Nodemailer)**: Notifications on account creations, or leave approvals.
8. **REST API Layer**: Standardizing raw JSON returning endpoints specifically for mobile app/React hooks integrations.
9. **JWT Auth Layer**: Upgrading session cookies to scalable tokens.
10. **Dark / Light Mode**: Configurable site-wide toggle.

---

## 12. Implementation Roadmap

```text
COMPLETE — Core App Stabilization
  - Role-based Dashboard optimizations
  - System bug flushing (Duplicate logs, Access layers, Queries)
  - Full suite deployment of Salary Slips and My Attendance modules
  - Core Leave integrations built (request & review schemas)

PHASE 3 — Process Smoothing (Upcoming)
  - Replace URL parameter flashes with Session-driven flash plugins
  - Advanced Table structures (Live Date filters, Data-tables library sorting)

PHASE 4 — Notifications & Extensions (Future)
  - Nodemailer dispatches
  - Two-Factor Authentication via email OTP
  - React/Mobile ready REST structures
```

---

## Summary Statistics

| Metric | Count |
|---|---|
| **EJS Views** | 16 Components |
| **Controllers** | 4 Entities |
| **Registered DB Models** | 5 Configs |
| **Primary Route Segments**| 6 Handlers |
| **Outstanding Core Bugs** | 0 Major Blockers |

---

*Report generated: April 2026 — EMS College Project*
