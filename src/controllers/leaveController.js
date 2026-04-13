const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

exports.getLeaves = async (req, res) => {
  try {
    const userRole = req.session.employee ? req.session.employee.role : '';
    const userId = req.session.employee ? req.session.employee._id : null;
    
    let query = {};
    
    if (userRole === 'faculty') {
      // Faculty only see their own
      query.employeeId = userId;
    } else if (userRole === 'hod') {
      // HOD sees their own + people in their department
      const deptMembers = await Employee.find({ department: req.session.employee.department }).select('_id');
      const deptMemberIds = deptMembers.map(m => m._id);
      query.employeeId = { $in: deptMemberIds };
    }
    // Dean sees all

    const leaves = await Leave.find(query)
      .populate('employeeId')
      .sort({ createdAt: -1 });

    res.render('leaveList', { leaves, userRole, query: req.query });
  } catch (error) {
    console.error('getLeaves error:', error);
    res.status(500).send('Server error loading leaves.');
  }
};

exports.requestLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason, type } = req.body;
    const employeeId = req.session.employee._id;
    
    await Leave.create({ employeeId, startDate, endDate, reason, type, status: 'Pending' });
    res.redirect('/leaves?success=Leave+request+submitted');
  } catch (error) {
    console.error('requestLeave error:', error);
    res.redirect('/leaves?error=Failed+to+submit+leave+request');
  }
};

exports.reviewLeave = async (req, res) => {
  try {
    const { status, reviewComment } = req.body;
    await Leave.findByIdAndUpdate(req.params.id, { status, reviewComment });
    res.redirect('/leaves?success=Leave+request+' + status.toLowerCase());
  } catch (error) {
    console.error('reviewLeave error:', error);
    res.redirect('/leaves?error=Failed+to+review+leave+request');
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.redirect('/leaves?success=Leave+request+deleted');
  } catch (error) {
    console.error('deleteLeave error:', error);
    res.redirect('/leaves?error=Failed+to+delete+leave+request');
  }
};
