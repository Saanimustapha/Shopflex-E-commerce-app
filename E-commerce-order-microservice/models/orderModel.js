const mongoose = require('mongoose');
const ProductCache = require('./productCacheModel');

const orderSchema = new mongoose.Schema(
  {
    user: {
      id: { type: String, required: true },
      profileUrl: { type: String },
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCache', required: true },
        quantity: { type: Number, required: true },
        status: {
          type: String,
          enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
          default: 'Pending',
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
	paymentStatus: {
	  type: String,
	  enum: ['pending', 'processing', 'success', 'failed', 'abandoned', 'ongoing', 'queued'],
	  default: 'pending'
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
