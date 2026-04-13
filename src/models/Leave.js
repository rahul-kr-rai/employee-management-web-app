const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, trim: true },
  type: { type: String, enum: ['Sick', 'Casual', 'Annual', 'Other'], default: 'Casual' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reviewComment: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
