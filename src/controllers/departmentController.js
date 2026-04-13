const Department = require("../models/Department");
const Employee   = require("../models/Employee");
const Attendance = require("../models/Attendance");

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Enrich each dept with member count, HOD name, and preview members
    const enriched = await Promise.all(departments.map(async (dept) => {
      const memberCount  = await Employee.countDocuments({ department: dept.name });
      const hod          = await Employee.findOne({ department: dept.name, role: 'hod' }).select('name');
      return { ...dept.toObject(), memberCount, hodName: hod ? hod.name : null };
    }));

    res.render("departments", {
      departments: enriched,
      userRole: req.session.employee ? req.session.employee.role : '',
      query: req.query
    });
  } catch (err) {
    console.error('getDepartments:', err);
    res.status(500).send('Server error.');
  }
};

exports.addDepartment = async (req, res) => {
  try {
    await Department.create(req.body);
    res.redirect('/departments?success=Department+added+successfully');
  } catch (err) {
    if (err.code === 11000) res.redirect('/departments?error=Department+already+exists');
    else res.redirect('/departments?error=Failed+to+add+department');
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/departments?success=Department+updated');
  } catch (err) { res.redirect('/departments?error=Failed+to+update+department'); }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.redirect('/departments?success=Department+deleted');
  } catch (err) { res.redirect('/departments?error=Failed+to+delete+department'); }
};

exports.getDepartmentMembers = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).send('Department not found.');

    const userRole = req.session.employee ? req.session.employee.role : '';

    // Access control: HOD can only see their own dept
    if (userRole === 'hod' && req.session.employee.department !== dept.name)
      return res.status(403).send('Forbidden');
    if (userRole === 'faculty') return res.status(403).send('Forbidden');

    const { search, role: roleFilter, sortBy, order } = req.query;
    let query = { department: dept.name };
    if (search)     query.name = { $regex: search, $options: 'i' };
    if (roleFilter) query.role = roleFilter;

    const allowedSort = ['name', 'role', 'salary', 'joinDate', 'position'];
    const sortField   = allowedSort.includes(sortBy) ? sortBy : 'role';
    const sortDir     = order === 'asc' ? 1 : -1;

    const members = await Employee.find(query).sort({ [sortField]: sortDir }).select('-password');

    // Month attendance stats per member (current month)
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const monthName  = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const membersWithStats = await Promise.all(members.map(async (m) => {
      const recs = await Attendance.find({ employeeId: m._id, date: { $gte: monthStart, $lte: monthEnd } });
      return {
        ...m.toObject(),
        att: {
          present: recs.filter(r => r.status === 'Present').length,
          late:    recs.filter(r => r.status === 'Late').length,
          absent:  recs.filter(r => r.status === 'Absent').length,
          total:   recs.length,
          pct: recs.length > 0
            ? Math.round((recs.filter(r => r.status === 'Present').length + recs.filter(r => r.status === 'Late').length * 0.5) / recs.length * 100)
            : 0
        }
      };
    }));

    // Dept-level summary
    const hod   = members.find(m => m.role === 'hod');
    const stats = {
      total:    members.length,
      faculty:  members.filter(m => m.role === 'faculty').length,
      hods:     members.filter(m => m.role === 'hod').length,
      avgSalary: members.length > 0
        ? Math.round(members.reduce((s, m) => s + (m.salary || 0), 0) / members.length)
        : 0
    };

    res.render('departmentMembers', {
      dept, members: membersWithStats, stats, hod: hod || null,
      userRole, monthName, query: req.query
    });
  } catch (err) {
    console.error('getDepartmentMembers:', err);
    res.status(500).send('Server error.');
  }
};

exports.getAddMemberPage = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).send('Department not found.');

    const userRole = req.session.employee ? req.session.employee.role : '';
    if (userRole !== 'dean' && userRole !== 'hod') {
      return res.status(403).send('Forbidden: Only Dean or HOD can add members.');
    }

    res.render('addMember', { dept, userRole });
  } catch (err) {
    console.error('getAddMemberPage:', err);
    res.status(500).send('Server error.');
  }
};