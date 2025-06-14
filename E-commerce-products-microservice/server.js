require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { syncWithProductDb } = require('./integrations/dbSync');
const { consumeInventoryUpdate } = require("./events/consumeInventoryUpdate");
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const imageRouter = require('./routes/imageRoutes');

const app = express();
app.use(express.json());
app.use('/products', productRoutes);
app.use('/category', categoryRoutes);
app.use('/images', imageRouter);

app.get('/alive', (req, res) => {
  res.status(200).json({ message: 'Products service is alive' });
});

const startServices = async () => {
  try {
    await connectDB();
	
    await connectRabbitMQ();
    consumeInventoryUpdate();
	
    syncWithProductDb();
	
  } catch (error) {
    console.error('Error during service initialization:', error.message);
    process.exit(1);
  }
};

const startServer = async () => {
  await startServices();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
