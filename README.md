# Employee Management System

A comprehensive CRUD Employee Management System built with Node.js, Express, MongoDB, and EJS.

## Features

- **Professional Navbar**: Clean navigation with logo, title, and login button
- **Modern Login Page**: Beautiful gradient design with floating labels and error handling
- **Role-Based Dashboards**: Separate dashboards for admins and employees
- **Employee Login**: Secure authentication using Employee ID and password
- **Employee Management**: Add, view, update, and delete employee records
- **Search Functionality**: Search employees by name, department, etc.
- **Department Management**: Create and manage departments
- **Attendance Tracking**: Mark and view daily attendance
- **Salary Management**: Store and update salary details
- **Export to CSV**: Export employee data for reporting

## Project Structure

- `src/` - Source code
  - `controllers/` - Route handlers
  - `models/` - Database models (Employee, Department, Attendance)
  - `routes/` - Route definitions
  - `config/` - Configuration files
- `public/` - Static assets
- `views/` - EJS templates
- `tests/` - Test files
- `docs/` - Documentation

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` (see .env.example)
4. Start MongoDB
5. Create admin user: `node createAdmin.js`
6. Run the application: `npm start`

## Default Admin Credentials

After running `node createAdmin.js`, you can login with:
- **Employee ID**: `ADMIN001`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login for security!

## Admin Management

- Run `node createAdmin.js` to create the default admin user
- Admin users have full access to all system features
- Regular employees have limited access to their own dashboard

## Usage

- Visit `http://localhost:3000` for the landing page
- Login with your Employee ID and password
- Access employee management, departments, attendance, and dashboard

## Routes

- `/` - Landing page
- `/login` - Employee login
- `/dashboard/admin` - Admin dashboard
- `/dashboard/employee` - Employee dashboard
- `/employees` - Employee CRUD operations
- `/departments` - Department management
- `/attendance` - Attendance tracking