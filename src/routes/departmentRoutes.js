const express = require("express");
const router = express.Router();
const controller = require("../controllers/departmentController");

function ensureLoggedIn(req, res, next) {
  if (!req.session || !req.session.employee) {
    return res.redirect("/login");
  }
  next();
}

router.get("/",                ensureLoggedIn, controller.getDepartments);
router.get("/:id/members",     ensureLoggedIn, controller.getDepartmentMembers);
router.get("/:id/add-member",  ensureLoggedIn, controller.getAddMemberPage);
router.post("/add",            ensureLoggedIn, controller.addDepartment);
router.post("/update/:id", ensureLoggedIn, controller.updateDepartment);
router.post("/delete/:id", ensureLoggedIn, controller.deleteDepartment);

module.exports = router;