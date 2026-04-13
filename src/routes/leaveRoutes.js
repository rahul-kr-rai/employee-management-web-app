const express    = require("express");
const router     = express.Router();
const Leave      = require("../models/Leave");
const controller = require("../controllers/leaveController");

const auth = (req, res, next) => {
  if (!req.session || !req.session.employee) return res.redirect('/login');
  next();
};

router.get("/",             auth, controller.getLeaves);
router.post("/request",     auth, controller.requestLeave);
router.post("/review/:id",  auth, controller.reviewLeave);
router.post("/delete/:id",  auth, controller.deleteLeave);

module.exports = router;
