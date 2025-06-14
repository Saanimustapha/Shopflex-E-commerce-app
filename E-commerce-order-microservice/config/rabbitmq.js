const amqp = require('amqplib');

let connection, channel;

const connectRabbitMQ = async () => {
  try {
    if (!connection || !channel) {
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();

      console.log('RabbitMQ connected in Order Microservice');

      await channel.assertQueue('order_events_for_notifications', { durable: true });
      await channel.assertQueue('update_inventory', { durable: true });
      await channel.assertQueue('payment_status_updates', { durable: true });
    }

    return { channel, connection };
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err.message);
    throw err;
  }
};

const sendMessage = async (queue, message) => {
  try {
    const { channel } = await connectRabbitMQ();

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

    console.log(`Message sent to ${queue}:`, message);
  } catch (err) {
    console.error(`Failed to send message to ${queue}:`, err.message);
  }
};

const consumeMessage = async (queue, callback) => {
  try {
    const { channel } = await connectRabbitMQ();

    await channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const messageContent = JSON.parse(msg.content.toString());
          console.log(`Received message from ${queue}:`, messageContent);
          await callback(messageContent);
          channel.ack(msg); // Acknowledge message after successful processing
        } catch (err) {
          console.error(`Error processing message from ${queue}:`, err.message);
          channel.nack(msg); // Negative acknowledgment
        }
      }
    });

    console.log(`Listening for messages on queue: ${queue}`);
  } catch (err) {
    console.error(`Failed to consume messages from ${queue}:`, err.message);
  }
};

module.exports = { connectRabbitMQ, sendMessage, consumeMessage };
