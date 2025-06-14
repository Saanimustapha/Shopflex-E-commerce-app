const OrderEvent = require("../models/OrderEvent");
const { sendEmail } = require("../config/emailProvider");
const { fetchUserDetails } = require("../utils/fetchUserDetails");
const getProductQuantityFromES = require('../elastic/getProductQuantityFromES');

const handlePaymentEvent = async (paymentEvent) => {
  try {
    const { orderId, paymentStatus, amount, paymentMethod, customerEmail, message } = paymentEvent;

    // Fetch order details from the database
    const orderDetails = await OrderEvent.findOne({ orderId });
    if (!orderDetails) {
      console.error(`Order with ID ${orderId} not found.`);
      return;
    }

    // Notify sellers about the payment
    const sellerPromises = orderDetails.sellerIds.map(async (sellerId, index) => {
      const sellerDetails = await fetchUserDetails(sellerId);
      const remainingQuantity = await getProductQuantityFromES(orderDetails.titles[index]);

      if (sellerDetails) {
        const sellerMessage = `
          <p style="font-family: Arial, sans-serif; color: #333;">
            Hi <b>${sellerDetails.username}</b>,
          </p>
          <p>The payment for your product has been confirmed:</p>
          <ul style="list-style-type: none; padding: 0;">
            <li><b>Product:</b> ${orderDetails.titles[index]}</li>
            <li><b>Quantity:</b> ${orderDetails.quantities[index]}</li>
            <li><b>Remaining Stock:</b> ${remainingQuantity || "Unknown"}</li>
            <li><b>Payment Method:</b> ${paymentMethod}</li>
            <li><b>Amount Paid:</b> ${amount} currency units</li>
          </ul>
          <p>Please proceed with fulfilling this order. Thank you!</p>
        `;
        await sendEmail(
          sellerDetails.email,
          "Payment Confirmed",
          `Payment confirmed for "${orderDetails.titles[index]}"`,
          sellerMessage
        );
      }
    });

    // Notify the user about the payment confirmation and show full order content
    const userDetails = await fetchUserDetails(orderDetails.userId);
    if (userDetails) {
      const productList = orderDetails.titles.map((title, index) => {
        return `
          <li>
            <b>Product:</b> ${title} <br />
            <b>Quantity:</b> ${orderDetails.quantities[index]} <br />
          </li>`;
      }).join("");

      const userMessage = `
        <p style="font-family: Arial, sans-serif; color: #333;">
          Hi <b>${userDetails.username}</b>,
        </p>
        <p>Your payment has been confirmed:</p>
        <ul>
          ${productList}
        </ul>
        <p><b>Payment Details:</b></p>
        <ul>
          <li><b>Amount Paid:</b> ${amount}</li>
          <li><b>Payment Method:</b> ${paymentMethod}</li>
          <li><b>Status:</b> ${paymentStatus}</li>
        </ul>
        <p>Thank you for shopping with us!</p>
      `;
      await sendEmail(
        customerEmail || userDetails.email,
        "Payment Confirmed",
        `Your payment for order ${orderId} has been confirmed.`,
        userMessage
      );
    }

    // Wait for all seller emails to be sent
    await Promise.all(sellerPromises);

    console.log("Payment notifications sent successfully.");
  } catch (error) {
    console.error("Error handling payment event:", error.message);
  }
};

module.exports = { handlePaymentEvent };
