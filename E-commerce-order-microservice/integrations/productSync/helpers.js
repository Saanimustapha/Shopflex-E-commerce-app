const populateProductCacheData = (product) => ({
  title: product.title,
  description: product.description,
  category_id: product.category_id ? product.category_id._id.toString() : null,
  category: product.category_id ? product.category_id.name : null,
  price: product.price,
  quantity: product.quantity,
  image: product.image,
  seller: product.seller,
  updatedAt: new Date(),
});

const performInitialSync = async (ProductModel, CategoryModel, ProductCache) => {
  const products = await ProductModel.find().populate('category_id');
  for (const product of products) {
    const cacheData = populateProductCacheData(product);
    await ProductCache.updateOne({ _id: product._id }, { $set: cacheData }, { upsert: true });
  }
};

const handleCacheSync = async (operation) => {
  try {
    await operation();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  populateProductCacheData,
  performInitialSync,
  handleCacheSync,
};
