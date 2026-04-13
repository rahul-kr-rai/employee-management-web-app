const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/attendanceController");

const auth = (req, res, next) => {
  if (!req.session || !req.session.employee) return res.redirect('/login');
  next();
};

router.get("/",            auth, controller.getAttendance);
router.post("/mark",       auth, controller.markAttendance);
router.get("/my",          auth, controller.getMyAttendance);
router.get("/employee/:id", auth, controller.getEmployeeAttendance);

module.exports = router;