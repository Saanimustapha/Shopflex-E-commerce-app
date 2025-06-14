const ProductCache = require("../models/productCacheModel");


const validateProductsAndCalculateTotal = async (products) => {
  let totalAmount = 0;
  const productDetails = [];
  const inventoryUpdates = [];
  let productCount = 0;

  for (const product of products) {
    const productRecord = await ProductCache.findById(product.productId);
    if (!productRecord) {
      throw new Error(`Product with ID ${product.productId} not found`);
    }

    if (productRecord.quantity < product.quantity) {
      throw new Error(`Insufficient quantity for product ${productRecord.title}`);
    }

    productDetails.push({
      productId: product.productId,
      quantity: product.quantity,
      title: productRecord.title,
      sellerId: productRecord.seller.id,
    });

    inventoryUpdates.push({
      productId: product.productId,
      quantity: -product.quantity, 
    });

    totalAmount += product.quantity * productRecord.price;
    productCount += product.quantity;
  }

  return { totalAmount, productDetails, inventoryUpdates, productCount };
};


module.exports = { validateProductsAndCalculateTotal };