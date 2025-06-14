const Order = require("../models/orderModel");

/**
 * Consumer function to update the order payment status.
 * @param {Object} message - The message received from the queue.
 */
const orderConsumer = async (message) => {
  try {
    // Extract details from the message
    const { orderId, paymentStatus } = message;
    console.log(`Updating order ${orderId} with paymentStatus: ${paymentStatus}`);

    // Find and update the order payment status
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order with ID ${orderId} not found.`);
      return;
    }

    order.paymentStatus = paymentStatus;
    await order.save();
    console.log(`Order ${orderId} updated successfully.`);
  } catch (error) {
    console.error("Error updating order payment status:", error.message);
  }
};

module.exports = orderConsumer;
