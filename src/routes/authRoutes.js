const express    = require("express");
const router     = express.Router();
const Employee   = require("../models/Employee");
const Department = require("../models/Department");
const Attendance = require("../models/Attendance");
const bcrypt     = require("bcrypt");

function ensureLoggedIn(req, res, next) {
  if (!req.session || !req.session.employee) return res.redirect("/login");
  next();
}

/* ─── Landing / Login / Logout ─── */
router.get("/login",  (req, res) => res.render("login"));

router.post("/login", async (req, res) => {
  const { employeeId, password } = req.body;
  const employee = await Employee.findOne({ employeeId });
  if (employee && await bcrypt.compare(password, employee.password)) {
    req.session.employee = employee;
    return res.redirect(employee.role === 'dean' ? "/dashboard/dean" : "/dashboard/user");
  }
  res.render("login", { error: "Invalid Employee ID or Password" });
});

router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) { console.error(err); return res.status(500).send('Logout failed'); }
    res.redirect('/login');
  });
});

/* ─── Dean dashboard ─── */
router.get("/dashboard/dean", ensureLoggedIn, async (req, res) => {
  if (req.session.employee.role !== 'dean') return res.redirect("/login");
  try {
    const empController = require("../controllers/employeeController");
    return empController.getAdminDashboard(req, res);
  } catch (err) { console.error(err); res.status(500).send("Server error"); }
});

/* ─── Employee / HOD dashboard ─── */
router.get("/dashboard/user", ensureLoggedIn, async (req, res) => {
  try {
    const empController = require("../controllers/employeeController");
    return empController.getEmployeeDashboard(req, res);
  } catch (err) { console.error(err); res.status(500).send("Server error"); }
});

/* ─── Change Password ─── */
router.get("/change-password", ensureLoggedIn, (req, res) => {
  res.render("changePassword", {});
});

router.post("/change-password", ensureLoggedIn, async (req, res) => {
  const empController = require("../controllers/employeeController");
  return empController.changePassword(req, res);
});

module.exports = router;