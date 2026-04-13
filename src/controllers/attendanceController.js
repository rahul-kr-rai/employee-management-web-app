const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

exports.getAttendance = async (req, res) => {
  try {
    const { fromDate, toDate, statusFilter, page = 1 } = req.query;
    const limit = 15;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Auth guard for specific roles if we wanted, but let's assume it's protected by middleware
    // We can add filtering if it's an HOD, etc.
    
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) {
        const tDate = new Date(toDate);
        tDate.setHours(23, 59, 59, 999);
        query.date.$lte = tDate;
      }
    }
    if (statusFilter) query.status = statusFilter;

    const total = await Attendance.countDocuments(query);
    const attendance = await Attendance.find(query)
      .populate('employeeId')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.render("attendance", { 
      attendance, 
      query: req.query,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getAttendance error:', error);
    res.status(500).send('Server error loading attendance.');
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    const employee = await Employee.findOne({ employeeId: employeeId.trim() });
    if (!employee) {
      return res.redirect('/attendance?error=Employee+not+found');
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existing = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: attendanceDate, $lt: nextDay }
    });

    if (existing) {
      return res.redirect('/attendance?error=Attendance+already+marked+for+this+date');
    }

    await Attendance.create({ employeeId: employee._id, date, status });
    res.redirect('/attendance?success=Attendance+marked+successfully');
  } catch (error) {
    console.error('markAttendance error:', error);
    res.redirect('/attendance?error=Failed+to+mark+attendance');
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    if (!req.session.employee) return res.redirect('/login');
    
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const employee = req.session.employee;
    
    const total = await Attendance.countDocuments({ employeeId: employee._id });
    const attendance = await Attendance.find({ employeeId: employee._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Month Stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const monthRecs = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: monthStart, $lte: monthEnd }
    });

    const monthStats = {
      present: monthRecs.filter(r => r.status === 'Present').length,
      late: monthRecs.filter(r => r.status === 'Late').length,
      absent: monthRecs.filter(r => r.status === 'Absent').length,
      total: monthRecs.length
    };

    res.render('myAttendance', {
      employee,
      attendance,
      page,
      totalPages: Math.ceil(total / limit),
      monthName: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      monthStats
    });
  } catch (error) {
    console.error('getMyAttendance error:', error);
    res.status(500).send('Server error');
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department');
      
    if (!employee) return res.status(404).send('Employee not found');

    const attendance = await Attendance.find({ employeeId: req.params.id })
      .sort({ date: -1 });
      
    const stats = {
      present: attendance.filter(r => r.status === 'Present').length,
      late: attendance.filter(r => r.status === 'Late').length,
      absent: attendance.filter(r => r.status === 'Absent').length,
      total: attendance.length
    };

    res.render("employeeAttendance", { attendance, employee, stats });
  } catch (error) {
    console.error('getEmployeeAttendance error:', error);
    res.status(500).send('Server error loading attendance.');
  }
};