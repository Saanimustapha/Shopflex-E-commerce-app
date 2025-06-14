const mongoose = require("mongoose");

const PaymentEventSchema = new mongoose.Schema({
  orderId: String,
  paymentStatus: String,
  amount: Number,
  paymentMethod: String,
  customerEmail: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PaymentEvent", PaymentEventSchema);
