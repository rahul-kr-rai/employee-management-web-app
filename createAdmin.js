const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Employee = require("./src/models/Employee");

async function createAdmin() {
  try {
    // Connect to MongoDB using the same URI as the main app
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/employeesDB";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB:", mongoUri);

    // Check if admin already exists
    const existingAdmin = await Employee.findOne({ employeeId: "DEAN001" });
    if (existingAdmin) {
      console.log("Dean user already exists!");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("dean123", 10);

    // Create dean user
    const admin = new Employee({
      employeeId: "DEAN001",
      name: "Dean of Engineering",
      email: "dean@college.com",
      phone: "+1234567890",
      department: "Engineering",
      position: "Dean",
      salary: 100000,
      role: "dean",
      password: hashedPassword
    });

    await admin.save();
    console.log("Dean user created successfully!");
    console.log("Employee ID: DEAN001");
    console.log("Password: dean123");
    console.log("Please change the password after first login.");

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

createAdmin();