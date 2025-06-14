const mongoose = require("mongoose");

const OrderEventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  orderId: String,
  userId: String,
  totalProducts: Number,
  productIds: [String],
  quantities: [Number],
  sellerIds: [String],
  titles: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OrderEvent", OrderEventSchema);
