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
10. [Known Bugs](#10-known-bugs)
11. [Suggested New Features](#11-suggested-new-features)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. Project Overview

The **Employee Management System (EMS)** is a full-stack web application designed for academic institutions (universities/colleges) to manage their faculty and staff digitally. It replaces manual HR record-keeping with an organized, role-based system.

### Goals
- Provide a centralized platform for managing employee records
- Enable department-based organization and management
- Track attendance efficiently
- Support role-based access control for Dean, HOD, and Faculty users

### Scope
- Single organization (one institution)
- Three user roles: Dean (admin), HOD, Faculty
- Core CRUD operations for employees and departments
- Attendance marking and viewing
- Data export to CSV

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

```
Browser (Client)
      |
      |  HTTP Request
      v
+---------------------------+
|     Express.js App        |  <- src/app.js
|  (Port 3000)              |
+---------------------------+
|  Middleware Stack          |
|  * express.urlencoded     |
|  * express-session        |
|  * express.static         |
+---------------------------+
|  Route Layer              |
|  * /           (auth)     |
|  * /employees             |
|  * /departments           |
|  * /attendance            |
+---------------------------+
|  Controller Layer         |
|  * employeeController     |
|  * departmentController   |
|  * attendanceController   |
+---------------------------+
|  Model Layer (Mongoose)   |
|  * Employee               |
|  * Department             |
|  * Attendance             |
|  * User                   |
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
|  * users                  |
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

```
employee-management-web-app/
├── src/
│   ├── app.js                    <- Entry point, Express setup
│   ├── config/
│   │   └── db.js                 <- MongoDB connection
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Department.js
│   │   ├── Attendance.js
│   │   └── User.js
│   ├── controllers/
│   │   ├── employeeController.js
│   │   ├── departmentController.js
│   │   └── attendanceController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── employeeRoutes.js
│       ├── departmentRoutes.js
│       └── attendanceRoutes.js
├── views/                        <- EJS templates
│   ├── landing.ejs
│   ├── login.ejs
│   ├── adminDashboard.ejs
│   ├── employeeDashboard.ejs
│   ├── dashboard.ejs
│   ├── departments.ejs
│   ├── attendance.ejs
│   └── index.ejs
├── public/                       <- Static assets
│   └── style.css
├── docs/
├── tests/
├── createAdmin.js                <- Script to seed first Dean
├── .env                          <- MONGO_URI, PORT (not committed)
├── .gitignore
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
  position   : String   // "Professor" | "Assistant Professor"
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
  status     : String    // Enum: 'Present' | 'Absent'
}
```

### User *(unused / legacy)*
```js
{
  username : String
  password : String
}
```
> Note: The `User` model appears to be unused. Authentication is handled via the `Employee` model directly.

---

## 6. User Roles & Permissions

| Action | Faculty | HOD | Dean |
|---|:---:|:---:|:---:|
| Login | YES | YES | YES |
| View own profile | YES | YES | YES |
| View departments | YES | YES | YES |
| View attendance | YES | YES | YES |
| Mark attendance | NO | YES | YES |
| Add Faculty | NO | YES (own dept only) | YES |
| Add HOD | NO | NO | YES |
| Update employee | NO | YES (own faculty) | YES |
| Delete employee | NO | YES (own faculty) | YES |
| Manage departments | NO | Partial | YES |
| Export CSV | NO | NO | YES |
| Admin dashboard | NO | NO | YES |

---

## 7. Existing Features

### 7.1 Authentication
- **Login** — Employees sign in with `employeeId` and `password`
- **Password Security** — Passwords are hashed using `bcrypt` (salt rounds: 10)
- **Session Management** — `express-session` maintains login state
- **Role-based Redirect** — Dean goes to `/dashboard/dean`, others go to `/dashboard/user`
- **Logout** — Session destroyed on POST `/logout`
- **Route Guards** — `ensureLoggedIn` and `canManage` middleware protect routes

### 7.2 Employee Management
- **Add Employee** — Full form with name, email, phone, department, position, salary, join date, role, password
- **Auto ID Generation** — IDs auto-generated as `FAC001`, `HOD001`, `DEAN001` (role-prefixed, sequential)
- **ID Preview** — Live preview of next ID via `GET /employees/next-id?role=faculty` (fetch API)
- **Update Employee** — Inline edit fields within the employee table
- **Delete Employee** — Delete by employee ID
- **Search** — Search employees by name (case-insensitive regex)
- **Pagination** — 5 employees per page
- **CSV Export** — Download all employees as `employees.csv` via `json2csv`
- **HOD Uniqueness** — Prevents adding a second HOD to the same department

### 7.3 Department Management
- **Add Department** — Create a new department by name (unique)
- **Update Department** — Rename an existing department inline
- **Delete Department** — Remove a department
- **Add Member Modal** — Permission-aware modal to add an employee to a specific department

### 7.4 Attendance
- **Mark Attendance** — Submit Employee ID + Date + Status (Present/Absent)
- **View All Records** — Table of all attendance entries with employee name populated
- **View by Employee** — Route exists at `GET /attendance/employee/:id` (view template missing)

### 7.5 Dashboards
- **Admin Dashboard** — Total Employees, Total Departments, Active Employees, Recent 5 employees
- **Employee Dashboard** — Personal profile card with all info fields
- **Quick Actions** — Links to Employees, Departments, Attendance, Export

### 7.6 UI & Design
- Custom CSS design system (light theme, Inter font, indigo accent)
- Responsive grid layouts
- Animated stat cards with hover effects
- Glassmorphic navbar with blur backdrop
- Modal overlay for Add Member
- Collapsible Add Employee form (accordion)
- Paginated data table with inline edit
- Search bar
- Empty state displays
- Animated page entrance effects

---

## 8. API Routes Reference

### Auth Routes (`/`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/` | Landing page | Public |
| GET | `/login` | Login form | Public |
| POST | `/login` | Authenticate user | Public |
| POST | `/logout` | Destroy session | Auth |
| GET | `/dashboard/dean` | Admin dashboard | Dean only |
| GET | `/dashboard/user` | Employee dashboard | Auth |

### Employee Routes (`/employees`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/employees` | Redirect to /departments | Auth |
| GET | `/employees/next-id?role=` | Get next auto-ID | Auth |
| POST | `/employees/add` | Add new employee | Dean / HOD |
| POST | `/employees/update/:id` | Update employee | Dean / HOD |
| GET | `/employees/delete/:id` | Delete employee | Dean / HOD |
| GET | `/employees/export` | Download CSV | Auth |

### Department Routes (`/departments`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/departments` | List all departments | Auth |
| POST | `/departments/add` | Create department | Auth |
| POST | `/departments/update/:id` | Rename department | Auth |
| GET | `/departments/delete/:id` | Delete department | Auth |

### Attendance Routes (`/attendance`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/attendance` | View all attendance | Auth |
| POST | `/attendance/mark` | Mark attendance | Auth |
| GET | `/attendance/employee/:id` | Employee attendance (view missing) | Auth |

---

## 9. UI Pages

| Page | File | Route | Purpose |
|---|---|---|---|
| Landing | `landing.ejs` | `/` | Marketing page with features |
| Login | `login.ejs` | `/login` | Authentication form |
| Admin Dashboard | `adminDashboard.ejs` | `/dashboard/dean` | Stats + recent employees |
| Employee Dashboard | `employeeDashboard.ejs` | `/dashboard/user` | Profile view |
| General Dashboard | `dashboard.ejs` | `/employees/dashboard` | Basic stat view |
| Employees | `index.ejs` | `/employees` | CRUD table + add form |
| Departments | `departments.ejs` | `/departments` | Dept list + add member modal |
| Attendance | `attendance.ejs` | `/attendance` | Mark + view records |

---

## 10. Known Bugs

| # | Severity | Bug | Location | Impact |
|---|---|---|---|---|
| 1 | HIGH | `getEmployeeDashboard` uses `Employee.findOne()` with no filter — returns a random employee, not the logged-in user | `employeeController.js:148` | Every employee sees wrong profile data |
| 2 | HIGH | `markAttendance` stores raw `employeeId` string, but model expects an ObjectId ref — `.populate()` breaks | `attendanceController.js:11` | Attendance records don't display correctly |
| 3 | MEDIUM | Faculty can visit `/employees` page (no guard on GET route) | `employeeRoutes.js:21` | Unauthorized data visibility |
| 4 | MEDIUM | Delete uses `GET /employees/delete/:id` — insecure method | `employeeRoutes.js:25` | Data loss risk from crawlers |
| 5 | LOW | No duplicate attendance check — same employee marked twice on same day | `attendanceController.js:9` | Data integrity issue |

---

## 11. Suggested New Features

### Easy (1–2 days each)

| # | Feature | Description |
|---|---|---|
| 1 | Fix all 5 bugs | Priority before any new feature |
| 2 | `employeeAttendance.ejs` view | Route exists, just needs the template |
| 3 | "Late" attendance status | Add 3rd option: Present / Late / Absent |
| 4 | Flash messages / toasts | Replace `res.send("Error")` with styled alerts |
| 5 | Filter by department/role | Extend search on employee list |
| 6 | Sort table columns | Click column header to sort |
| 7 | Attendance date range filter | Filter records between two dates |
| 8 | Print / PDF attendance | Browser print CSS styled sheet |
| 9 | Employee count on departments | Show member count badge |

### Intermediate (2–5 days each)

| # | Feature | Description |
|---|---|---|
| 10 | My Attendance page | Employee views their own attendance log |
| 11 | Attendance % summary | Monthly present/absent % on employee dashboard |
| 12 | Salary slip view | Printable formatted slip per employee per month |
| 13 | Leave Management | Request, approve/reject — new Leave model |
| 14 | Change Password | Employee changes own password post-login |
| 15 | Bulk CSV Import | Upload CSV to add many employees at once |
| 16 | Activity / Audit Log | Who added/changed/deleted what and when |
| 17 | Department stats page | Members, HOD name, avg salary per dept |
| 18 | HOD ref in Department schema | Store HOD ObjectId directly in Department |
| 19 | Attendance pagination | Currently loads all records at once |

### Advanced (1–2 weeks each)

| # | Feature | Description |
|---|---|---|
| 20 | Chart.js Analytics Dashboard | Bar/pie charts — attendance rate, dept headcount, salary distribution |
| 21 | In-app Notifications | Leave approvals, new member added alerts |
| 22 | Email Notifications (Nodemailer) | Emails on account create, leave approval |
| 23 | Monthly Payroll Report | Auto-compute salary x attendance days |
| 24 | Performance Reviews | Dean/HOD submits annual review per employee |
| 25 | REST API Layer | JSON endpoints for mobile or React front-end |
| 26 | JWT Authentication | Replace sessions with stateless JWT tokens |
| 27 | Two-Factor Auth (2FA) | OTP via email on login |
| 28 | Dark / Light Mode Toggle | User preference saved in localStorage |
| 29 | Mobile Sidebar Nav | Hamburger menu for small screens |
| 30 | Role-based data isolation | Stricter per-role data filtering |

---

## 12. Implementation Roadmap

```
PHASE 1 — Bug Fixes (This Week)
  - Fix getEmployeeDashboard session bug
  - Fix attendance ObjectId mismatch
  - Guard /employees GET from Faculty
  - Convert deletes to POST
  - Add duplicate attendance check

PHASE 2 — Core Completeness (Week 2)
  - Flash messages / toasts
  - My Attendance page for employees
  - Late attendance status
  - Attendance date range filter
  - Change password feature

PHASE 3 — Analytics & Reports (Week 3-4)
  - Chart.js on admin dashboard
  - Attendance % summary per employee
  - Department stats page
  - Salary slip / payslip generation
  - Monthly payroll report

PHASE 4 — Advanced Features (Future)
  - Leave management system
  - Email notifications (Nodemailer)
  - Performance reviews
  - REST API + mobile support
```

---

## Summary Statistics

| Metric | Count |
|---|---|
| Total Pages / Views | 8 |
| API Routes | 16 |
| Database Collections | 4 |
| User Roles | 3 |
| NPM Dependencies | 7 |
| Known Bugs | 5 |
| Existing Features | 25+ |
| Suggested New Features | 30 |

---

*Report generated: April 2026 — EMS College Project*
