// notification microservice
const { connectRabbitMQ } = require("../config/rabbitmq");
const { consumeQueue } = require("../utils/consumeQueue");
const productConsumer = require("./productConsumer");
const orderConsumer = require("./orderConsumer");
const authConsumer = require("./authConsumer");
const userSyncConsumer = require("./userSyncConsumer");
const paymentConsumer = require("./paymentConsumer");

let channel;

const initConsumer = async () => {
  try {
    channel = await connectRabbitMQ();

    const queues = [
      "product_events_for_notifications",
      "order_events_for_notifications",
      "auth_events",
      "user_data_sync",
	  "payment_events_for_notifications"
	  
    ];
    await Promise.all(queues.map(queue => channel.assertQueue(queue, { durable: true })));

    consumeQueue(channel, "product_events_for_notifications", productConsumer);
    consumeQueue(channel, "order_events_for_notifications", orderConsumer);
    consumeQueue(channel, "auth_events", authConsumer);
    consumeQueue(channel, "user_data_sync", userSyncConsumer);
	consumeQueue(channel, "payment_events_for_notifications", paymentConsumer);
  } catch (error) {
    console.error("Error initializing RabbitMQ consumer:", error.message);
  }
};

module.exports = { initConsumer };
