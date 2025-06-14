const mongoose = require('mongoose');

const initializeModels = () => {
  const productDB = mongoose.createConnection(process.env.MONGO_URI_PRODUCT);

  const ProductModel = productDB.model('Product', new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
    seller: {
      id: { type: String, required: true },
    },
  }));

  const CategoryModel = productDB.model('Category', new mongoose.Schema({
    name: { type: String, required: true },
  }));

  return { ProductModel, CategoryModel };
};

module.exports = { initializeModels };
