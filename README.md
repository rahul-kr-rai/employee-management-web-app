# Employee Management System

A comprehensive CRUD Employee Management System built with Node.js, Express, MongoDB, and EJS.

## Features

- **Professional Navbar**: Clean navigation with logo, title, and login button
- **Modern Login Page**: Beautiful gradient design with floating labels and error handling
- **Role-Based Dashboards**: Separate dashboards for admins (Dean), HODs, and employees (Faculty)
- **Employee Login & Security**: Secure authentication using Employee ID, password (bcrypt), and Change Password functionality
- **Employee Management**: Add, view, update, and delete employee records securely
- **Search Functionality**: Search employees by name, department, role, etc.
- **Department Management**: Create and manage departments
- **Attendance Tracking**: Mark and view daily attendance, including "My Attendance" features, percentages, and late tracking
- **Leave Management**: Leave requesting, review workflows, and approval status tracking
- **Salary Management**: Generate detailed Salary Slips containing earnings, deductions, and attendance variables
- **Export to CSV**: Export employee data for reporting

## Project Structure

- `src/` - Source code
  - `controllers/` - Route handlers (e.g., employee, admin, attendance, leave)
  - `models/` - Database models (Employee, Department, Attendance, Leave)
  - `routes/` - Route definitions
  - `config/` - Configuration files
- `public/` - Static assets
- `views/` - EJS templates for rich UI dynamically rendered
- `tests/` - Test files
- `docs/` - Documentation

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` (see .env.example or create one with MONGO_URI and PORT)
4. Start MongoDB
5. Create admin user: `node createAdmin.js`
6. Run the application: `npm start` (or `npm run dev` for nodemon)

## Default Admin Credentials

After running `node createAdmin.js`, you can login with:
- **Employee ID**: `ADMIN001` (Or generated based on script, e.g. `DEAN001`)
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login for security!

## Usage

- Visit `http://localhost:3000` for the landing page
- Login with your Employee ID and password
- Access employee management, departments, attendance, leaves, and dashboard

## Routes

- `/` - Landing page
- `/login` - Employee login
- `/dashboard/admin` - Admin dashboard
- `/dashboard/employee` - Employee dashboard
- `/employees` - Employee CRUD operations
- `/departments` - Department management
- `/attendance` - Attendance tracking
- `/leaves` - Leave management