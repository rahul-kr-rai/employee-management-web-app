const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  department: String,
  position: String,
  salary: Number,
  joinDate: { type: Date, default: Date.now },
  role: { type: String, enum: ['dean', 'hod', 'faculty'], default: 'faculty' },
  password: { type: String, required: true }
});

module.exports = mongoose.model("Employee", employeeSchema);