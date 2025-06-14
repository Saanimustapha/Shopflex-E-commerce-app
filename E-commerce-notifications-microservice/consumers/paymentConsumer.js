const PaymentEvent = require("../models/PaymentEvent");
const { handlePaymentEvent } = require("../handlers/paymentHandler");

module.exports = async (event) => {
  try {
	const data = event;
    await PaymentEvent.create({
      orderId: data.orderId,
      paymentStatus: data.paymentStatus,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      customerEmail: data.customerEmail,
      message: data.message,
    });
    await handlePaymentEvent(event);
  } catch (error) {
    console.error("Error in paymentConsumer:", error.message);
  }
};
