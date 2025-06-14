const mongoose = require("mongoose");

const ProductEventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  productId: String,
  title: String,
  description: String,
  category: String,
  categoryId: String,
  price: Number,
  quantity: Number,
  image: String,
  imageId: String,
  sellerId: String,
  createdAt: Date,
  updatedAt: Date,
});

module.exports = mongoose.model("ProductEvent", ProductEventSchema);
