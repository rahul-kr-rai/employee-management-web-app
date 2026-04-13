const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/employeeController");

const auth = (req, res, next) => {
  if (!req.session.employee) return res.redirect('/login');
  next();
};

const deanOrHod = (req, res, next) => {
  const role = req.session.employee.role;
  if (role === 'dean' || role === 'hod') return next();
  return res.status(403).send('Forbidden: Access restricted to Dean and HOD.');
};

const canManage = (req, res, next) => {
  const role = req.session.employee.role;
  if (role === 'dean' || role === 'hod') return next();
  return res.status(403).send('Forbidden');
};

router.get("/",              auth, deanOrHod, controller.getEmployees);
router.get("/next-id",       auth, controller.getNextEmployeeId);
router.post("/add",          auth, canManage,  controller.addEmployee);
router.post("/update/:id",   auth, canManage,  controller.updateEmployee);
router.post("/delete/:id",   auth, canManage,  controller.deleteEmployee);
router.get("/salary-slip/:id", auth, controller.getSalarySlip);
router.get("/profile/:id", auth, controller.getEmployeeProfile);

router.get("/dashboard",         auth, controller.getDashboard);
router.get("/dashboard/admin",   auth, controller.getAdminDashboard);
router.get("/dashboard/employee",auth, controller.getEmployeeDashboard);

const { Parser } = require("json2csv");
router.get("/export", auth, deanOrHod, async (req, res) => {
  try {
    const employees = await require("../models/Employee").find().select('-password');
    const fields    = ['employeeId','name','email','phone','department','position','salary','joinDate','role'];
    const csv = new Parser({ fields }).parse(employees);
    res.header("Content-Type", "text/csv");
    res.attachment("employees.csv");
    res.send(csv);
  } catch (err) { res.status(500).send('Failed to export CSV.'); }
});

module.exports = router;