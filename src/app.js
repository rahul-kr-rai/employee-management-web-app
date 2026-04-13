require("dotenv").config();
const express  = require("express");
const path     = require("path");
const session  = require("express-session");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(session({
  secret: process.env.SESSION_SECRET || 'ems-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Routes
app.get("/", (req, res) => res.render("landing"));
app.use("/employees",   require("./routes/employeeRoutes"));
app.use("/",            require("./routes/authRoutes"));
app.use("/departments", require("./routes/departmentRoutes"));
app.use("/attendance",  require("./routes/attendanceRoutes"));
app.use("/leaves",      require("./routes/leaveRoutes"));

// 404 handler
app.use((req, res) => res.status(404).send('<h2>404 — Page Not Found</h2><a href="/">Go Home</a>'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));