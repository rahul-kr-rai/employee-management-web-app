const Employee   = require("../models/Employee");
const Attendance = require("../models/Attendance");
const bcrypt     = require("bcrypt");

/* ─── Auto-generate Employee ID ─── */
async function generateEmployeeId(role) {
  const prefixMap = { dean: 'DEAN', hod: 'HOD', faculty: 'FAC' };
  const prefix = prefixMap[role] || 'EMP';
  const emps = await Employee.find({ role, employeeId: { $regex: `^${prefix}\\d{3}$` } }).select('employeeId');
  let max = 0;
  emps.forEach(e => { const m = e.employeeId.match(/(\d+)$/); if (m) { const v = parseInt(m[1]); if (v > max) max = v; } });
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

exports.getNextEmployeeId = async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    res.json({ nextId: await generateEmployeeId(role) });
  } catch (err) { res.status(500).json({ error: 'Unable to generate ID' }); }
};

/* ─── List employees with dept/role filter + sort + pagination ─── */
exports.getEmployees = async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = 10;
    const { name, department, role: roleFilter, sortBy, order } = req.query;

    let query = {};
    if (name)       query.name       = { $regex: name, $options: 'i' };
    if (department) query.department = { $regex: department, $options: 'i' };
    if (roleFilter) query.role       = roleFilter;

    const allowedSort = ['name', 'employeeId', 'department', 'salary', 'joinDate', 'role'];
    const sortField   = allowedSort.includes(sortBy) ? sortBy : 'joinDate';
    const sortDir     = order === 'asc' ? 1 : -1;

    const total      = await Employee.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const employees  = await Employee.find(query)
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render("index", { employees, page, totalPages, total, search: req.query });
  } catch (err) {
    console.error('getEmployees:', err);
    res.status(500).send('Server error.');
  }
};

/* ─── Add employee ─── */
exports.addEmployee = async (req, res) => {
  try {
    const { employeeId, name, email, phone, department, position, salary, password, role, joinDate } = req.body;
    const user = req.session.employee;
    let finalRole = role, finalDept = department;

    if (user.role === 'hod') { finalRole = 'faculty'; finalDept = user.department; }

    if (finalRole === 'hod') {
      const existingHod = await Employee.findOne({ department: finalDept, role: 'hod' });
      if (existingHod) return res.redirect('/departments?error=HOD+already+exists+for+this+department');
    }
    const generatedId     = (employeeId && employeeId.trim()) ? employeeId : await generateEmployeeId(finalRole);
    const hashedPassword  = await bcrypt.hash(password, 10);
    await Employee.create({ employeeId: generatedId, name, email, phone, department: finalDept, position, salary, role: finalRole, password: hashedPassword, joinDate: joinDate || Date.now() });
    res.redirect('/departments?success=Employee+added+successfully');
  } catch (err) {
    if (err.code === 11000) res.redirect('/departments?error=Employee+ID+or+Email+already+exists');
    else res.redirect('/departments?error=Failed+to+add+employee');
  }
};

/* ─── Update employee ─── */
exports.updateEmployee = async (req, res) => {
  try {
    const user = req.session.employee;
    let data = { ...req.body };
    delete data.password;

    if (user.role === 'hod') {
      const emp = await Employee.findById(req.params.id);
      if (!emp || emp.role !== 'faculty' || emp.department !== user.department)
        return res.status(403).send('Forbidden');
      delete data.role; delete data.department;
    }
    await Employee.findByIdAndUpdate(req.params.id, data);
    res.redirect('/employees?success=Employee+updated+successfully');
  } catch (err) {
    if (err.code === 11000) res.redirect('/employees?error=Employee+ID+or+Email+already+exists');
    else res.redirect('/employees?error=Failed+to+update+employee');
  }
};

/* ─── Delete employee ─── */
exports.deleteEmployee = async (req, res) => {
  try {
    const user = req.session.employee;
    if (user.role === 'hod') {
      const emp = await Employee.findById(req.params.id);
      if (!emp || emp.role !== 'faculty' || emp.department !== user.department)
        return res.status(403).send('Forbidden');
    }
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect('/employees?success=Employee+deleted+successfully');
  } catch (err) { res.redirect('/employees?error=Failed+to+delete+employee'); }
};

/* ─── Generic dashboard ─── */
exports.getDashboard = async (req, res) => {
  const totalEmployees   = await Employee.countDocuments();
  const totalDepartments = await require("../models/Department").countDocuments();
  res.render("dashboard", { totalEmployees, totalDepartments, activeEmployees: totalEmployees });
};

/* ─── Admin/Dean dashboard with Chart.js data ─── */
exports.getAdminDashboard = async (req, res) => {
  try {
    const Department = require("../models/Department");
    const totalEmployees   = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const recentEmployees  = await Employee.find().sort({ joinDate: -1 }).limit(5);

    // Chart: employees per department
    const deptAgg = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 8 }
    ]);

    // Chart: role distribution
    const roleAgg = await Employee.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Chart: this month's attendance
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const attAgg = await Attendance.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const attSummary = { Present: 0, Late: 0, Absent: 0 };
    attAgg.forEach(a => { attSummary[a._id] = a.count; });

    res.render("adminDashboard", {
      totalEmployees, totalDepartments, activeEmployees: totalEmployees, recentEmployees,
      chartData: {
        deptLabels:  JSON.stringify(deptAgg.map(d => d._id || 'Unknown')),
        deptCounts:  JSON.stringify(deptAgg.map(d => d.count)),
        roleLabels:  JSON.stringify(roleAgg.map(r => (r._id || 'unknown').toUpperCase())),
        roleCounts:  JSON.stringify(roleAgg.map(r => r.count)),
        attSummary:  JSON.stringify(attSummary),
        monthName:   now.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
    });
  } catch (err) { console.error('getAdminDashboard:', err); res.status(500).send('Server error'); }
};

/* ─── Employee/HOD dashboard with attendance summary ─── */
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.session.employee.employeeId });
    if (!employee) return res.redirect('/login');

    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const monthRec   = await Attendance.find({ employeeId: employee._id, date: { $gte: monthStart, $lte: monthEnd } });

    const attendanceStats = {
      present: monthRec.filter(a => a.status === 'Present').length,
      late:    monthRec.filter(a => a.status === 'Late').length,
      absent:  monthRec.filter(a => a.status === 'Absent').length,
      total:   monthRec.length,
      monthName: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    };

    res.render("employeeDashboard", { employee, attendanceStats });
  } catch (err) { console.error('getEmployeeDashboard:', err); res.status(500).send('Server error.'); }
};

/* ─── Salary slip ─── */
exports.getSalarySlip = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).send('Employee not found.');

    const user = req.session.employee;
    if (user.role === 'faculty' && employee.employeeId !== user.employeeId)
      return res.status(403).send('Forbidden');
    if (user.role === 'hod' && employee.department !== user.department && employee.employeeId !== user.employeeId)
      return res.status(403).send('Forbidden');

    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd   = new Date(year, month, 0, 23, 59, 59);
    const workingDays = monthEnd.getDate();

    const records = await Attendance.find({ employeeId: employee._id, date: { $gte: monthStart, $lte: monthEnd } });
    const presentDays = records.filter(a => a.status === 'Present').length;
    const lateDays    = records.filter(a => a.status === 'Late').length;
    const absentDays  = records.filter(a => a.status === 'Absent').length;

    const basicSalary  = employee.salary || 0;
    const perDay       = basicSalary / workingDays;
    const earnedSalary = Math.round(perDay * (presentDays + lateDays * 0.5));
    const deductions   = Math.round(perDay * absentDays);
    const netSalary    = Math.max(0, earnedSalary - deductions);

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    res.render("salarySlip", { employee, month, year, monthName: months[month - 1], workingDays, presentDays, lateDays, absentDays, basicSalary, earnedSalary, deductions, netSalary });
  } catch (err) { console.error('getSalarySlip:', err); res.status(500).send('Server error.'); }
};

/* ─── Change password ─── */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const emp = await Employee.findOne({ employeeId: req.session.employee.employeeId });
    if (!emp) return res.redirect('/login');
    if (!(await bcrypt.compare(currentPassword, emp.password)))
      return res.render('changePassword', { error: 'Current password is incorrect.' });
    if (newPassword !== confirmPassword)
      return res.render('changePassword', { error: 'New passwords do not match.' });
    if (newPassword.length < 6)
      return res.render('changePassword', { error: 'Password must be at least 6 characters.' });

    await Employee.findByIdAndUpdate(emp._id, { password: await bcrypt.hash(newPassword, 10) });
    res.render('changePassword', { success: 'Password changed successfully!' });
  } catch (err) { console.error('changePassword:', err); res.status(500).send('Server error.'); }
};

/* ─── Profile Details ─── */
exports.getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).send('Employee not found.');
    res.render('employeeProfile', { employee, userRole: req.session.employee.role, search: req.query });
  } catch (err) {
    console.error('getEmployeeProfile:', err);
    res.status(500).send('Server error.');
  }
};