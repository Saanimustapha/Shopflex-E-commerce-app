require('dotenv').config();
const express = require("express");
const { connectRabbitMQ } = require("./config/rabbitmq");
const { connectOrderDB } = require("./config/db");
const syncProductCache = require("./integrations/productSync/syncService");
const { initializeAndSyncProducts } = require('./integrations/elasticsearchSync');
const orderRouter = require("./routes/orderRouter");
const productRouter = require("./routes/productRouter");
const imageRouter = require('./routes/imageRoutes');
const orderConsumer = require('./consumers/consume_payment_status');
const { consumeMessage } = require('./config/rabbitmq');

const app = express();
app.use(express.json());

// Routes
app.use("/orders", orderRouter);
app.use("/products", productRouter);
app.use('/images', imageRouter);

app.get('/alive', (req, res) => {
  res.status(200).json({ message: 'Orders service is alive' });
});

const startServices = async () => {
  try {
    connectOrderDB();
    await syncProductCache();
    await connectRabbitMQ();
    await initializeAndSyncProducts();
  } catch (error) {
    console.error("Failed to start services:", error.message);
    process.exit(1);
  }
};

(async () => {
  await consumeMessage('payment_status_updates', orderConsumer);
})();

const startServer = async () => {
  await startServices();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
  });
};

startServer();
