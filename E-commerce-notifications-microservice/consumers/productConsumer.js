const ProductEvent = require("../models/ProductEvent");
const { handleProductEvents } = require("../handlers/productHandler");


module.exports = async (event) => {
  try {
    const data = event.data;
    await ProductEvent.create({
      eventType: event.type,
	  productId: event._id,
      title: data.title,
      description: data.description,
      category: data.category,
      categoryId: data.category_id,
      price: data.price,
      quantity: data.quantity,
      image: data.image,
      imageId: data.imageId,
      sellerId: data.seller.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    await handleProductEvents(event);
  } catch (error) {
    console.error("Error in productConsumer:", error.message);
  }
};
