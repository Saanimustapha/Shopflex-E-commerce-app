const consumeQueue = (channel, queue, handler) => {
  channel.consume(queue, async (msg) => {
    const event = JSON.parse(msg.content.toString());
    console.log(`Received event from ${queue}:`, event);

    try {
      await handler(event);
      channel.ack(msg);
    } catch (error) {
      console.error(`Error handling event from ${queue}:`, error.message);
      channel.nack(msg, false, false);
    }
  });
};

module.exports = { consumeQueue };
