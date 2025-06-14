const OrderEvent = require("../models/OrderEvent");
const { handleOrderEvents } = require("../handlers/orderHandler");

module.exports = async (event) => {
  try {
	const data = event.data;
    await OrderEvent.create({
      eventType: event.type,
      orderId: data.orderId,
      userId: data.userId,
      totalProducts: data.totalProducts,
      productIds: data.productIds,
      quantities: data.quantities,
      sellerIds: data.sellerIds,
      titles: data.titles,
    });
    await handleOrderEvents(event);
  } catch (error) {
    console.error("Error in orderConsumer:", error.message);
  }
};
